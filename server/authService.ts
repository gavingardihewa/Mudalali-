import crypto from 'crypto';
import type { UserProfile, UserRole } from '../src/types/index.js';

interface InternalProfileRecord extends UserProfile {
  pinHash: string;
  demoPin: string;
}

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || 'mudalali-sme-os-secret-2026';

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(`mudalali_salt_${pin}`).digest('hex');
}

// Profiles ordered strictly as: 1. Accountant, 2. Mudalali
const PROFILE_RECORDS: InternalProfileRecord[] = [
  {
    id: 'profile-accountant',
    role: 'accountant',
    displayName: 'Accountant',
    sinhalaTitle: 'ගණකාධිකාරී',
    tamilTitle: 'கணக்காளர்',
    subtitle: 'Ledger Audit, Tax / VAT, PDC Reconciliation & Payables',
    sinhalaSubtitle: 'ගිණුම් පරීක්ෂාව, බදු, චෙක්පත් සහ සැපයුම්කරු ගෙවීම්',
    tamilSubtitle: 'கணக்கு தணிக்கை, வரி, காசோலை & சப்ளையர் கொடுப்பனவு',
    accessScope: [
      'Trial Balance & Working Capital Audit',
      'Cheque / PDC Clearing & Dishonor Tracking',
      'Supplier Invoices, Deadlines & Settlements',
      'Podi Potha Drawer Discrepancy Reconciliation',
      'Naya & Wara Ledger Compliance'
    ],
    permissions: {
      canViewExecutiveAnalytics: true,
      canApproveCreditOverrides: false,
      canEditAccountingAudits: true,
      canCloseDrawer: true,
      canResetSystemData: false,
      canManageSuppliers: true
    },
    demoPin: '1234',
    pinHash: hashPin('1234')
  },
  {
    id: 'profile-mudalali',
    role: 'mudalali',
    displayName: 'Mudalali',
    sinhalaTitle: 'මුදලාලි (හිමිකරු)',
    tamilTitle: 'முதலாளி (உரிமையாளர்)',
    subtitle: 'Executive Proprietor, Multi-Branch Command & Strategic AI',
    sinhalaSubtitle: 'ව්‍යාපාර හිමිකරු, ශාඛා පාලනය සහ විධායක තීරණ',
    tamilSubtitle: 'வணிக உரிமையாளர், கிளை நிர்வாகம் & மூலோபாய ஆலோசனை',
    accessScope: [
      'Full Multi-Branch Command Center',
      'Purchase Affordability & Cash Stress Testing',
      'Executive AI Advisor & Margin Strategy',
      'Credit Limit Overrides & POS Billing',
      'Inter-Branch Transfers & System Controls'
    ],
    permissions: {
      canViewExecutiveAnalytics: true,
      canApproveCreditOverrides: true,
      canEditAccountingAudits: true,
      canCloseDrawer: true,
      canResetSystemData: true,
      canManageSuppliers: true
    },
    demoPin: '8888',
    pinHash: hashPin('8888')
  }
];

function toPublicProfile(record: InternalProfileRecord): UserProfile {
  const { pinHash: _pinHash, demoPin: _demoPin, ...publicProfile } = record;
  return publicProfile;
}

export function getPublicProfiles(): { profile: UserProfile; defaultPinHint: string }[] {
  return PROFILE_RECORDS.map(record => ({
    profile: toPublicProfile(record),
    defaultPinHint: record.demoPin
  }));
}

export function signSessionToken(profile: UserProfile): string {
  const payload = {
    sub: profile.id,
    role: profile.role,
    displayName: profile.displayName,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): UserProfile | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;

    const match = PROFILE_RECORDS.find(r => r.role === payload.role);
    return match ? toPublicProfile(match) : null;
  } catch {
    return null;
  }
}

export function authenticateProfile(
  role: UserRole,
  pin?: string,
  quickDemoLogin?: boolean
): { success: boolean; profile?: UserProfile; token?: string; error?: string } {
  const record = PROFILE_RECORDS.find(p => p.role === role);
  if (!record) {
    return { success: false, error: 'Selected login profile does not exist.' };
  }

  if (quickDemoLogin) {
    const profile = toPublicProfile(record);
    return {
      success: true,
      profile,
      token: signSessionToken(profile)
    };
  }

  if (!pin || typeof pin !== 'string') {
    return { success: false, error: 'Please enter the profile PIN code.' };
  }

  const incomingHash = hashPin(pin.trim());
  if (incomingHash !== record.pinHash) {
    return {
      success: false,
      error: `Invalid PIN for ${record.displayName}. (Hint: ${record.demoPin})`
    };
  }

  const profile = toPublicProfile(record);
  return {
    success: true,
    profile,
    token: signSessionToken(profile)
  };
}
