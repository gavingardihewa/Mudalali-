import { Language } from '../types';

export const formatLKR = (amount: number, showDecimal: boolean = false): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: showDecimal ? 2 : 0,
    maximumFractionDigits: showDecimal ? 2 : 0
  })
    .format(amount)
    .replace('LKR', 'Rs.');
};

export const cleanPhoneForWhatsApp = (phone: string): string => {
  // Strip non-digits
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('94')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return '94' + digits.slice(1);
  }
  return '94' + digits;
};

export const getSinhalaReminderText = (customerName: string, amount: number, dueDate: string, storeName: string): string => {
  return `ගෞරවනීය ${customerName} මහතාණනි / මියනි,\n\nඔබගේ ${storeName} ආයතනයේ ගිණුමේ හිඟ මුදල වන රු. ${amount.toLocaleString('en-US')} ගෙවීමේ දින නියමය ${dueDate} වේ.\nකරුණාකර හැකි ඉක්මණින් ගෙවීම සිදු කර අපට සහය වන්න.\n\nස්තූතියි!\n${storeName}`;
};

export const getSinglishReminderText = (customerName: string, amount: number, dueDate: string, storeName: string): string => {
  return `Gaurawanwitha ${customerName},\nObage ${storeName} aayathanaye higa mudala wana Rs. ${amount.toLocaleString('en-US')} gewiya yuthu dhinaya ${dueDate} we. Karunakarala adha dhinaye ho lagama shaakawata paminila gewima sidhu karanna.\n\nSthuthi!\n${storeName}`;
};

export const getEnglishReminderText = (customerName: string, amount: number, dueDate: string, storeName: string): string => {
  return `Dear ${customerName},\nThis is a gentle payment reminder from ${storeName}. Your outstanding instalment/credit balance of Rs. ${amount.toLocaleString('en-US')} is due on ${dueDate}. Kindly arrange the settlement at your earliest convenience.\n\nThank you,\n${storeName}`;
};

export const getTamilReminderText = (customerName: string, amount: number, dueDate: string, storeName: string): string => {
  return `அன்பார்ந்த ${customerName} அவர்களுக்கு,\n\nஉங்கள் ${storeName} நிறுவன கணக்கின் நிலுவைத் தொகையான ரூ. ${amount.toLocaleString('en-US')} செலுத்துவதற்கான இறுதித் திகதி ${dueDate} ஆகும்.\nதயவுசெய்து விரைவில் பணத்தைச் செலுத்தி ஒத்துழைப்பு வழங்குமாறு அன்புடன் கேட்டுக்கொள்கிறோம்.\n\nநன்றி!\n${storeName}`;
};

export const getCustomerReminderText = (
  lang: Language | 'singlish',
  customerName: string,
  amount: number,
  dueDate: string,
  storeName: string
): string => {
  if (lang === 'si') return getSinhalaReminderText(customerName, amount, dueDate, storeName);
  if (lang === 'ta') return getTamilReminderText(customerName, amount, dueDate, storeName);
  if (lang === 'singlish') return getSinglishReminderText(customerName, amount, dueDate, storeName);
  return getEnglishReminderText(customerName, amount, dueDate, storeName);
};

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    pos: 'Point of Sale',
    naya: 'Credit Book (Naya)',
    wara: 'Instalment Book (Wara)',
    inventory: 'Physical Stock',
    cheques: 'Cheques & PDCs',
    transfers: 'Branch Transfers',
    drawer: 'Day-End Drawer',
    allBranches: 'All Branches (Consolidated)',
    todaySales: "Today's Total Sales",
    cashInHand: 'Cash in Drawer',
    outstandingCredit: 'Total Outstanding Credit',
    overdueInstalments: 'Overdue Instalments',
    chequesMaturing: 'Cheques Maturing Soon',
    lowStockNotice: 'Low Stock Alerts',
    searchPlaceholder: 'Search products by name or code...',
    addToCart: 'Add to Bill',
    checkout: 'Complete Sale',
    recordPayment: 'Record Payment',
    newDebtor: 'New Credit Customer',
    newPlan: 'New Instalment Plan',
    transferStock: 'Transfer Stock',
    addStock: 'Adjust Stock',
    reminder: 'WhatsApp Reminder'
  },
  si: {
    dashboard: 'පාලක පුවරුව',
    pos: 'කඩේ බිල (POS)',
    naya: 'ණය පොත (Naya Potha)',
    wara: 'වාරික පොත (Wara Potha)',
    inventory: 'භාණ්ඩ තොගය',
    cheques: 'චෙක්පත් (PDC)',
    transfers: 'ශාඛා මාරු',
    drawer: 'දවසේ මුදල් පෙට්ටිය',
    allBranches: 'සියලු ශාඛා එක්ව (Consolidated)',
    todaySales: 'අද දින මුළු ආදායම',
    cashInHand: 'ලාච්චුවේ මුදල්',
    outstandingCredit: 'ලැබිය යුතු මුළු ණය',
    overdueInstalments: 'ප්‍රමාද වූ වාරික',
    chequesMaturing: 'ළඟදීම මුදල් වන චෙක්පත්',
    lowStockNotice: 'අඩු තොග අනතුරු ඇඟවීම්',
    searchPlaceholder: 'භාණ්ඩ නම හෝ කේතය සොයන්න...',
    addToCart: 'බිලට එක්කරන්න',
    checkout: 'බිල අවසන් කරන්න',
    recordPayment: 'මුදල් ලබාගැනීම',
    newDebtor: 'නව ණය ගැතියා',
    newPlan: 'නව වාරික සැලැස්ම',
    transferStock: 'තොග යවන්න',
    addStock: 'තොග වෙනස් කරන්න',
    reminder: 'වට්ස්ඇප් මතක්කිරීම'
  },
  ta: {
    dashboard: 'டாஷ்போர்டு',
    pos: 'விற்பனை முனை (POS)',
    naya: 'கடன் புத்தகம் (Naya)',
    wara: 'தவணை முறை (Wara)',
    inventory: 'பொருட்கள் இருப்பு',
    cheques: 'காசோலைகள் (PDC)',
    transfers: 'கிளை மாற்றங்கள்',
    drawer: 'தினசரி பணப் பெட்டி',
    allBranches: 'அனைத்து கிளைகள்',
    todaySales: 'இன்றைய மொத்த விற்பனை',
    cashInHand: 'கையிருப்பு பணம்',
    outstandingCredit: 'பாக்கி கடன் தொகை',
    overdueInstalments: 'நிலுவை தவணைகள்',
    chequesMaturing: 'முதிர்வு காசோலைகள்',
    lowStockNotice: 'குறைந்த இருப்பு எச்சரிக்கை',
    searchPlaceholder: 'பொருட்களை தேடவும்...',
    addToCart: 'பில்லில் சேர்',
    checkout: 'பில் முடிக்கவும்',
    recordPayment: 'பணம் பதிவு செய்',
    newDebtor: 'புதிய கடன் வாடிக்கையாளர்',
    newPlan: 'புதிய தவணை திட்டம்',
    transferStock: 'பங்கு மாற்றம்',
    addStock: 'இருப்பு திருத்தவும்',
    reminder: 'வாட்ஸ்அப் நினைவூட்டல்'
  }
};
