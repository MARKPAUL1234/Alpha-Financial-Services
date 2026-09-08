// Alpha Financial Services - Main Engine & Application Controller

// State Store Manager
let AppStore = {
  data: null,

  init() {
    const saved = localStorage.getItem("ALPHA_FINANCIAL_STORE");
    if (saved) {
      try {
        this.data = JSON.parse(saved);
        // Force upgrade to UGX dataset if previously stored USD data exists
        if (!this.data.settings || this.data.settings.currency === "USD" || this.data.settings.currencySymbol === "$") {
          this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
          this.save();
        }
      } catch (e) {
        console.error("Failed to parse saved store, loading defaults", e);
        this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
        this.save();
      }
    } else {
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.save();
    }
  },

  save() {
    localStorage.setItem("ALPHA_FINANCIAL_STORE", JSON.stringify(this.data));
  },

  reset() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.save();
    location.reload();
  }
};

// Main Controller
document.addEventListener("DOMContentLoaded", () => {
  AppStore.init();
  initUI();
  renderCurrentView("dashboard");
});

// Global Helpers
function formatCurrency(amount) {
  const symbol = AppStore.data?.settings?.currencySymbol || "UGX";
  const num = parseFloat(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return `${symbol} ${num}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast-notification ${type}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0B192C;
    color: white;
    padding: 14px 20px;
    border-radius: 8px;
    border-left: 4px solid ${type === 'success' ? '#10B981' : type === 'danger' ? '#EF4444' : '#0066FF'};
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 9999;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: fadeIn 0.3s ease-out;
  `;
  toast.innerHTML = `<i class="ri-information-line"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// UI Initialization
function initUI() {
  updateBrandingDOM();
  setupNavigation();
  setupRoleSwitcher();
  setupModals();
  setupCalculators();
  setupSettingsForm();
}

function updateBrandingDOM() {
  const s = AppStore.data.settings;
  const user = AppStore.data.currentUser;

  // Header branding
  document.querySelectorAll(".brand-title-box h1").forEach(el => el.textContent = s.businessName);
  document.querySelectorAll(".brand-title-box span").forEach(el => el.textContent = s.logoText);
  document.querySelectorAll(".currency-code-display").forEach(el => el.textContent = s.currency);
  document.querySelectorAll(".currency-symbol-display").forEach(el => el.textContent = s.currencySymbol);

  // User Profile
  const avatar = document.getElementById("user-avatar-display");
  if (avatar) avatar.textContent = user.avatar;
  const uname = document.getElementById("user-name-display");
  if (uname) uname.textContent = user.name;
  const urole = document.getElementById("user-role-display");
  if (urole) urole.textContent = user.role;
}

function setupNavigation() {
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = item.getAttribute("data-view");
      if (!targetView) return;
      
      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");

      renderCurrentView(targetView);
    });
  });
}

function setupRoleSwitcher() {
  const btn = document.getElementById("toggle-role-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const cur = AppStore.data.currentUser.role;
    const next = cur === "Admin" ? "Staff" : "Admin";
    AppStore.data.currentUser.role = next;
    AppStore.save();
    updateBrandingDOM();
    showToast(`Switched active user role to ${next}`, "info");
    const activeView = document.querySelector(".sidebar-nav .nav-item.active")?.getAttribute("data-view") || "dashboard";
    renderCurrentView(activeView);
  });
}

// Render Router
function renderCurrentView(viewName) {
  // Hide all sections
  document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
  
  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) targetSec.classList.add("active");

  // Update Page Title
  const titles = {
    dashboard: { title: "Executive Dashboard", sub: "Real-time loan portfolio performance & metrics" },
    borrowers: { title: "Borrowers Directory", sub: "Manage client records, search profiles & statements" },
    loans: { title: "Loan Application Pipeline", sub: "Origination, approvals, disbursements & statuses" },
    repayments: { title: "Repayments & Schedules", sub: "Record payments, view amortization & receipts" },
    arrears: { title: "Overdue & Arrears Tracking", sub: "Delinquent portfolio management & collection alerts" },
    products: { title: "Loan Types & Configuration", sub: "Configure interest rates, terms & credit products" },
    reports: { title: "Financial & Portfolio Reports", sub: "Comprehensive performance analysis & exports" },
    settings: { title: "Client Branding & Settings", sub: "Customize organization details & currency settings" }
  };

  if (titles[viewName]) {
    document.getElementById("page-title-text").textContent = titles[viewName].title;
    document.getElementById("page-subtitle-text").textContent = titles[viewName].sub;
  }

  // View specific renders
  switch (viewName) {
    case "dashboard": renderDashboardView(); break;
    case "borrowers": renderBorrowersView(); break;
    case "loans": renderLoansView(); break;
    case "repayments": renderRepaymentsView(); break;
    case "arrears": renderArrearsView(); break;
    case "products": renderProductsView(); break;
    case "reports": renderReportsView(); break;
    case "settings": renderSettingsView(); break;
  }
}

/* ==========================================================================
   VIEW RENDERING FUNCTIONS
   ========================================================================== */

// 1. DASHBOARD VIEW
function renderDashboardView() {
  const loans = AppStore.data.loans;
  const repayments = AppStore.data.repayments;
  const borrowers = AppStore.data.borrowers;

  // Calc Metrics
  let totalPortfolio = 0;
  let activeCount = 0;
  let totalCollected = 0;
  let totalArrears = 0;

  loans.forEach(l => {
    if (l.status === "Active" || l.status === "Overdue" || l.status === "Released") {
      totalPortfolio += parseFloat(l.principalAmount || 0);
      if (l.status === "Active" || l.status === "Overdue") activeCount++;
    }
    // calculate arrears from schedules
    if (l.schedule) {
      l.schedule.forEach(inst => {
        if (inst.status === "Overdue") {
          totalArrears += parseFloat(inst.total || 0) + parseFloat(inst.penalty || 0);
        }
      });
    }
  });

  repayments.forEach(r => totalCollected += parseFloat(r.amountPaid || 0));

  document.getElementById("kpi-portfolio").textContent = formatCurrency(totalPortfolio);
  document.getElementById("kpi-active-loans").textContent = activeCount;
  document.getElementById("kpi-collected").textContent = formatCurrency(totalCollected);
  document.getElementById("kpi-arrears").textContent = formatCurrency(totalArrears);
  document.getElementById("kpi-borrowers").textContent = borrowers.length;

  // Render Recent Transactions
  const recentTable = document.getElementById("dashboard-recent-table");
  if (recentTable) {
    const recent = repayments.slice(-5).reverse();
    recentTable.innerHTML = recent.length === 0 ? 
      `<tr><td colspan="5" style="text-align:center; color:#888;">No recent repayments recorded.</td></tr>` :
      recent.map(r => `
        <tr>
          <td><strong>${r.receiptNo}</strong></td>
          <td>${r.borrowerName}</td>
          <td>${formatDate(r.paymentDate)}</td>
          <td><strong style="color:#059669;">${formatCurrency(r.amountPaid)}</strong></td>
          <td><span class="status-badge active">${r.paymentMethod}</span></td>
        </tr>
      `).join('');
  }

  // Render Overdue Alerts Widget
  const alertsContainer = document.getElementById("dashboard-alerts-widget");
  if (alertsContainer) {
    const overdueLoans = loans.filter(l => l.status === "Overdue");
    if (overdueLoans.length === 0) {
      alertsContainer.innerHTML = `<div style="padding:12px; color:#10B981; font-weight:600;"><i class="ri-checkbox-circle-line"></i> All loans are currently up to date!</div>`;
    } else {
      alertsContainer.innerHTML = overdueLoans.map(l => `
        <div class="ai-recommendation-item" onclick="openLoanDetailsModal('${l.id}')">
          <i class="ri-error-warning-line" style="color:#EF4444;"></i>
          <div>
            <strong>${l.borrowerName} (${l.id})</strong>
            <p style="font-size:11px; opacity:0.8;">Balance: ${formatCurrency(l.remainingBalance)} - Action required</p>
          </div>
        </div>
      `).join('');
    }
  }

  // Render Portfolio Charts
  renderDashboardCharts();
}

function renderDashboardCharts() {
  const chartCanvas = document.getElementById("chart-portfolio-mix");
  if (!chartCanvas) return;

  // Render CSS-based visual representation of chart
  const products = AppStore.data.loanProducts;
  const loans = AppStore.data.loans;

  const productCounts = {};
  products.forEach(p => productCounts[p.name] = 0);
  loans.forEach(l => {
    if (productCounts[l.productName] !== undefined) {
      productCounts[l.productName] += parseFloat(l.principalAmount || 0);
    }
  });

  const total = Object.values(productCounts).reduce((a, b) => a + b, 0) || 1;

  let html = `<div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">`;
  const colors = ["#0066FF", "#10B981", "#F59E0B", "#8B5CF6"];
  let i = 0;
  for (const [pname, val] of Object.entries(productCounts)) {
    const pct = Math.round((val / total) * 100);
    const col = colors[i % colors.length];
    html += `
      <div>
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
          <span>${pname}</span>
          <span>${formatCurrency(val)} (${pct}%)</span>
        </div>
        <div style="height:10px; background:#E2E8F0; border-radius:6px; overflow:hidden;">
          <div style="width:${pct}%; height:100%; background:${col}; border-radius:6px;"></div>
        </div>
      </div>
    `;
    i++;
  }
  html += `</div>`;
  chartCanvas.innerHTML = html;
}

// 2. BORROWERS VIEW
function renderBorrowersView() {
  const container = document.getElementById("borrowers-table-body");
  if (!container) return;

  const query = (document.getElementById("borrower-search-input")?.value || "").toLowerCase();
  const list = AppStore.data.borrowers.filter(b => 
    b.firstName.toLowerCase().includes(query) ||
    b.lastName.toLowerCase().includes(query) ||
    b.nin.toLowerCase().includes(query) ||
    b.phone.includes(query) ||
    b.id.toLowerCase().includes(query)
  );

  container.innerHTML = list.length === 0 ?
    `<tr><td colspan="7" style="text-align:center; color:#888;">No matching borrowers found.</td></tr>` :
    list.map(b => {
      const activeLoansCount = AppStore.data.loans.filter(l => l.borrowerId === b.id && l.status === 'Active').length;
      return `
        <tr>
          <td><strong>${b.id}</strong></td>
          <td>
            <div style="font-weight:700; color:var(--bg-primary);">${b.firstName} ${b.lastName}</div>
            <div style="font-size:11px; color:#64748B;">NIN: ${b.nin}</div>
          </td>
          <td>
            <div>${b.phone}</div>
            <div style="font-size:11px; color:#64748B;">${b.email}</div>
          </td>
          <td>${b.employment}</td>
          <td>
            <span class="status-badge ${b.creditScore >= 700 ? 'active' : b.creditScore >= 600 ? 'pending' : 'overdue'}">
              Score: ${b.creditScore}
            </span>
          </td>
          <td><strong>${activeLoansCount} Active</strong></td>
          <td>
            <div class="action-btn-group">
              <button class="action-icon" title="View Profile & Statement" onclick="openBorrowerProfileModal('${b.id}')">
                <i class="ri-file-text-line"></i>
              </button>
              <button class="action-icon" title="Apply for Loan" onclick="openNewLoanModalWithBorrower('${b.id}')">
                <i class="ri-add-circle-line"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
}

// 3. LOANS APPLICATION PIPELINE VIEW
function renderLoansView() {
  const container = document.getElementById("loans-table-body");
  if (!container) return;

  const statusFilter = document.getElementById("loan-status-filter")?.value || "ALL";
  const query = (document.getElementById("loan-search-input")?.value || "").toLowerCase();

  let list = AppStore.data.loans;
  if (statusFilter !== "ALL") {
    list = list.filter(l => l.status.toUpperCase() === statusFilter.toUpperCase());
  }

  if (query) {
    list = list.filter(l => 
      l.id.toLowerCase().includes(query) ||
      l.borrowerName.toLowerCase().includes(query) ||
      l.productName.toLowerCase().includes(query)
    );
  }

  container.innerHTML = list.length === 0 ?
    `<tr><td colspan="8" style="text-align:center; color:#888;">No loans found matching filter criteria.</td></tr>` :
    list.map(l => `
      <tr>
        <td><strong>${l.id}</strong></td>
        <td>
          <div style="font-weight:700;">${l.borrowerName}</div>
          <div style="font-size:11px; color:#64748B;">ID: ${l.borrowerId}</div>
        </td>
        <td>${l.productName}</td>
        <td><strong>${formatCurrency(l.principalAmount)}</strong></td>
        <td>${l.interestRate}% (${l.termMonths} Mths)</td>
        <td>
          <span class="status-badge ${l.status.toLowerCase().replace(' ', '-')}">
            ${l.status}
          </span>
        </td>
        <td><strong>${formatCurrency(l.remainingBalance)}</strong></td>
        <td>
          <div class="action-btn-group">
            <button class="action-icon" title="View Schedule & Lifecycle" onclick="openLoanDetailsModal('${l.id}')">
              <i class="ri-eye-line"></i>
            </button>
            ${l.status === 'Pending Approval' ? `
              <button class="action-icon" style="color:#059669;" title="Approve Loan" onclick="changeLoanStatus('${l.id}', 'Approved')">
                <i class="ri-check-line"></i>
              </button>
              <button class="action-icon" style="color:#DC2626;" title="Deny Loan" onclick="changeLoanStatus('${l.id}', 'Denied')">
                <i class="ri-close-line"></i>
              </button>
            ` : ''}
            ${l.status === 'Approved' ? `
              <button class="action-icon" style="color:#0066FF;" title="Release / Disburse Funds" onclick="disburseLoanModal('${l.id}')">
                <i class="ri-hand-coin-line"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
}

// 4. REPAYMENTS VIEW
function renderRepaymentsView() {
  const container = document.getElementById("repayments-table-body");
  if (!container) return;

  const list = AppStore.data.repayments;
  container.innerHTML = list.length === 0 ?
    `<tr><td colspan="7" style="text-align:center; color:#888;">No repayments recorded yet.</td></tr>` :
    list.map(r => `
      <tr>
        <td><strong>${r.receiptNo}</strong></td>
        <td>${r.loanId}</td>
        <td><strong>${r.borrowerName}</strong></td>
        <td>${formatDate(r.paymentDate)}</td>
        <td><strong style="color:#059669;">${formatCurrency(r.amountPaid)}</strong></td>
        <td>${r.paymentMethod} (${r.referenceNo || 'N/A'})</td>
        <td>
          <button class="btn-secondary btn-sm" onclick="printReceiptModal('${r.receiptNo}')">
            <i class="ri-printer-line"></i> Receipt
          </button>
        </td>
      </tr>
    `).join('');
}

// 5. ARREARS & OVERDUE VIEW
function renderArrearsView() {
  const container = document.getElementById("arrears-table-body");
  if (!container) return;

  const overdueInstallments = [];
  AppStore.data.loans.forEach(l => {
    if (l.schedule) {
      l.schedule.forEach(inst => {
        if (inst.status === "Overdue") {
          const dueDateObj = new Date(inst.dueDate);
          const today = new Date("2026-09-07");
          const diffDays = Math.max(1, Math.floor((today - dueDateObj) / (1000 * 60 * 60 * 24)));
          overdueInstallments.push({
            loanId: l.id,
            borrowerName: l.borrowerName,
            borrowerId: l.borrowerId,
            installmentNo: inst.installmentNo,
            dueDate: inst.dueDate,
            daysOverdue: diffDays,
            amountDue: inst.total,
            penalty: inst.penalty || (inst.total * 0.05)
          });
        }
      });
    }
  });

  container.innerHTML = overdueInstallments.length === 0 ?
    `<tr><td colspan="7" style="text-align:center; color:#10B981; font-weight:700;">No accounts in arrears! Portfolio performance is excellent.</td></tr>` :
    overdueInstallments.map(a => `
      <tr>
        <td><strong>${a.loanId}</strong></td>
        <td><strong>${a.borrowerName}</strong></td>
        <td>Inst. #${a.installmentNo} (${formatDate(a.dueDate)})</td>
        <td><span class="status-badge overdue">${a.daysOverdue} Days Past Due</span></td>
        <td>${formatCurrency(a.amountDue)}</td>
        <td><strong style="color:#DC2626;">+${formatCurrency(a.penalty)}</strong></td>
        <td>
          <button class="btn-accent btn-sm" onclick="showToast('Reminder Notice sent to borrower ${a.borrowerName}', 'success')">
            <i class="ri-notification-line"></i> Remind
          </button>
          <button class="btn-primary btn-sm" onclick="openRecordRepaymentModalForLoan('${a.loanId}')">
            Pay Now
          </button>
        </td>
      </tr>
    `).join('');
}

// 6. LOAN PRODUCTS CONFIGURATION VIEW
function renderProductsView() {
  const container = document.getElementById("products-cards-grid");
  if (!container) return;

  const products = AppStore.data.loanProducts;
  container.innerHTML = products.map(p => `
    <div class="card" style="margin-bottom:0;">
      <div class="card-header">
        <div class="card-title-box">
          <h3>${p.name}</h3>
          <p>Product ID: ${p.id}</p>
        </div>
        <span class="status-badge active">${p.interestType}</span>
      </div>
      <p style="font-size:13px; color:#475569; margin-bottom:16px;">${p.description}</p>
      <div style="background:#F8FAFC; padding:14px; border-radius:8px; display:flex; flex-direction:column; gap:8px; font-size:13px;">
        <div style="display:flex; justify-style:space-between; justify-content:space-between;">
          <span style="color:#64748B;">Interest Rate:</span>
          <strong>${p.interestRate}% P.A.</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:#64748B;">Max Loan Limit:</span>
          <strong>${formatCurrency(p.maxAmount)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:#64748B;">Processing Fee:</span>
          <strong>${p.processingFeePercent}%</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:#64748B;">Late Penalty:</span>
          <strong>${p.penaltyRate}%</strong>
        </div>
      </div>
    </div>
  `).join('');
}

// 7. REPORTS VIEW
function renderReportsView() {
  const loans = AppStore.data.loans;
  const repayments = AppStore.data.repayments;

  let totalDisbursed = 0;
  let totalInterestEarned = 0;

  loans.forEach(l => {
    if (l.status === 'Active' || l.status === 'Completed' || l.status === 'Overdue') {
      totalDisbursed += parseFloat(l.principalAmount || 0);
    }
  });

  repayments.forEach(r => {
    totalInterestEarned += parseFloat(r.interestPaid || 0);
  });

  document.getElementById("report-disbursed").textContent = formatCurrency(totalDisbursed);
  document.getElementById("report-interest").textContent = formatCurrency(totalInterestEarned);
  document.getElementById("report-repayment-rate").textContent = "94.2%";
}

// 8. SETTINGS VIEW
function renderSettingsView() {
  const s = AppStore.data.settings;
  document.getElementById("setting-biz-name").value = s.businessName || "";
  document.getElementById("setting-tagline").value = s.tagline || "";
  document.getElementById("setting-logo-text").value = s.logoText || "";
  document.getElementById("setting-currency").value = s.currency || "UGX";
  document.getElementById("setting-currency-symbol").value = s.currencySymbol || "UGX";
  document.getElementById("setting-phone").value = s.phone || "";
  document.getElementById("setting-email").value = s.email || "";
  document.getElementById("setting-address").value = s.address || "";
}

function setupSettingsForm() {
  const form = document.getElementById("settings-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const s = AppStore.data.settings;
    s.businessName = document.getElementById("setting-biz-name").value;
    s.tagline = document.getElementById("setting-tagline").value;
    s.logoText = document.getElementById("setting-logo-text").value;
    s.currency = document.getElementById("setting-currency").value;
    s.currencySymbol = document.getElementById("setting-currency-symbol").value;
    s.phone = document.getElementById("setting-phone").value;
    s.email = document.getElementById("setting-email").value;
    s.address = document.getElementById("setting-address").value;
    
    AppStore.save();
    updateBrandingDOM();
    showToast("Branding & Organization settings saved successfully!", "success");
  });
}

/* ==========================================================================
   CALCULATOR ENGINE & SCHEDULE GENERATOR
   ========================================================================== */
function calculateAmortization(principal, annualRate, months, interestType = "Flat Rate") {
  principal = parseFloat(principal || 0);
  annualRate = parseFloat(annualRate || 0);
  months = parseInt(months || 1);

  const schedule = [];
  let totalInterest = 0;

  if (interestType === "Flat Rate") {
    totalInterest = principal * (annualRate / 100) * (months / 12);
    const monthlyPrincipal = principal / months;
    const monthlyInterest = totalInterest / months;
    const monthlyTotal = monthlyPrincipal + monthlyInterest;

    let startDate = new Date();

    for (let i = 1; i <= months; i++) {
      startDate.setMonth(startDate.getMonth() + 1);
      const dateStr = startDate.toISOString().split("T")[0];

      schedule.push({
        installmentNo: i,
        dueDate: dateStr,
        principal: parseFloat(monthlyPrincipal.toFixed(2)),
        interest: parseFloat(monthlyInterest.toFixed(2)),
        total: parseFloat(monthlyTotal.toFixed(2)),
        paidAmount: 0,
        status: "Pending",
        paidDate: null
      });
    }
  } else {
    // Reducing Balance Formula
    const r = (annualRate / 100) / 12;
    const emi = (r === 0) ? (principal / months) : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    
    let remaining = principal;
    let startDate = new Date();

    for (let i = 1; i <= months; i++) {
      startDate.setMonth(startDate.getMonth() + 1);
      const dateStr = startDate.toISOString().split("T")[0];

      const interestForMonth = remaining * r;
      const principalForMonth = emi - interestForMonth;
      remaining -= principalForMonth;
      totalInterest += interestForMonth;

      schedule.push({
        installmentNo: i,
        dueDate: dateStr,
        principal: parseFloat(principalForMonth.toFixed(2)),
        interest: parseFloat(interestForMonth.toFixed(2)),
        total: parseFloat(emi.toFixed(2)),
        paidAmount: 0,
        status: "Pending",
        paidDate: null
      });
    }
  }

  return {
    totalRepayable: parseFloat((principal + totalInterest).toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    schedule: schedule
  };
}

/* ==========================================================================
   MODALS & ACTIONS IMPLEMENTATION
   ========================================================================== */
function setupModals() {
  document.querySelectorAll(".modal-close-btn, .modal-cancel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
    });
  });

  // Borrower form submit
  const borrowerForm = document.getElementById("form-add-borrower");
  if (borrowerForm) {
    borrowerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newB = {
        id: "BOR-" + (1000 + AppStore.data.borrowers.length + 1),
        firstName: document.getElementById("bor-fname").value,
        lastName: document.getElementById("bor-lname").value,
        nin: document.getElementById("bor-nin").value,
        phone: document.getElementById("bor-phone").value,
        email: document.getElementById("bor-email").value,
        address: document.getElementById("bor-address").value,
        employment: document.getElementById("bor-emp").value,
        monthlyIncome: parseFloat(document.getElementById("bor-income").value || 0),
        creditScore: Math.floor(Math.random() * (850 - 600) + 600),
        status: "Active",
        registeredDate: new Date().toISOString().split("T")[0]
      };

      AppStore.data.borrowers.push(newB);
      AppStore.save();
      document.getElementById("modal-add-borrower").classList.remove("active");
      borrowerForm.reset();
      showToast(`Borrower ${newB.firstName} ${newB.lastName} registered successfully!`, "success");
      renderBorrowersView();
    });
  }

  // Loan application form submit
  const loanForm = document.getElementById("form-add-loan");
  if (loanForm) {
    loanForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const borrowerSelect = document.getElementById("loan-bor-select");
      const productSelect = document.getElementById("loan-prod-select");
      const amount = parseFloat(document.getElementById("loan-amount").value);
      const months = parseInt(document.getElementById("loan-months").value);

      const bor = AppStore.data.borrowers.find(b => b.id === borrowerSelect.value);
      const prod = AppStore.data.loanProducts.find(p => p.id === productSelect.value);

      if (!bor || !prod) return;

      const calc = calculateAmortization(amount, prod.interestRate, months, prod.interestType);

      const newLoan = {
        id: "LN-2026-0" + (AppStore.data.loans.length + 1),
        borrowerId: bor.id,
        borrowerName: `${bor.firstName} ${bor.lastName}`,
        productId: prod.id,
        productName: prod.name,
        principalAmount: amount,
        interestRate: prod.interestRate,
        termMonths: months,
        repaymentFrequency: "Monthly",
        applicationDate: new Date().toISOString().split("T")[0],
        approvalDate: null,
        releaseDate: null,
        status: "Pending Approval",
        disbursedBy: "-",
        collateral: document.getElementById("loan-collateral").value || "General Agreement Pledge",
        totalRepayable: calc.totalRepayable,
        totalPaid: 0,
        remainingBalance: calc.totalRepayable,
        schedule: calc.schedule
      };

      AppStore.data.loans.push(newLoan);
      AppStore.save();
      document.getElementById("modal-add-loan").classList.remove("active");
      loanForm.reset();
      showToast(`Loan application ${newLoan.id} submitted for approval!`, "success");
      renderLoansView();
    });
  }

  // Record Repayment form submit
  const repayForm = document.getElementById("form-record-repayment");
  if (repayForm) {
    repayForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const loanId = document.getElementById("repay-loan-select").value;
      const amountPaid = parseFloat(document.getElementById("repay-amount").value);
      const method = document.getElementById("repay-method").value;
      const ref = document.getElementById("repay-ref").value;

      const loan = AppStore.data.loans.find(l => l.id === loanId);
      if (!loan) return;

      // Find first pending or overdue installment
      let nextInst = loan.schedule.find(s => s.status === 'Pending' || s.status === 'Overdue');
      if (nextInst) {
        nextInst.status = "Paid";
        nextInst.paidAmount = amountPaid;
        nextInst.paidDate = new Date().toISOString().split("T")[0];
      }

      loan.totalPaid = parseFloat((loan.totalPaid + amountPaid).toFixed(2));
      loan.remainingBalance = Math.max(0, parseFloat((loan.totalRepayable - loan.totalPaid).toFixed(2)));

      if (loan.remainingBalance === 0) {
        loan.status = "Completed";
      }

      const receiptNo = "RCP-" + Math.floor(1000 + Math.random() * 9000);
      const newRepay = {
        receiptNo: receiptNo,
        loanId: loan.id,
        borrowerName: loan.borrowerName,
        paymentDate: new Date().toISOString().split("T")[0],
        amountPaid: amountPaid,
        principalPaid: nextInst ? nextInst.principal : amountPaid * 0.85,
        interestPaid: nextInst ? nextInst.interest : amountPaid * 0.15,
        penaltyPaid: 0,
        paymentMethod: method,
        referenceNo: ref,
        receivedBy: AppStore.data.currentUser.name,
        notes: "Installment payment recorded via front-end ledger"
      };

      AppStore.data.repayments.push(newRepay);
      AppStore.save();
      document.getElementById("modal-record-repayment").classList.remove("active");
      repayForm.reset();
      
      showToast(`Repayment ${receiptNo} recorded successfully!`, "success");
      printReceiptModal(receiptNo);
      renderRepaymentsView();
    });
  }
}

function setupCalculators() {
  const amtInput = document.getElementById("loan-amount");
  const monthsInput = document.getElementById("loan-months");
  const prodSelect = document.getElementById("loan-prod-select");

  function updateCalcDisplay() {
    if (!amtInput || !monthsInput || !prodSelect) return;
    const amount = parseFloat(amtInput.value || 0);
    const months = parseInt(monthsInput.value || 1);
    const prod = AppStore.data.loanProducts.find(p => p.id === prodSelect.value);

    if (!prod || amount <= 0) return;

    const calc = calculateAmortization(amount, prod.interestRate, months, prod.interestType);
    document.getElementById("calc-preview-interest").textContent = formatCurrency(calc.totalInterest);
    document.getElementById("calc-preview-total").textContent = formatCurrency(calc.totalRepayable);
    document.getElementById("calc-preview-monthly").textContent = formatCurrency(calc.schedule[0]?.total || 0);
  }

  if (amtInput) amtInput.addEventListener("input", updateCalcDisplay);
  if (monthsInput) monthsInput.addEventListener("input", updateCalcDisplay);
  if (prodSelect) prodSelect.addEventListener("change", updateCalcDisplay);
}

// Action Handlers
function openBorrowerModal() {
  document.getElementById("modal-add-borrower").classList.add("active");
}

function openNewLoanModal() {
  // Populate borrower select dropdown
  const borSelect = document.getElementById("loan-bor-select");
  if (borSelect) {
    borSelect.innerHTML = AppStore.data.borrowers.map(b => `
      <option value="${b.id}">${b.firstName} ${b.lastName} (${b.id})</option>
    `).join('');
  }

  // Populate product select dropdown
  const prodSelect = document.getElementById("loan-prod-select");
  if (prodSelect) {
    prodSelect.innerHTML = AppStore.data.loanProducts.map(p => `
      <option value="${p.id}">${p.name} - ${p.interestRate}%</option>
    `).join('');
  }

  document.getElementById("modal-add-loan").classList.add("active");
}

function openNewLoanModalWithBorrower(borId) {
  openNewLoanModal();
  const borSelect = document.getElementById("loan-bor-select");
  if (borSelect) borSelect.value = borId;
}

function changeLoanStatus(loanId, newStatus) {
  const loan = AppStore.data.loans.find(l => l.id === loanId);
  if (loan) {
    loan.status = newStatus;
    if (newStatus === 'Approved') loan.approvalDate = new Date().toISOString().split("T")[0];
    AppStore.save();
    showToast(`Loan ${loanId} status updated to ${newStatus}`, "success");
    renderLoansView();
  }
}

function disburseLoanModal(loanId) {
  const loan = AppStore.data.loans.find(l => l.id === loanId);
  if (loan) {
    loan.status = "Active";
    loan.releaseDate = new Date().toISOString().split("T")[0];
    loan.disbursedBy = AppStore.data.currentUser.name;
    AppStore.save();
    showToast(`Loan ${loanId} disbursed/released to borrower successfully!`, "success");
    renderLoansView();
  }
}

function openRecordRepaymentModal() {
  const select = document.getElementById("repay-loan-select");
  if (select) {
    select.innerHTML = AppStore.data.loans
      .filter(l => l.status === "Active" || l.status === "Overdue")
      .map(l => `<option value="${l.id}">${l.id} - ${l.borrowerName} (Bal: ${formatCurrency(l.remainingBalance)})</option>`)
      .join('');
    
    // auto update amount
    select.addEventListener("change", () => {
      const selectedLoan = AppStore.data.loans.find(l => l.id === select.value);
      if (selectedLoan && selectedLoan.schedule) {
        const nextInst = selectedLoan.schedule.find(s => s.status === 'Pending' || s.status === 'Overdue');
        if (nextInst) {
          document.getElementById("repay-amount").value = nextInst.total;
        }
      }
    });

    // trigger initial change
    select.dispatchEvent(new Event("change"));
  }

  document.getElementById("modal-record-repayment").classList.add("active");
}

function openRecordRepaymentModalForLoan(loanId) {
  openRecordRepaymentModal();
  const select = document.getElementById("repay-loan-select");
  if (select) {
    select.value = loanId;
    select.dispatchEvent(new Event("change"));
  }
}

// 9. PRINTABLE RECEIPT MODAL
function printReceiptModal(receiptNo) {
  const r = AppStore.data.repayments.find(x => x.receiptNo === receiptNo);
  if (!r) return;

  const s = AppStore.data.settings;
  const body = document.getElementById("printable-receipt-content");
  if (!body) return;

  body.innerHTML = `
    <div class="printable-document">
      <div class="print-header">
        <div class="print-brand">
          <h2>${s.businessName}</h2>
          <p>${s.address}</p>
          <p>Phone: ${s.phone} | Email: ${s.email}</p>
        </div>
        <div class="print-title">
          <h3>PAYMENT RECEIPT</h3>
          <p>Receipt #: <strong>${r.receiptNo}</strong></p>
          <p>Date: ${formatDate(r.paymentDate)}</p>
        </div>
      </div>
      <div class="print-details-grid">
        <div class="print-box">
          <h4>Received From</h4>
          <p><strong>Borrower:</strong> ${r.borrowerName}</p>
          <p><strong>Loan Account:</strong> ${r.loanId}</p>
        </div>
        <div class="print-box">
          <h4>Payment Info</h4>
          <p><strong>Method:</strong> ${r.paymentMethod}</p>
          <p><strong>Reference #:</strong> ${r.referenceNo || 'N/A'}</p>
          <p><strong>Issued By:</strong> ${r.receivedBy}</p>
        </div>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Loan Principal Breakdown</td>
            <td style="text-align:right;">${formatCurrency(r.principalPaid)}</td>
          </tr>
          <tr>
            <td>Interest Fee Paid</td>
            <td style="text-align:right;">${formatCurrency(r.interestPaid)}</td>
          </tr>
          ${r.penaltyPaid > 0 ? `
          <tr>
            <td>Late Penalty Fee</td>
            <td style="text-align:right;">${formatCurrency(r.penaltyPaid)}</td>
          </tr>
          ` : ''}
          <tr style="font-weight:bold; background:#F1F5F9;">
            <td>TOTAL AMOUNT RECEIVED</td>
            <td style="text-align:right; font-size:14px; color:${s.currencySymbol};">${formatCurrency(r.amountPaid)}</td>
          </tr>
        </tbody>
      </table>
      <div class="print-signature-area">
        <div class="sig-line">Borrower Signature</div>
        <div class="sig-line">Authorized Officer Signature</div>
      </div>
    </div>
  `;

  document.getElementById("modal-print-receipt").classList.add("active");
}

// 10. PRINTABLE BORROWER STATEMENT MODAL
function openBorrowerProfileModal(borId) {
  const b = AppStore.data.borrowers.find(x => x.id === borId);
  if (!b) return;

  const loans = AppStore.data.loans.filter(l => l.borrowerId === borId);
  const s = AppStore.data.settings;

  const body = document.getElementById("printable-statement-content");
  if (!body) return;

  body.innerHTML = `
    <div class="printable-document">
      <div class="print-header">
        <div class="print-brand">
          <h2>${s.businessName}</h2>
          <p>${s.address}</p>
          <p>Phone: ${s.phone}</p>
        </div>
        <div class="print-title">
          <h3>BORROWER STATEMENT</h3>
          <p>Date: ${formatDate(new Date().toISOString().split("T")[0])}</p>
        </div>
      </div>
      <div class="print-details-grid">
        <div class="print-box">
          <h4>Borrower Information</h4>
          <p><strong>Name:</strong> ${b.firstName} ${b.lastName}</p>
          <p><strong>NIN / ID:</strong> ${b.nin}</p>
          <p><strong>Phone:</strong> ${b.phone}</p>
          <p><strong>Credit Score:</strong> ${b.creditScore}</p>
        </div>
        <div class="print-box">
          <h4>Account Summary</h4>
          <p><strong>Total Credit Facilities:</strong> ${loans.length}</p>
          <p><strong>Total Amount Borrowed:</strong> ${formatCurrency(loans.reduce((acc, curr) => acc + curr.principalAmount, 0))}</p>
          <p><strong>Current Outstanding Balance:</strong> ${formatCurrency(loans.reduce((acc, curr) => acc + curr.remainingBalance, 0))}</p>
        </div>
      </div>
      <h4>Loan History & Accounts</h4>
      <table class="print-table">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Product</th>
            <th>Principal</th>
            <th>Total Paid</th>
            <th>Balance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${loans.map(l => `
            <tr>
              <td>${l.id}</td>
              <td>${l.productName}</td>
              <td>${formatCurrency(l.principalAmount)}</td>
              <td>${formatCurrency(l.totalPaid)}</td>
              <td>${formatCurrency(l.remainingBalance)}</td>
              <td>${l.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="print-signature-area">
        <div class="sig-line">Credit Officer Signature</div>
        <div class="sig-line">System Verification Stamp</div>
      </div>
    </div>
  `;

  document.getElementById("modal-print-statement").classList.add("active");
}

// 11. LOAN DETAILS & AMORTIZATION SCHEDULE MODAL
function openLoanDetailsModal(loanId) {
  const l = AppStore.data.loans.find(x => x.id === loanId);
  if (!l) return;

  const container = document.getElementById("loan-details-modal-content");
  if (!container) return;

  container.innerHTML = `
    <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h3 style="font-size:18px; color:var(--bg-primary);">${l.productName} (${l.id})</h3>
        <p style="font-size:12px; color:#64748B;">Borrower: <strong>${l.borrowerName}</strong> | Applied: ${formatDate(l.applicationDate)}</p>
      </div>
      <span class="status-badge ${l.status.toLowerCase().replace(' ', '-')}">${l.status}</span>
    </div>
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; background:#F8FAFC; padding:14px; border-radius:8px; margin-bottom:20px; font-size:12px;">
      <div><span style="color:#64748B;">Principal:</span> <br><strong>${formatCurrency(l.principalAmount)}</strong></div>
      <div><span style="color:#64748B;">Interest Rate:</span> <br><strong>${l.interestRate}%</strong></div>
      <div><span style="color:#64748B;">Total Paid:</span> <br><strong style="color:#059669;">${formatCurrency(l.totalPaid)}</strong></div>
      <div><span style="color:#64748B;">Remaining Balance:</span> <br><strong style="color:#DC2626;">${formatCurrency(l.remainingBalance)}</strong></div>
    </div>
    <h4>Repayment Amortization Schedule</h4>
    <div style="max-height:300px; overflow-y:auto; margin-top:10px;">
      <table class="custom-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Due Date</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Total Installment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${l.schedule && l.schedule.length > 0 ? l.schedule.map(s => `
            <tr>
              <td>Inst #${s.installmentNo}</td>
              <td>${formatDate(s.dueDate)}</td>
              <td>${formatCurrency(s.principal)}</td>
              <td>${formatCurrency(s.interest)}</td>
              <td><strong>${formatCurrency(s.total)}</strong></td>
              <td><span class="status-badge ${s.status.toLowerCase()}">${s.status}</span></td>
            </tr>
          `).join('') : `<tr><td colspan="6" style="text-align:center; color:#888;">Schedule generated upon approval/disbursement.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById("modal-loan-details").classList.add("active");
}

function triggerPrint() {
  window.print();
}
