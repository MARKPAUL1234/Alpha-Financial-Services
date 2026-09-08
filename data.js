// Default Initial State & Data for Alpha Financial Services
const INITIAL_DATA = {
  settings: {
    businessName: "Alpha Financial Services",
    tagline: "Empowering Financial Growth with Smart Credit Solutions",
    logoText: "ALPHA",
    logoSubtext: "FINANCIAL",
    currency: "UGX",
    currencySymbol: "UGX",
    address: "Plot 42 Financial Center Avenue, Suite 500, Kampala, Uganda",
    phone: "+256 414 555 019 / +256 700 123 456",
    email: "info@alphafinancial.co.ug",
    taxId: "TAX-9948102-X",
    defaultInterestRate: 14.0,
    latePenaltyRate: 5.0
  },
  currentUser: {
    name: "Alex Mercer",
    role: "Admin", // 'Admin' or 'Staff'
    avatar: "AM",
    email: "alex.mercer@alphafinancial.co.ug"
  },
  loanProducts: [
    {
      id: "PROD-001",
      name: "SME Micro-Business Loan",
      minAmount: 1000000,
      maxAmount: 50000000,
      interestRate: 14.0,
      interestType: "Reducing Balance",
      termMonths: 12,
      penaltyRate: 5.0,
      processingFeePercent: 2.0,
      description: "Working capital loan designed for small to medium enterprises with flexible monthly terms."
    },
    {
      id: "PROD-002",
      name: "Executive Personal Loan",
      minAmount: 500000,
      maxAmount: 15000000,
      interestRate: 12.5,
      interestType: "Flat Rate",
      termMonths: 6,
      penaltyRate: 3.5,
      processingFeePercent: 1.5,
      description: "Unsecured personal credit facility for salary earners and professionals."
    },
    {
      id: "PROD-003",
      name: "Asset & Equipment Financing",
      minAmount: 5000000,
      maxAmount: 100000000,
      interestRate: 10.5,
      interestType: "Reducing Balance",
      termMonths: 24,
      penaltyRate: 4.0,
      processingFeePercent: 2.5,
      description: "Secured loan facility for purchasing commercial machinery, vehicles, and tech infrastructure."
    },
    {
      id: "PROD-004",
      name: "Emergency Quick Credit",
      minAmount: 200000,
      maxAmount: 3000000,
      interestRate: 18.0,
      interestType: "Flat Rate",
      termMonths: 3,
      penaltyRate: 6.0,
      processingFeePercent: 1.0,
      description: "Rapid turnaround short-term cash facility for immediate operational emergencies."
    }
  ],
  borrowers: [
    {
      id: "BOR-1001",
      firstName: "David",
      lastName: "Kato",
      nin: "CM89012345KLMN",
      phone: "+256 772 109 884",
      email: "david.kato@logistics.co.ug",
      address: "Industrial Area, Block 4 B, Kampala",
      employment: "Business Owner - Express Freight Services",
      monthlyIncome: 8500000,
      creditScore: 760,
      status: "Active",
      registeredDate: "2025-11-10"
    },
    {
      id: "BOR-1002",
      firstName: "Sarah",
      lastName: "Jenkins",
      nin: "CM994827104X",
      phone: "+256 782 555 018",
      email: "s.jenkins@designs.co.ug",
      address: "Plot 842 Market Street, Kampala",
      employment: "Senior Product Designer - Tech Corp Uganda",
      monthlyIncome: 6200000,
      creditScore: 720,
      status: "Active",
      registeredDate: "2026-01-15"
    },
    {
      id: "BOR-1003",
      firstName: "Michael",
      lastName: "Ochieng",
      nin: "CM4819204481",
      phone: "+256 711 982 301",
      email: "m.ochieng@agrifarm.co.ug",
      address: "Kisasi Estate, Kampala",
      employment: "Managing Director - Sunrise Agro Traders",
      monthlyIncome: 12000000,
      creditScore: 680,
      status: "Active",
      registeredDate: "2025-08-22"
    },
    {
      id: "BOR-1004",
      firstName: "Elena",
      lastName: "Rostova",
      nin: "CM7739201928",
      phone: "+256 702 555 014",
      email: "elena.r@fashionhouse.co.ug",
      address: "Garden City Mall, Shop 104, Kampala",
      employment: "Retail Boutique Director",
      monthlyIncome: 4800000,
      creditScore: 590,
      status: "Watchlist",
      registeredDate: "2025-06-04"
    },
    {
      id: "BOR-1005",
      firstName: "Robert",
      lastName: "Tuhairwe",
      nin: "CM77301928AB",
      phone: "+256 701 445 920",
      email: "robert.tuhairwe@pharmaceuticals.com",
      address: "Plot 12 Acacia Avenue, Kololo",
      employment: "Chief Pharmacist - HealthCare Uganda",
      monthlyIncome: 5500000,
      creditScore: 810,
      status: "Active",
      registeredDate: "2026-02-01"
    }
  ],
  loans: [
    {
      id: "LN-2026-001",
      borrowerId: "BOR-1001",
      borrowerName: "David Kato",
      productId: "PROD-001",
      productName: "SME Micro-Business Loan",
      principalAmount: 15000000,
      interestRate: 14.0,
      termMonths: 12,
      repaymentFrequency: "Monthly",
      applicationDate: "2026-01-10",
      approvalDate: "2026-01-12",
      releaseDate: "2026-01-15",
      status: "Active",
      disbursedBy: "Alex Mercer",
      collateral: "Commercial Truck Reg # UBE 489X",
      totalRepayable: 16400000,
      totalPaid: 5466680,
      remainingBalance: 10933320,
      schedule: [
        { installmentNo: 1, dueDate: "2026-02-15", principal: 1175000, interest: 191670, total: 1366670, paidAmount: 1366670, status: "Paid", paidDate: "2026-02-14" },
        { installmentNo: 2, dueDate: "2026-03-15", principal: 1188710, interest: 177960, total: 1366670, paidAmount: 1366670, status: "Paid", paidDate: "2026-03-15" },
        { installmentNo: 3, dueDate: "2026-04-15", principal: 1202580, interest: 164090, total: 1366670, paidAmount: 1366670, status: "Paid", paidDate: "2026-04-12" },
        { installmentNo: 4, dueDate: "2026-05-15", principal: 1216610, interest: 150060, total: 1366670, paidAmount: 1366670, status: "Paid", paidDate: "2026-05-15" },
        { installmentNo: 5, dueDate: "2026-06-15", principal: 1230800, interest: 135870, total: 1366670, paidAmount: 0, status: "Overdue", paidDate: null, penalty: 68330 },
        { installmentNo: 6, dueDate: "2026-07-15", principal: 1245160, interest: 121510, total: 1366670, paidAmount: 0, status: "Pending", paidDate: null },
        { installmentNo: 7, dueDate: "2026-08-15", principal: 1259690, interest: 106980, total: 1366670, paidAmount: 0, status: "Pending", paidDate: null },
        { installmentNo: 8, dueDate: "2026-09-15", principal: 1274390, interest: 92280, total: 1366670, paidAmount: 0, status: "Pending", paidDate: null },
        { installmentNo: 9, dueDate: "2026-10-15", principal: 1289260, interest: 77410, total: 1366670, paidAmount: 0, status: "Pending", paidDate: null },
        { installmentNo: 10, dueDate: "2026-11-15", principal: 1304300, interest: 62370, total: 1366670, paidAmount: 0, status: "Pending", paidDate: null },
        { installmentNo: 11, dueDate: "2026-12-15", principal: 1319520, interest: 47150, total: 1366670, paidAmount: 0, status: "Pending", paidDate: null },
        { installmentNo: 12, dueDate: "2027-01-15", principal: 1334910, interest: 31760, total: 1366670, paidAmount: 0, status: "Pending", paidDate: null }
      ]
    },
    {
      id: "LN-2026-002",
      borrowerId: "BOR-1002",
      borrowerName: "Sarah Jenkins",
      productId: "PROD-002",
      productName: "Executive Personal Loan",
      principalAmount: 6000000,
      interestRate: 12.5,
      termMonths: 6,
      repaymentFrequency: "Monthly",
      applicationDate: "2026-08-28",
      approvalDate: null,
      releaseDate: null,
      status: "Pending Approval",
      disbursedBy: "-",
      collateral: "Salary Assignment & Guarantor - Mark Jenkins",
      totalRepayable: 6375000,
      totalPaid: 0,
      remainingBalance: 6375000,
      schedule: []
    },
    {
      id: "LN-2026-003",
      borrowerId: "BOR-1003",
      borrowerName: "Michael Ochieng",
      productId: "PROD-003",
      productName: "Asset & Equipment Financing",
      principalAmount: 30000000,
      interestRate: 10.5,
      termMonths: 24,
      repaymentFrequency: "Monthly",
      applicationDate: "2026-08-01",
      approvalDate: "2026-08-05",
      releaseDate: null,
      status: "Approved",
      disbursedBy: "-",
      collateral: "Tractor Land Deed Registration # 8940/2024",
      totalRepayable: 33450000,
      totalPaid: 0,
      remainingBalance: 33450000,
      schedule: []
    },
    {
      id: "LN-2026-004",
      borrowerId: "BOR-1004",
      borrowerName: "Elena Rostova",
      productId: "PROD-004",
      productName: "Emergency Quick Credit",
      principalAmount: 2500000,
      interestRate: 18.0,
      termMonths: 3,
      repaymentFrequency: "Monthly",
      applicationDate: "2026-03-01",
      approvalDate: "2026-03-02",
      releaseDate: "2026-03-03",
      status: "Overdue",
      disbursedBy: "Sarah Officer",
      collateral: "Boutique Inventory Pledge",
      totalRepayable: 2950000,
      totalPaid: 983330,
      remainingBalance: 1966670,
      schedule: [
        { installmentNo: 1, dueDate: "2026-04-03", principal: 783330, interest: 200000, total: 983330, paidAmount: 983330, status: "Paid", paidDate: "2026-04-02" },
        { installmentNo: 2, dueDate: "2026-05-03", principal: 783330, interest: 200000, total: 983330, paidAmount: 0, status: "Overdue", paidDate: null, penalty: 49160 },
        { installmentNo: 3, dueDate: "2026-06-03", principal: 783340, interest: 200000, total: 983340, paidAmount: 0, status: "Overdue", paidDate: null, penalty: 49160 }
      ]
    },
    {
      id: "LN-2026-005",
      borrowerId: "BOR-1005",
      borrowerName: "Robert Tuhairwe",
      productId: "PROD-002",
      productName: "Executive Personal Loan",
      principalAmount: 5000000,
      interestRate: 12.5,
      termMonths: 6,
      repaymentFrequency: "Monthly",
      applicationDate: "2025-09-01",
      approvalDate: "2025-09-03",
      releaseDate: "2025-09-05",
      status: "Completed",
      disbursedBy: "Alex Mercer",
      collateral: "Salary Paystub Authorization",
      totalRepayable: 5312500,
      totalPaid: 5312500,
      remainingBalance: 0,
      schedule: [
        { installmentNo: 1, dueDate: "2025-10-05", principal: 833330, interest: 52080, total: 885410, paidAmount: 885410, status: "Paid", paidDate: "2025-10-04" },
        { installmentNo: 2, dueDate: "2025-11-05", principal: 833330, interest: 52080, total: 885410, paidAmount: 885410, status: "Paid", paidDate: "2025-11-05" },
        { installmentNo: 3, dueDate: "2025-12-05", principal: 833330, interest: 52080, total: 885410, paidAmount: 885410, status: "Paid", paidDate: "2025-12-03" },
        { installmentNo: 4, dueDate: "2026-01-05", principal: 833330, interest: 52080, total: 885410, paidAmount: 885410, status: "Paid", paidDate: "2026-01-04" },
        { installmentNo: 5, dueDate: "2026-02-05", principal: 833330, interest: 52080, total: 885410, paidAmount: 885410, status: "Paid", paidDate: "2026-02-05" },
        { installmentNo: 6, dueDate: "2026-03-05", principal: 833350, interest: 52100, total: 885450, paidAmount: 885450, status: "Paid", paidDate: "2026-03-04" }
      ]
    }
  ],
  repayments: [
    {
      receiptNo: "RCP-8901",
      loanId: "LN-2026-001",
      borrowerName: "David Kato",
      paymentDate: "2026-02-14",
      amountPaid: 1366670,
      principalPaid: 1175000,
      interestPaid: 191670,
      penaltyPaid: 0,
      paymentMethod: "Bank Wire Transfer",
      referenceNo: "TRX-88491024",
      receivedBy: "Alex Mercer",
      notes: "Installment 1 paid on time via Stanbic Bank Uganda"
    },
    {
      receiptNo: "RCP-8902",
      loanId: "LN-2026-001",
      borrowerName: "David Kato",
      paymentDate: "2026-03-15",
      amountPaid: 1366670,
      principalPaid: 1188710,
      interestPaid: 177960,
      penaltyPaid: 0,
      paymentMethod: "Mobile Money",
      referenceNo: "MM-99201948",
      receivedBy: "Sarah Officer",
      notes: "Installment 2 direct MTN Mobile Money pay"
    },
    {
      receiptNo: "RCP-8903",
      loanId: "LN-2026-001",
      borrowerName: "David Kato",
      paymentDate: "2026-04-12",
      amountPaid: 1366670,
      principalPaid: 1202580,
      interestPaid: 164090,
      penaltyPaid: 0,
      paymentMethod: "Direct Cash Deposit",
      referenceNo: "CSH-002941",
      receivedBy: "Alex Mercer",
      notes: "Installment 3 teller deposit Centenary Bank"
    },
    {
      receiptNo: "RCP-8904",
      loanId: "LN-2026-004",
      borrowerName: "Elena Rostova",
      paymentDate: "2026-04-02",
      amountPaid: 983330,
      principalPaid: 783330,
      interestPaid: 200000,
      penaltyPaid: 0,
      paymentMethod: "Mobile Money",
      referenceNo: "AM-7719203",
      receivedBy: "Alex Mercer",
      notes: "Emergency loan payment 1 via Airtel Money"
    }
  ]
};

// Institutional Risk Scoring Engine (CRB Matrix)
const CRBEngine = {
  calculateScore(borrower, loanAmount = 0) {
    let baseScore = borrower.creditScore || 650;
    const income = parseFloat(borrower.monthlyIncome || 0);
    
    // DTI (Debt-to-Income) impact
    if (income > 0 && loanAmount > 0) {
      const estimatedMonthlyPayment = (loanAmount * 1.15) / 12;
      const dtiRatio = (estimatedMonthlyPayment / income) * 100;
      if (dtiRatio > 50) baseScore -= 45;
      else if (dtiRatio > 35) baseScore -= 20;
      else if (dtiRatio < 20) baseScore += 25;
    }

    // High Income bonus
    if (income >= 10000000) baseScore += 30;
    else if (income >= 5000000) baseScore += 15;

    // Clamp score within standard 300 - 850 range
    const finalScore = Math.min(850, Math.max(300, Math.round(baseScore)));
    
    let grade = "C";
    let status = "Moderate Risk";
    let color = "#f59e0b"; // amber

    if (finalScore >= 750) {
      grade = "AAA";
      status = "Prime / Low Risk";
      color = "#10b981"; // emerald
    } else if (finalScore >= 700) {
      grade = "AA";
      status = "Low Risk";
      color = "#10b981";
    } else if (finalScore >= 640) {
      grade = "B";
      status = "Acceptable Standard";
      color = "#2563eb"; // blue
    } else if (finalScore >= 580) {
      grade = "C";
      status = "Watchlist / High DTI";
      color = "#f59e0b";
    } else {
      grade = "D";
      status = "Subprime / Critical NPA Risk";
      color = "#ef4444"; // red
    }

    return { score: finalScore, grade, status, color };
  }
};

// Simulated REST API Service
const MockAPIService = {
  async syncData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          timestamp: new Date().toISOString(),
          syncedRecords: {
            borrowers: AppStore.data.borrowers.length,
            loans: AppStore.data.loans.length,
            repayments: AppStore.data.repayments.length
          }
        });
      }, 1200);
    });
  }
};

