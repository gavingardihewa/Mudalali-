import { Branch, Product, CreditCustomer, InstalmentPlan, Cheque, DailyExpense, Supplier } from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'pettah',
    name: 'Pettah Wholesale & Main Hub',
    sinhalaName: 'පිටකොටුව ප්‍රධාන ශාඛාව (තොග)',
    address: 'No. 88, 4th Cross Street, Pettah, Colombo 11',
    phone: '011-2321456 / 077-7123456',
    manager: 'M. M. Farook (Senior Mudalali)'
  },
  {
    id: 'kandy',
    name: 'Kandy Central Showroom',
    sinhalaName: 'මහනුවර ප්‍රදර්ශනාගාරය',
    address: 'No. 42, Dalada Veediya, Kandy',
    phone: '081-2234567 / 071-8901234',
    manager: 'Upul Wijeratne'
  },
  {
    id: 'negombo',
    name: 'Negombo Retail Outlet',
    sinhalaName: 'මීගමුව ශාඛාව',
    address: 'No. 115, Main Street, Negombo',
    phone: '031-2298765 / 076-4567890',
    manager: 'Rohan Fernando'
  },
  {
    id: 'galle',
    name: 'Galle Fort Store',
    sinhalaName: 'ගාල්ල ශාඛාව',
    address: 'No. 18, Havelock Place, Galle',
    phone: '091-2244556 / 070-1239876',
    manager: 'Chaminda Silva'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'ELEC-RF-01',
    name: 'Singer 180L Double Door Refrigerator',
    sinhalaName: 'සිංගර් 180L ශීතකරණය',
    category: 'Electronics & Appliances',
    costPrice: 118000,
    wholesalePrice: 132000,
    retailPrice: 145000,
    unit: 'pcs',
    stocks: {
      pettah: 8,
      kandy: 4,
      negombo: 3,
      galle: 2
    },
    minStockLevel: 3,
  },
  {
    id: 'prod-2',
    code: 'ELEC-TV-43',
    name: 'Innovex 43" Smart Android FHD LED TV',
    sinhalaName: 'ඉනොවෙක්ස් 43" ස්මාර්ට් LED ටීවී',
    category: 'Electronics & Appliances',
    costPrice: 69000,
    wholesalePrice: 79000,
    retailPrice: 89500,
    unit: 'pcs',
    stocks: {
      pettah: 14,
      kandy: 6,
      negombo: 2, // low stock!
      galle: 5
    },
    minStockLevel: 4
  },
  {
    id: 'prod-3',
    code: 'ELEC-WM-07',
    name: 'Singer 7.5kg Fully Auto Washing Machine',
    sinhalaName: 'සිංගර් 7.5kg රෙදි සෝදන යන්ත්‍රය',
    category: 'Electronics & Appliances',
    costPrice: 82000,
    wholesalePrice: 94000,
    retailPrice: 104000,
    unit: 'pcs',
    stocks: {
      pettah: 6,
      kandy: 2,
      negombo: 1, // critical low
      galle: 3
    },
    minStockLevel: 3
  },
  {
    id: 'prod-4',
    code: 'ELEC-FAN-16',
    name: 'KDK 16" Stand Fan with Remote',
    sinhalaName: 'KDK ස්ටෑන්ඩ් ෆෑන්',
    category: 'Electronics & Appliances',
    costPrice: 19500,
    wholesalePrice: 22000,
    retailPrice: 25500,
    unit: 'pcs',
    stocks: {
      pettah: 28,
      kandy: 12,
      negombo: 8,
      galle: 6
    },
    minStockLevel: 10
  },
  {
    id: 'prod-5',
    code: 'HARD-CBL-729',
    name: 'Kelani 7/0.29 Pure Copper Wire Coil (100m)',
    sinhalaName: 'කැළණි 7/0.29 වයර් රෝල (100m)',
    category: 'Hardware & Electrical',
    costPrice: 19800,
    wholesalePrice: 22500,
    retailPrice: 24800,
    unit: 'pcs',
    stocks: {
      pettah: 35,
      kandy: 15,
      negombo: 10,
      galle: 8
    },
    minStockLevel: 12
  },
  {
    id: 'prod-6',
    code: 'HARD-SW-ORG',
    name: 'Orange Electric Double Power Socket 13A',
    sinhalaName: 'ඔරේන්ජ් 13A ද්විත්ව සොකට්',
    category: 'Hardware & Electrical',
    costPrice: 1100,
    wholesalePrice: 1280,
    retailPrice: 1480,
    unit: 'pcs',
    stocks: {
      pettah: 120,
      kandy: 45,
      negombo: 30,
      galle: 25
    },
    minStockLevel: 25
  },
  {
    id: 'prod-7',
    code: 'GROC-DAL-25',
    name: 'Mysore Red Dhal (Parippu) 25kg Sack',
    sinhalaName: 'මයිසූර් රතු පරිප්පු 25kg මිටිය',
    category: 'Groceries & Provisions',
    costPrice: 6900,
    wholesalePrice: 7400,
    retailPrice: 7950,
    unit: 'box',
    stocks: {
      pettah: 60,
      kandy: 18,
      negombo: 12,
      galle: 8
    },
    minStockLevel: 15
  },
  {
    id: 'prod-8',
    code: 'GROC-MILK-400',
    name: 'Anchor Full Cream Milk Powder 400g Pkt',
    sinhalaName: 'ඇන්කර් කිරිපිටි 400g',
    category: 'Groceries & Provisions',
    costPrice: 1060,
    wholesalePrice: 1120,
    retailPrice: 1180,
    unit: 'pkt',
    stocks: {
      pettah: 150,
      kandy: 40,
      negombo: 35,
      galle: 20
    },
    minStockLevel: 30
  },
  {
    id: 'prod-9',
    code: 'TEXT-SAR-BTK',
    name: 'Handloom Batik Pure Cotton Sarong (Gents)',
    sinhalaName: 'අත්යන්ත්‍ර බතික් සරම',
    category: 'Textiles & Garments',
    costPrice: 1950,
    wholesalePrice: 2350,
    retailPrice: 2850,
    unit: 'pcs',
    stocks: {
      pettah: 85,
      kandy: 30,
      negombo: 25,
      galle: 40
    },
    minStockLevel: 20
  },
  {
    id: 'prod-10',
    code: 'AUTO-BAJ-CLT',
    name: 'Bajaj Genuine Three-Wheeler Clutch Cable Box',
    sinhalaName: 'බජාජ් ත්‍රිරෝද ක්ලච් කේබල් පෙට්ටිය',
    category: 'Automotive & Spares',
    costPrice: 1650,
    wholesalePrice: 1950,
    retailPrice: 2300,
    unit: 'pcs',
    stocks: {
      pettah: 40,
      kandy: 15,
      negombo: 18,
      galle: 10
    },
    minStockLevel: 10
  }
];

export const INITIAL_CREDIT_CUSTOMERS: CreditCustomer[] = [
  {
    id: 'cust-1',
    name: 'Bandara & Sons Electricals',
    sinhalaName: 'බණ්ඩාර සහ පුත්‍රයෝ',
    phone: '077-3456789',
    nicNumber: '792140552V',
    address: 'No. 34, Kurunegala Road, Kandy',
    branchId: 'kandy',
    creditLimit: 250000,
    totalOutstanding: 142500,
    creditScoreTrust: 'Watchlist',
    createdAt: '2026-08-10',
    lastPaymentDate: '2026-10-12',
    transactions: [
      {
        id: 'tx-101',
        date: '2026-09-15',
        type: 'sale',
        amount: 85000,
        referenceNo: 'INV-2026-0912',
        note: 'Kelani cables & Orange switches bulk purchase',
        balanceAfter: 85000
      },
      {
        id: 'tx-102',
        date: '2026-09-28',
        type: 'sale',
        amount: 92500,
        referenceNo: 'INV-2026-0988',
        note: '43 inch TV for client hotel project',
        balanceAfter: 177500
      },
      {
        id: 'tx-103',
        date: '2026-10-12',
        type: 'payment',
        amount: 35000,
        referenceNo: 'REC-2026-0441',
        note: 'Cash settlement through Upul manager',
        balanceAfter: 142500
      }
    ]
  },
  {
    id: 'cust-2',
    name: 'Mohomed Rizwan (Rizwan Stores)',
    sinhalaName: 'රිස්වාන් ස්ටෝර්ස් (පිටකොටුව)',
    phone: '071-8899001',
    nicNumber: '198512304910',
    address: 'Shop 14, 5th Cross Street, Pettah',
    branchId: 'pettah',
    creditLimit: 500000,
    totalOutstanding: 215000,
    creditScoreTrust: 'High',
    createdAt: '2026-05-02',
    lastPaymentDate: '2026-11-01',
    transactions: [
      {
        id: 'tx-201',
        date: '2026-10-20',
        type: 'sale',
        amount: 315000,
        referenceNo: 'INV-2026-1102',
        note: 'Dhal 25kg sacks and Anchor milk powder bulk',
        balanceAfter: 315000
      },
      {
        id: 'tx-202',
        date: '2026-11-01',
        type: 'payment',
        amount: 100000,
        referenceNo: 'REC-2026-0512',
        note: 'Commercial Bank transfer via LankaPay CEFT',
        balanceAfter: 215000
      }
    ]
  },
  {
    id: 'cust-3',
    name: 'Samantha Perera (Contractor)',
    sinhalaName: 'සමන්තා පෙරේරා (කොන්ත්‍රාත්කරු)',
    phone: '076-2233445',
    nicNumber: '826740119V',
    address: 'Temple Road, Kochchikade, Negombo',
    branchId: 'negombo',
    creditLimit: 100000,
    totalOutstanding: 68400,
    creditScoreTrust: 'Medium',
    createdAt: '2026-09-01',
    lastPaymentDate: '2026-10-24',
    transactions: [
      {
        id: 'tx-301',
        date: '2026-10-10',
        type: 'sale',
        amount: 88400,
        referenceNo: 'INV-2026-1055',
        note: 'Kelani wire coils and conduit fittings',
        balanceAfter: 88400
      },
      {
        id: 'tx-302',
        date: '2026-10-24',
        type: 'payment',
        amount: 20000,
        referenceNo: 'REC-2026-0489',
        note: 'Cash payment to Rohan',
        balanceAfter: 68400
      }
    ]
  },
  {
    id: 'cust-4',
    name: 'K. G. Nimal Weerasinghe',
    sinhalaName: 'කේ. ජී. නිමල් වීරසිංහ',
    phone: '070-5544332',
    nicNumber: '751298440V',
    address: 'Main St, Unawatuna, Galle',
    branchId: 'galle',
    creditLimit: 75000,
    totalOutstanding: 42000,
    creditScoreTrust: 'High',
    createdAt: '2026-07-15',
    lastPaymentDate: '2026-10-18',
    transactions: [
      {
        id: 'tx-401',
        date: '2026-10-18',
        type: 'sale',
        amount: 42000,
        referenceNo: 'INV-2026-1199',
        note: 'Sarongs & KDK fans for homestay villa',
        balanceAfter: 42000
      }
    ]
  }
];

export const INITIAL_INSTALMENT_PLANS: InstalmentPlan[] = [
  {
    id: 'hp-001',
    contractNo: 'WARA-KD-2026-088',
    customerName: 'Pradeep Kumara',
    customerPhone: '071-4567890',
    customerNic: '881234567V',
    guarantorName: 'Sunil Shantha (Cousin)',
    guarantorPhone: '077-8899112',
    guarantorNic: '841029384V',
    branchId: 'kandy',
    itemDescription: 'Innovex 43" Smart Android FHD LED TV',
    productCode: 'ELEC-TV-43',
    cashPrice: 89500,
    downPayment: 25000,
    totalHirePrice: 101000,
    monthlyAmount: 7600,
    periodMonths: 10,
    startDate: '2026-06-15',
    collectorName: 'Sunil - Kandy Route Collector',
    status: 'active',
    schedules: [
      { instalmentNumber: 1, dueDate: '2026-07-15', amount: 7600, paidAmount: 7600, paidDate: '2026-07-14', status: 'paid', receiptNo: 'WR-091' },
      { instalmentNumber: 2, dueDate: '2026-08-15', amount: 7600, paidAmount: 7600, paidDate: '2026-08-16', status: 'paid', receiptNo: 'WR-122' },
      { instalmentNumber: 3, dueDate: '2026-09-15', amount: 7600, paidAmount: 7600, paidDate: '2026-09-15', status: 'paid', receiptNo: 'WR-154' },
      { instalmentNumber: 4, dueDate: '2026-10-15', amount: 7600, paidAmount: 7600, paidDate: '2026-10-20', status: 'paid', receiptNo: 'WR-189' },
      { instalmentNumber: 5, dueDate: '2026-11-15', amount: 7600, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 6, dueDate: '2026-12-15', amount: 7600, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 7, dueDate: '2027-01-15', amount: 7600, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 8, dueDate: '2027-02-15', amount: 7600, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 9, dueDate: '2027-03-15', amount: 7600, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 10, dueDate: '2027-04-15', amount: 7600, paidAmount: 0, status: 'pending' }
    ]
  },
  {
    id: 'hp-002',
    contractNo: 'WARA-NG-2026-042',
    customerName: 'Malini Jayawardena',
    customerPhone: '077-1122334',
    customerNic: '745678901V',
    guarantorName: 'C. Jayawardena (Husband)',
    guarantorPhone: '071-9988776',
    guarantorNic: '710982345V',
    branchId: 'negombo',
    itemDescription: 'Singer 180L Double Door Refrigerator',
    productCode: 'ELEC-RF-01',
    cashPrice: 145000,
    downPayment: 40000,
    totalHirePrice: 160000,
    monthlyAmount: 12000,
    periodMonths: 10,
    startDate: '2026-05-10',
    collectorName: 'Ranjith - Negombo Collector',
    status: 'active',
    schedules: [
      { instalmentNumber: 1, dueDate: '2026-06-10', amount: 12000, paidAmount: 12000, paidDate: '2026-06-09', status: 'paid', receiptNo: 'WR-075' },
      { instalmentNumber: 2, dueDate: '2026-07-10', amount: 12000, paidAmount: 12000, paidDate: '2026-07-10', status: 'paid', receiptNo: 'WR-103' },
      { instalmentNumber: 3, dueDate: '2026-08-10', amount: 12000, paidAmount: 12000, paidDate: '2026-08-11', status: 'paid', receiptNo: 'WR-134' },
      { instalmentNumber: 4, dueDate: '2026-09-10', amount: 12000, paidAmount: 12000, paidDate: '2026-09-12', status: 'paid', receiptNo: 'WR-168' },
      { instalmentNumber: 5, dueDate: '2026-10-10', amount: 12000, paidAmount: 0, status: 'overdue' }, // Overdue alert!
      { instalmentNumber: 6, dueDate: '2026-11-10', amount: 12000, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 7, dueDate: '2026-12-10', amount: 12000, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 8, dueDate: '2027-01-10', amount: 12000, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 9, dueDate: '2027-02-10', amount: 12000, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 10, dueDate: '2027-03-10', amount: 12000, paidAmount: 0, status: 'pending' }
    ]
  },
  {
    id: 'hp-003',
    contractNo: 'WARA-PT-2026-109',
    customerName: 'Anura Wickramasinghe',
    customerPhone: '078-6543210',
    customerNic: '199023405678',
    guarantorName: 'Gamini Wickramasinghe',
    guarantorPhone: '077-4433221',
    guarantorNic: '661029384V',
    branchId: 'pettah',
    itemDescription: 'Singer 7.5kg Fully Auto Washing Machine',
    productCode: 'ELEC-WM-07',
    cashPrice: 104000,
    downPayment: 30000,
    totalHirePrice: 118000,
    monthlyAmount: 11000,
    periodMonths: 8,
    startDate: '2026-08-01',
    collectorName: 'Kamal - Colombo Route Collector',
    status: 'active',
    schedules: [
      { instalmentNumber: 1, dueDate: '2026-09-01', amount: 11000, paidAmount: 11000, paidDate: '2026-09-01', status: 'paid', receiptNo: 'WR-149' },
      { instalmentNumber: 2, dueDate: '2026-10-01', amount: 11000, paidAmount: 11000, paidDate: '2026-10-02', status: 'paid', receiptNo: 'WR-175' },
      { instalmentNumber: 3, dueDate: '2026-11-01', amount: 11000, paidAmount: 0, status: 'overdue' }, // Overdue alert!
      { instalmentNumber: 4, dueDate: '2026-12-01', amount: 11000, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 5, dueDate: '2027-01-01', amount: 11000, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 6, dueDate: '2027-02-01', amount: 11000, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 7, dueDate: '2027-03-01', amount: 11000, paidAmount: 0, status: 'pending' },
      { instalmentNumber: 8, dueDate: '2027-04-01', amount: 11000, paidAmount: 0, status: 'pending' }
    ]
  }
];

export const INITIAL_CHEQUES: Cheque[] = [
  {
    id: 'chq-01',
    chequeNumber: '784920',
    bank: 'Commercial Bank of Ceylon',
    branchName: 'City Office, Colombo 01',
    amount: 185000,
    type: 'received',
    partyName: 'Rizwan Stores (Pettah)',
    partyPhone: '071-8899001',
    receivedOrIssuedDate: '2026-10-25',
    maturityDate: '2026-11-08', // Matures in 2 days!
    status: 'pending',
    notes: 'Payment for wholesale dry rations order #1102',
    branchId: 'pettah'
  },
  {
    id: 'chq-02',
    chequeNumber: '402199',
    bank: 'Sampath Bank',
    branchName: 'Kandy Dalada Veediya',
    amount: 95000,
    type: 'received',
    partyName: 'Bandara & Sons Electricals',
    partyPhone: '077-3456789',
    receivedOrIssuedDate: '2026-10-15',
    maturityDate: '2026-11-07', // Matures tomorrow!
    status: 'pending',
    notes: 'Partial settlement for wire cables invoice',
    branchId: 'kandy'
  },
  {
    id: 'chq-03',
    chequeNumber: '118450',
    bank: 'Hatton National Bank (HNB)',
    branchName: 'Negombo Main',
    amount: 68400,
    type: 'received',
    partyName: 'Samantha Perera',
    partyPhone: '076-2233445',
    receivedOrIssuedDate: '2026-10-05',
    maturityDate: '2026-10-25',
    status: 'returned', // Returned cheque alert!
    notes: 'Account had insufficient funds - Contact Samantha immediately',
    branchId: 'negombo'
  },
  {
    id: 'chq-04',
    chequeNumber: '890123',
    bank: 'Bank of Ceylon (BOC)',
    branchName: 'Pettah Branch',
    amount: 320000,
    type: 'issued', // Issued to distributor/importer
    partyName: 'Hayleys Consumer Products Ltd (Supplier)',
    partyPhone: '011-2688700',
    receivedOrIssuedDate: '2026-10-20',
    maturityDate: '2026-11-10',
    status: 'pending',
    notes: 'Post-dated cheque issued for Singer refrigerator consignments',
    branchId: 'pettah'
  },
  {
    id: 'chq-05',
    chequeNumber: '334912',
    bank: "People's Bank",
    branchName: 'Galle Main',
    amount: 45000,
    type: 'received',
    partyName: 'Nimal Weerasinghe',
    partyPhone: '070-5544332',
    receivedOrIssuedDate: '2026-10-18',
    maturityDate: '2026-11-04',
    status: 'cleared',
    depositAccount: 'BOC Current A/C #78901234',
    branchId: 'galle'
  }
];

export const INITIAL_DAILY_EXPENSES: DailyExpense[] = [
  {
    id: 'exp-1',
    branchId: 'pettah',
    category: 'Staff Meals & Tea (කඩේ තේ/කෑම)',
    amount: 1850,
    description: 'Morning and afternoon plain tea, shorties from Saiva hotel for 4 staff',
    timestamp: '2026-11-06 10:15 AM',
    paidBy: 'Farook'
  },
  {
    id: 'exp-2',
    branchId: 'pettah',
    category: 'Transport & 3-Wheel (ප්‍රවාහන)',
    amount: 1200,
    description: 'Three-wheeler hire to deliver 5 TV boxes to Fort railway parcel office',
    timestamp: '2026-11-06 11:30 AM',
    paidBy: 'Farook'
  },
  {
    id: 'exp-3',
    branchId: 'kandy',
    category: 'Packaging & Bags',
    amount: 2400,
    description: 'Bought 5 rolls of heavy bubble wrap and brown tape from market',
    timestamp: '2026-11-06 01:20 PM',
    paidBy: 'Upul'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-01',
    companyName: 'Hayleys Consumer Products Ltd',
    sinhalaName: 'හේලීස් කන්සියුමර් ප්‍රඩක්ට්ස්',
    contactPerson: 'Rohan Senanayake (Key Account Rep)',
    phone: '077-2345678',
    email: 'rohan.senanayake@hayleys.lk',
    address: 'No. 400, Deans Road, Colombo 10',
    category: 'Appliances & Electronics',
    bankName: 'Bank of Ceylon (BOC)',
    bankAccountNo: '000189204481',
    bankBranch: 'Pettah Corporate Branch',
    totalPurchases: 1070000,
    totalOutstanding: 320000,
    creditTermsDays: 30,
    orders: [
      {
        id: 'po-101',
        poNumber: 'PO-2026-081',
        supplierId: 'supp-01',
        supplierName: 'Hayleys Consumer Products Ltd',
        date: '2026-10-10',
        dueDate: '2026-11-10',
        items: [
          {
            productId: 'prod-1',
            productName: 'Singer 180L Double Door Refrigerator',
            quantity: 5,
            unitCost: 118000,
            total: 590000
          },
          {
            productId: 'prod-4',
            productName: 'KDK 16" Stand Fan with Remote',
            quantity: 3,
            unitCost: 20000,
            total: 60000
          }
        ],
        totalAmount: 650000,
        paidAmount: 330000,
        status: 'partial_paid',
        branchId: 'pettah',
        notes: 'Balance Rs. 320,000 covered by post-dated cheque #890123 maturing on 10 Nov 2026'
      },
      {
        id: 'po-102',
        poNumber: 'PO-2026-064',
        supplierId: 'supp-01',
        supplierName: 'Hayleys Consumer Products Ltd',
        date: '2026-08-15',
        dueDate: '2026-09-15',
        items: [
          {
            productName: 'Philips Electric Kettles & Irons Bundle',
            quantity: 20,
            unitCost: 21000,
            total: 420000
          }
        ],
        totalAmount: 420000,
        paidAmount: 420000,
        status: 'paid',
        branchId: 'kandy',
        notes: 'Settled in full via LankaPay CEFT transfer'
      }
    ],
    payments: [
      {
        id: 'spay-01',
        supplierId: 'supp-01',
        date: '2026-10-25',
        amount: 330000,
        paymentMethod: 'bank_transfer',
        referenceNo: 'CEFT-HAY-994102',
        bankName: 'Commercial Bank of Ceylon',
        note: 'Advance 50% settlement on PO-2026-081'
      }
    ]
  },
  {
    id: 'supp-02',
    companyName: 'Kelani Cables PLC',
    sinhalaName: 'කැළණි කේබල්ස් පී.එල්.සී',
    contactPerson: 'Anura Jayatissa (Technical Sales)',
    phone: '071-8899221',
    email: 'anura.j@kelanicables.com',
    address: 'P.O. Box 14, Wewelduwa, Kelaniya',
    category: 'Cables & Hardware',
    bankName: 'Commercial Bank of Ceylon',
    bankAccountNo: '110294819201',
    bankBranch: 'Peliyagoda Branch',
    totalPurchases: 649000,
    totalOutstanding: 145000,
    creditTermsDays: 21,
    orders: [
      {
        id: 'po-201',
        poNumber: 'PO-2026-089',
        supplierId: 'supp-02',
        supplierName: 'Kelani Cables PLC',
        date: '2026-10-22',
        dueDate: '2026-11-12',
        items: [
          {
            productId: 'prod-5',
            productName: 'Kelani 7/0.29 Pure Copper Wire Coil (100m)',
            quantity: 30,
            unitCost: 19800,
            total: 594000
          },
          {
            productId: 'prod-6',
            productName: 'Orange Electric Double Power Socket 13A',
            quantity: 50,
            unitCost: 1100,
            total: 55000
          }
        ],
        totalAmount: 649000,
        paidAmount: 504000,
        status: 'partial_paid',
        branchId: 'pettah',
        notes: 'Outstanding balance Rs. 145,000 due before 12th Nov for distributor discount qualification'
      }
    ],
    payments: [
      {
        id: 'spay-02',
        supplierId: 'supp-02',
        date: '2026-10-30',
        amount: 504000,
        paymentMethod: 'bank_transfer',
        referenceNo: 'CEFT-KC-88912',
        bankName: 'Sampath Bank',
        note: 'Direct LankaPay CEFT transfer'
      }
    ]
  },
  {
    id: 'supp-03',
    companyName: 'Al-Haj & Bros Wholesale Provisions',
    sinhalaName: 'අල්-හාජ් සහ සමාගම (පිටකොටුව)',
    contactPerson: 'M. R. Faris (Store Manager)',
    phone: '076-3344556',
    email: 'faris.alhaj@gmail.com',
    address: 'No. 112, 4th Cross Street, Pettah, Colombo 11',
    category: 'Provisions & Groceries',
    bankName: 'Sampath Bank',
    bankAccountNo: '014290123841',
    bankBranch: 'Pettah Main Branch',
    totalPurchases: 451000,
    totalOutstanding: 75000,
    creditTermsDays: 14,
    orders: [
      {
        id: 'po-301',
        poNumber: 'PO-2026-092',
        supplierId: 'supp-03',
        supplierName: 'Al-Haj & Bros Wholesale Provisions',
        date: '2026-10-26',
        dueDate: '2026-11-09',
        items: [
          {
            productId: 'prod-7',
            productName: 'Mysore Red Dhal (Parippu) 25kg Sack',
            quantity: 50,
            unitCost: 6900,
            total: 345000
          },
          {
            productId: 'prod-8',
            productName: 'Anchor Full Cream Milk Powder 400g Pkt',
            quantity: 100,
            unitCost: 1060,
            total: 106000
          }
        ],
        totalAmount: 451000,
        paidAmount: 376000,
        status: 'partial_paid',
        branchId: 'pettah',
        notes: 'Pettah short-credit term. Urgent payment deadline on 09 Nov (in 2 days)!'
      }
    ],
    payments: [
      {
        id: 'spay-03',
        supplierId: 'supp-03',
        date: '2026-10-28',
        amount: 376000,
        paymentMethod: 'cash',
        referenceNo: 'REC-ALHAJ-499',
        note: 'Cash paid in hand at Pettah store'
      }
    ]
  },
  {
    id: 'supp-04',
    companyName: 'Batik Craft Guild & Textiles',
    sinhalaName: 'බතික් හස්ත කර්මාන්ත සංසදය',
    contactPerson: 'Nalin Ratnayake',
    phone: '081-2244551',
    email: 'batikcrafts.ceylon@gmail.com',
    address: 'No. 58, Peradeniya Road, Kandy',
    category: 'Textiles & Garments',
    bankName: "People's Bank",
    bankAccountNo: '045100129841',
    bankBranch: 'Kandy Central Branch',
    totalPurchases: 195000,
    totalOutstanding: 0,
    creditTermsDays: 30,
    orders: [
      {
        id: 'po-401',
        poNumber: 'PO-2026-077',
        supplierId: 'supp-04',
        supplierName: 'Batik Craft Guild & Textiles',
        date: '2026-09-20',
        dueDate: '2026-10-20',
        items: [
          {
            productId: 'prod-9',
            productName: 'Handloom Batik Pure Cotton Sarong (Gents)',
            quantity: 100,
            unitCost: 1950,
            total: 195000
          }
        ],
        totalAmount: 195000,
        paidAmount: 195000,
        status: 'paid',
        branchId: 'kandy',
        notes: 'Delivered to Kandy showroom. Fully settled on due date.'
      }
    ],
    payments: [
      {
        id: 'spay-04',
        supplierId: 'supp-04',
        date: '2026-10-18',
        amount: 195000,
        paymentMethod: 'bank_transfer',
        referenceNo: 'CEFT-BTK-1092',
        bankName: "People's Bank",
        note: 'CEFT online transfer from Kandy branch account'
      }
    ]
  },
  {
    id: 'supp-05',
    companyName: 'Lanka Auto Spares & Bearing Importers',
    sinhalaName: 'ලංකා ඔටෝ ස්පෙයාර්ස් (පංචිකාවත්ත)',
    contactPerson: 'Dinesh Wickrematunge',
    phone: '072-9988112',
    email: 'info@lankaautospares.lk',
    address: 'No. 29, Panchikawatte Road, Colombo 10',
    category: 'Automotive Parts',
    bankName: 'Hatton National Bank (HNB)',
    bankAccountNo: '039100293847',
    bankBranch: 'Panchikawatte Branch',
    totalPurchases: 110000,
    totalOutstanding: 110000,
    creditTermsDays: 14,
    orders: [
      {
        id: 'po-501',
        poNumber: 'PO-2026-095',
        supplierId: 'supp-05',
        supplierName: 'Lanka Auto Spares & Bearing Importers',
        date: '2026-10-28',
        dueDate: '2026-11-11',
        items: [
          {
            productId: 'prod-10',
            productName: 'Bajaj Genuine Three-Wheeler Clutch Cable Box',
            quantity: 40,
            unitCost: 1650,
            total: 66000
          },
          {
            productName: 'SKF Heavy Duty Wheel Bearings (Pkt)',
            quantity: 20,
            unitCost: 2200,
            total: 44000
          }
        ],
        totalAmount: 110000,
        paidAmount: 0,
        status: 'received',
        branchId: 'negombo',
        notes: 'Delivered to Negombo retail branch. Due for payment on 11 Nov.'
      }
    ],
    payments: []
  }
];

