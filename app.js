// Alpha Financial Services - Production Engine & Controller

let AppStore = {
  data: null,

  init() {
    const saved = localStorage.getItem("ALPHA_FINANCIAL_STORE");
    if (saved) {
      try {
        this.data = JSON.parse(saved);
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

document.addEventListener("DOMContentLoaded", () => {
  AppStore.init();
  initUI();
  renderCurrentView("dashboard");
});

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
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `<i class="ri-information-line"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

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

  document.querySelectorAll(".brand-title-box h1").forEach(el => el.textContent = s.businessName);
  document.querySelectorAll(".brand-title-box span").forEach(el => el.textContent = s.logoText);
  document.querySelectorAll(".currency-code-display").forEach(el => el.textContent = s.currency);
  document.querySelectorAll(".currency-symbol-display").forEach(el => el.textContent = s.currencySymbol);

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
    showToast(`Switched active operator role to ${next}`, "info");
    const activeView = document.querySelector(".sidebar-nav .nav-item.active")?.getAttribute("data-view") || "dashboard";
    renderCurrentView(activeView);
  });
}

function renderCurrentView(viewName) {
  document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
  
  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) targetSec.classList.add("active");

  const titles = {
    dashboard: { title: "Portfolio Performance & Exposure", sub: "Institutional credit analytics & real-time capital allocation" },
    borrowers: { title: "Borrower Master Registry", sub: "Client profiles, TIN/NIN records & CRB risk ratings" },
    loans: { title: "Credit Origination Pipeline", sub: "Facility applications, underwriting review & disbursement" },
    repayments: { title: "Disbursement & Amortization Ledger", sub: "Repayment collection records & schedule audits" },
    arrears: { title: "Non-Performing Assets & Arrears", sub: "Delinquency management, penalty accruals & collection risk" },
    products: { title: "Credit Facility Products & Rates", sub: "Configure loan structures, interest matrices & processing fees" },
    reports: { title: "Portfolio Yield & Exposure Analytics", sub: "Financial statement summaries & audit exports" },
    settings: { title: "Institution Parameters & Configuration", sub: "Organization branding, legal identity & currency options" }
  };

  if (titles[viewName]) {
    document.getElementById("page-title-text").textContent = titles[viewName].title;
    document.getElementById("page-subtitle-text").textContent = titles[viewName].sub;
  }

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

function renderDashboardView() {
  const loans = AppStore.data.loans;
  const repayments = AppStore.data.repayments;
  const borrowers = AppStore.data.borrowers;

  let totalPortfolio = 0;
  let activeCount = 0;
  let totalCollected = 0;
  let totalArrears = 0;

  loans.forEach(l => {
    if (l.status === "Active" || l.status === "Overdue" || l.status === "Released") {
      totalPortfolio += parseFloat(l.principalAmount || 0);
      if (l.status === "Active" || l.status === "Overdue") activeCount++;
    }
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

  const recentTable = document.getElementById("dashboard-recent-table");
  if (recentTable) {
    const recent = repayments.slice(-5).reverse();
    recentTable.innerHTML = recent.length === 0 ? 
      `<tr><td colspan="5"><div class="table-empty-state"><i class="ri-history-line"></i><h4>No Recent Ledger Entries</h4><p>Repayments will appear here once recorded.</p></div></td></tr>` :
      recent.map(r => `
        <tr>
          <td><strong class="receipt-no">${r.receiptNo}</strong></td>
          <td>${r.borrowerName}</td>
          <td>${formatDate(r.paymentDate)}</td>
          <td class="font-tabular"><strong style="color:var(--accent-emerald);">${formatCurrency(r.amountPaid)}</strong></td>
          <td><span class="status-badge active">${r.paymentMethod}</span></td>
        </tr>
      `).join('');
  }

  const alertsContainer = document.getElementById("dashboard-alerts-widget");
  if (alertsContainer) {
    const overdueLoans = loans.filter(l => l.status === "Overdue");
    if (overdueLoans.length === 0) {
      alertsContainer.innerHTML = `<div style="padding:14px; color:var(--accent-emerald); font-size:12px; font-weight:700;"><i class="ri-checkbox-circle-line"></i> All portfolio credit facilities are currently performing.</div>`;
    } else {
      alertsContainer.innerHTML = overdueLoans.map(l => `
        <div class="ai-recommendation-item" onclick="openLoanDetailsModal('${l.id}')">
          <i class="ri-error-warning-line" style="color:var(--accent-crimson);"></i>
          <div>
            <strong>${l.borrowerName} (${l.id})</strong>
            <p style="font-size:11px; opacity:0.8;">Outstanding: ${formatCurrency(l.remainingBalance)} - Immediate review required</p>
          </div>
        </div>
      `).join('');
    }
  }

  renderDashboardCharts();
}

function renderDashboardCharts() {
  const chartCanvas = document.getElementById("chart-portfolio-mix");
  if (!chartCanvas) return;

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

  let html = `<div style="display:flex; flex-direction:column; gap:12px; margin-top:6px;">`;
  const colors = ["#091322", "#047857", "#B45309", "#1D4ED8"];
  let i = 0;
  for (const [pname, val] of Object.entries(productCounts)) {
    const pct = Math.round((val / total) * 100);
    const col = colors[i % colors.length];
    html += `
      <div>
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
          <span>${pname}</span>
          <span class="font-tabular">${formatCurrency(val)} (${pct}%)</span>
        </div>
        <div style="height:8px; background:var(--surface-subtle); border-radius:4px; overflow:hidden;">
          <div style="width:${pct}%; height:100%; background:${col}; border-radius:4px;"></div>
        </div>
      </div>
    `;
    i++;
  }
  html += `</div>`;
  chartCanvas.innerHTML = html;
}

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
    `<tr><td colspan="7"><div class="table-empty-state"><i class="ri-user-search-line"></i><h4>No Borrowers Matching Criteria</h4><p>Verify search parameters or register a new borrower profile.</p></div></td></tr>` :
    list.map(b => {
      const activeLoansCount = AppStore.data.loans.filter(l => l.borrowerId === b.id && l.status === 'Active').length;
      return `
        <tr>
          <td><strong class="id-code">${b.id}</strong></td>
          <td>
            <div style="font-weight:700; color:var(--text-primary);">${b.firstName} ${b.lastName}</div>
            <div style="font-size:11px; color:var(--text-muted);">NIN: ${b.nin}</div>
          </td>
          <td>
            <div>${b.phone}</div>
            <div style="font-size:11px; color:var(--text-muted);">${b.email}</div>
          </td>
          <td>${b.employment}</td>
          <td>
            <span class="status-badge ${b.creditScore >= 700 ? 'active' : b.creditScore >= 600 ? 'pending' : 'overdue'}">
              CRB Score: ${b.creditScore}
            </span>
          </td>
          <td><strong>${activeLoansCount} Active Facilities</strong></td>
          <td>
            <div class="action-btn-group">
              <button class="action-icon" title="View Master Statement" onclick="openBorrowerProfileModal('${b.id}')">
                <i class="ri-file-text-line"></i>
              </button>
              <button class="action-icon" title="New Facility Application" onclick="openNewLoanModalWithBorrower('${b.id}')">
                <i class="ri-add-circle-line"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
}

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
    `<tr><td colspan="8"><div class="table-empty-state"><i class="ri-folder-open-line"></i><h4>No Credit Applications Found</h4><p>No active or historical facilities match the current status filter.</p></div></td></tr>` :
    list.map(l => `
      <tr>
        <td><strong class="id-code">${l.id}</strong></td>
        <td>
          <div style="font-weight:700;">${l.borrowerName}</div>
          <div style="font-size:11px; color:var(--text-muted);">Ref: ${l.borrowerId}</div>
        </td>
        <td>${l.productName}</td>
        <td class="font-tabular"><strong>${formatCurrency(l.principalAmount)}</strong></td>
        <td class="font-tabular">${l.interestRate}% (${l.termMonths} Mths)</td>
        <td>
          <span class="status-badge ${l.status.toLowerCase().replace(' ', '-')}">
            ${l.status}
          </span>
        </td>
        <td class="font-tabular"><strong>${formatCurrency(l.remainingBalance)}</strong></td>
        <td>
          <div class="action-btn-group">
            <button class="action-icon" title="View Schedule & Lifecycle" onclick="openLoanDetailsModal('${l.id}')">
              <i class="ri-eye-line"></i>
            </button>
            ${l.status === 'Pending Approval' ? `
              <button class="action-icon" style="color:var(--accent-emerald);" title="Approve Facility" onclick="changeLoanStatus('${l.id}', 'Approved')">
                <i class="ri-check-line"></i>
              </button>
              <button class="action-icon" style="color:var(--accent-crimson);" title="Decline Facility" onclick="changeLoanStatus('${l.id}', 'Denied')">
                <i class="ri-close-line"></i>
              </button>
            ` : ''}
            ${l.status === 'Approved' ? `
              <button class="action-icon" style="color:var(--accent-navy);" title="Disburse Capital" onclick="disburseLoanModal('${l.id}')">
                <i class="ri-send-plane-line"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
}

function renderRepaymentsView() {
  const container = document.getElementById("repayments-table-body");
  if (!container) return;

  const query = (document.getElementById("repayment-search-input")?.value || "").toLowerCase();
  const list = AppStore.data.repayments.filter(r => 
    r.receiptNo.toLowerCase().includes(query) ||
    r.borrowerName.toLowerCase().includes(query) ||
    r.loanId.toLowerCase().includes(query) ||
    r.referenceNo.toLowerCase().includes(query)
  );

  container.innerHTML = list.length === 0 ?
    `<tr><td colspan="7"><div class="table-empty-state"><i class="ri-refund-2-line"></i><h4>No Repayment Receipts Found</h4><p>Try searching by receipt reference or borrower name.</p></div></td></tr>` :
    list.map(r => `
      <tr>
        <td><strong class="receipt-no">${r.receiptNo}</strong></td>
        <td><strong class="id-code">${r.loanId}</strong></td>
        <td><strong>${r.borrowerName}</strong></td>
        <td>${formatDate(r.paymentDate)}</td>
        <td class="font-tabular"><strong style="color:var(--accent-emerald);">${formatCurrency(r.amountPaid)}</strong></td>
        <td><span class="status-badge active">${r.paymentMethod}</span></td>
        <td>
          <button class="action-icon" title="Print Official Receipt" onclick="printReceiptModal('${r.receiptNo}')">
            <i class="ri-printer-line"></i>
          </button>
        </td>
      </tr>
    `).join('');
}

function renderArrearsView() {
  const container = document.getElementById("arrears-table-body");
  if (!container) return;

  const overdueLoans = AppStore.data.loans.filter(l => l.status === "Overdue");
  document.getElementById("overdue-badge-count").textContent = overdueLoans.length;

  container.innerHTML = overdueLoans.length === 0 ?
    `<tr><td colspan="7"><div class="table-empty-state"><i class="ri-shield-check-line"></i><h4>Zero Delinquent Facilities</h4><p>All active loans are fully up to date with repayment schedules.</p></div></td></tr>` :
    overdueLoans.map(l => {
      const overdueInstallment = l.schedule?.find(s => s.status === "Overdue");
      const penalty = overdueInstallment?.penalty || 0;
      const totalDue = (overdueInstallment?.total || 0) + penalty;
      return `
        <tr>
          <td><strong class="id-code">${l.id}</strong></td>
          <td><strong>${l.borrowerName}</strong></td>
          <td>${l.productName}</td>
          <td class="font-tabular" style="color:var(--accent-crimson); font-weight:700;">${overdueInstallment?.dueDate ? formatDate(overdueInstallment.dueDate) : 'Overdue'}</td>
          <td class="font-tabular">${formatCurrency(penalty)}</td>
          <td class="font-tabular"><strong style="color:var(--accent-crimson);">${formatCurrency(totalDue)}</strong></td>
          <td>
            <div class="action-btn-group">
              <button class="btn-secondary btn-sm" onclick="openRecordRepaymentForLoan('${l.id}')">Record Pay</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
}

function renderProductsView() {
  const container = document.getElementById("products-grid-container");
  if (!container) return;

  container.innerHTML = AppStore.data.loanProducts.map(p => `
    <div class="card" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <span class="status-badge active">${p.id}</span>
          <span style="font-size:12px; font-weight:800; color:var(--accent-navy);">${p.interestRate}% P.A.</span>
        </div>
        <h4 style="font-size:16px; font-weight:800; color:var(--text-primary); margin-bottom:6px;">${p.name}</h4>
        <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin-bottom:16px;">${p.description}</p>
      </div>
      <div>
        <div style="border-top:1px solid var(--border-hairline); padding-top:12px; display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px;" class="font-tabular">
          <div><span style="color:var(--text-muted);">Range:</span> <strong style="display:block;">${formatCurrency(p.minAmount)} - ${formatCurrency(p.maxAmount)}</strong></div>
          <div><span style="color:var(--text-muted);">Max Tenure:</span> <strong style="display:block;">${p.termMonths} Months</strong></div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderReportsView() {
  const loans = AppStore.data.loans;
  const repayments = AppStore.data.repayments;

  let totalDisbursed = 0;
  let totalInterestEarned = 0;

  loans.forEach(l => {
    if (l.status === "Active" || l.status === "Completed" || l.status === "Overdue") {
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
    showToast("Institution parameters saved successfully!", "success");
  });
}

function calculateAmortization(principal, annualRate, months, interestType = "Flat Rate") {
  principal = parseFloat(principal || 0);
  annualRate = parseFloat(annualRate || 0);
  months = parseInt(months || 1);

  const schedule = [];
  let totalInterest = 0;

  if (interestType === "Flat Rate") {
    totalInterest = principal * (annualRate / 100) * (months / 12);
    const totalRepayable = principal + totalInterest;
    const monthlyTotal = totalRepayable / months;
    const monthlyPrincipal = principal / months;
    const monthlyInterest = totalInterest / months;

    let currentDate = new Date();
    for (let i = 1; i <= months; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      schedule.push({
        installmentNo: i,
        dueDate: currentDate.toISOString().split('T')[0],
        principal: parseFloat(monthlyPrincipal.toFixed(2)),
        interest: parseFloat(monthlyInterest.toFixed(2)),
        total: parseFloat(monthlyTotal.toFixed(2)),
        paidAmount: 0,
        status: "Pending",
        paidDate: null
      });
    }
    return { totalInterest, totalRepayable, monthlyInstallment: monthlyTotal, schedule };
  } else {
    const monthlyRate = (annualRate / 100) / 12;
    const monthlyInstallment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    let balance = principal;
    let currentDate = new Date();

    for (let i = 1; i <= months; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyInstallment - interestPayment;
      balance -= principalPayment;
      totalInterest += interestPayment;

      schedule.push({
        installmentNo: i,
        dueDate: currentDate.toISOString().split('T')[0],
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        total: parseFloat(monthlyInstallment.toFixed(2)),
        paidAmount: 0,
        status: "Pending",
        paidDate: null
      });
    }
    return { totalInterest, totalRepayable: principal + totalInterest, monthlyInstallment, schedule };
  }
}

function setupCalculators() {
  const pInput = document.getElementById("loan-principal");
  const rInput = document.getElementById("loan-rate");
  const mInput = document.getElementById("loan-months");
  const prodSelect = document.getElementById("loan-product-select");

  const updateCalc = () => {
    if (!pInput || !rInput || !mInput) return;
    const p = parseFloat(pInput.value || 0);
    const r = parseFloat(rInput.value || 0);
    const m = parseInt(mInput.value || 1);
    
    let interestType = "Flat Rate";
    if (prodSelect) {
      const selectedProd = AppStore.data.loanProducts.find(x => x.id === prodSelect.value);
      if (selectedProd) interestType = selectedProd.interestType;
    }

    const calc = calculateAmortization(p, r, m, interestType);
    
    const elInterest = document.getElementById("calc-preview-interest");
    const elMonthly = document.getElementById("calc-preview-monthly");
    const elTotal = document.getElementById("calc-preview-total");

    if (elInterest) elInterest.textContent = formatCurrency(calc.totalInterest);
    if (elMonthly) elMonthly.textContent = formatCurrency(calc.monthlyInstallment);
    if (elTotal) elTotal.textContent = formatCurrency(calc.totalRepayable);
  };

  [pInput, rInput, mInput, prodSelect].forEach(el => {
    if (el) el.addEventListener("input", updateCalc);
  });
}

function setupModals() {
  document.querySelectorAll(".modal-close-btn, .modal-cancel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
    });
  });

  const newLoanForm = document.getElementById("form-new-loan");
  if (newLoanForm) {
    newLoanForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const borrowerId = document.getElementById("loan-borrower-select").value;
      const productId = document.getElementById("loan-product-select").value;
      const principal = parseFloat(document.getElementById("loan-principal").value);
      const interestRate = parseFloat(document.getElementById("loan-rate").value);
      const termMonths = parseInt(document.getElementById("loan-months").value);
      const collateral = document.getElementById("loan-collateral").value;

      const borrower = AppStore.data.borrowers.find(b => b.id === borrowerId);
      const product = AppStore.data.loanProducts.find(p => p.id === productId);

      const calc = calculateAmortization(principal, interestRate, termMonths, product?.interestType || "Flat Rate");

      const newLoan = {
        id: `LN-2026-00${AppStore.data.loans.length + 1}`,
        borrowerId,
        borrowerName: `${borrower?.firstName} ${borrower?.lastName}`,
        productId,
        productName: product?.name || "Standard Facility",
        principalAmount: principal,
        interestRate,
        termMonths,
        repaymentFrequency: "Monthly",
        applicationDate: new Date().toISOString().split('T')[0],
        approvalDate: null,
        releaseDate: null,
        status: "Pending Approval",
        disbursedBy: "-",
        collateral,
        totalRepayable: calc.totalRepayable,
        totalPaid: 0,
        remainingBalance: calc.totalRepayable,
        schedule: calc.schedule
      };

      AppStore.data.loans.unshift(newLoan);
      AppStore.save();

      document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
      newLoanForm.reset();
      showToast(`Credit Application ${newLoan.id} submitted for underwriting approval!`, "success");
      renderCurrentView("loans");
    });
  }

  const newBorrowerForm = document.getElementById("form-new-borrower");
  if (newBorrowerForm) {
    newBorrowerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newB = {
        id: `BOR-${1000 + AppStore.data.borrowers.length + 1}`,
        firstName: document.getElementById("bor-firstname").value,
        lastName: document.getElementById("bor-lastname").value,
        nin: document.getElementById("bor-nin").value,
        phone: document.getElementById("bor-phone").value,
        email: document.getElementById("bor-email").value,
        address: document.getElementById("bor-address").value,
        employment: document.getElementById("bor-employment").value,
        monthlyIncome: parseFloat(document.getElementById("bor-income").value || 0),
        creditScore: 720,
        status: "Active",
        registeredDate: new Date().toISOString().split('T')[0]
      };

      AppStore.data.borrowers.unshift(newB);
      AppStore.save();

      document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
      newBorrowerForm.reset();
      showToast(`Borrower ${newB.firstName} ${newB.lastName} registered successfully!`, "success");
      renderCurrentView("borrowers");
    });
  }

  const repayForm = document.getElementById("form-record-repayment");
  if (repayForm) {
    repayForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const loanId = document.getElementById("repay-loan-select").value;
      const amountPaid = parseFloat(document.getElementById("repay-amount").value);
      const method = document.getElementById("repay-method").value;
      const refNo = document.getElementById("repay-ref").value;
      const notes = document.getElementById("repay-notes").value;

      const loan = AppStore.data.loans.find(l => l.id === loanId);
      if (!loan) return;

      const receiptNo = `RCP-${8900 + AppStore.data.repayments.length + 1}`;
      const newRepay = {
        receiptNo,
        loanId,
        borrowerName: loan.borrowerName,
        paymentDate: new Date().toISOString().split('T')[0],
        amountPaid,
        principalPaid: amountPaid * 0.85,
        interestPaid: amountPaid * 0.15,
        penaltyPaid: 0,
        paymentMethod: method,
        referenceNo: refNo,
        receivedBy: AppStore.data.currentUser.name,
        notes
      };

      loan.totalPaid = (loan.totalPaid || 0) + amountPaid;
      loan.remainingBalance = Math.max(0, loan.totalRepayable - loan.totalPaid);

      if (loan.remainingBalance <= 0) {
        loan.status = "Completed";
      }

      AppStore.data.repayments.unshift(newRepay);
      AppStore.save();

      document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
      repayForm.reset();
      showToast(`Payment receipt ${receiptNo} issued successfully!`, "success");
      renderCurrentView("repayments");
    });
  }
}

function openNewLoanModal() {
  const borrowerSelect = document.getElementById("loan-borrower-select");
  const productSelect = document.getElementById("loan-product-select");

  if (borrowerSelect) {
    borrowerSelect.innerHTML = AppStore.data.borrowers.map(b => 
      `<option value="${b.id}">${b.firstName} ${b.lastName} (NIN: ${b.nin})</option>`
    ).join('');
  }

  if (productSelect) {
    productSelect.innerHTML = AppStore.data.loanProducts.map(p => 
      `<option value="${p.id}">${p.name} (${p.interestRate}%)</option>`
    ).join('');
  }

  document.getElementById("modal-new-loan")?.classList.add("active");
}

function openNewLoanModalWithBorrower(borrowerId) {
  openNewLoanModal();
  const select = document.getElementById("loan-borrower-select");
  if (select) select.value = borrowerId;
}

function openNewBorrowerModal() {
  document.getElementById("modal-new-borrower")?.classList.add("active");
}

function openRecordRepaymentModal() {
  const select = document.getElementById("repay-loan-select");
  if (select) {
    const activeLoans = AppStore.data.loans.filter(l => l.status === "Active" || l.status === "Overdue");
    select.innerHTML = activeLoans.map(l => 
      `<option value="${l.id}">${l.id} - ${l.borrowerName} (Balance: ${formatCurrency(l.remainingBalance)})</option>`
    ).join('');
  }
  document.getElementById("modal-record-repayment")?.classList.add("active");
}

function openRecordRepaymentForLoan(loanId) {
  openRecordRepaymentModal();
  const select = document.getElementById("repay-loan-select");
  if (select) select.value = loanId;
}

function changeLoanStatus(loanId, newStatus) {
  const loan = AppStore.data.loans.find(l => l.id === loanId);
  if (loan) {
    loan.status = newStatus;
    if (newStatus === "Approved") loan.approvalDate = new Date().toISOString().split('T')[0];
    AppStore.save();
    showToast(`Credit Application ${loanId} status updated to ${newStatus}`, "info");
    renderCurrentView("loans");
  }
}

function disburseLoanModal(loanId) {
  const loan = AppStore.data.loans.find(l => l.id === loanId);
  if (loan) {
    loan.status = "Active";
    loan.releaseDate = new Date().toISOString().split('T')[0];
    loan.disbursedBy = AppStore.data.currentUser.name;
    AppStore.save();
    showToast(`Capital disbursed successfully for facility ${loanId}!`, "success");
    renderCurrentView("loans");
  }
}

function openLoanDetailsModal(loanId) {
  const loan = AppStore.data.loans.find(l => l.id === loanId);
  if (!loan) return;

  const modal = document.getElementById("modal-loan-details");
  if (!modal) return;

  document.getElementById("modal-loan-title").textContent = `Credit Facility Details - ${loan.id}`;
  document.getElementById("modal-loan-borrower").textContent = loan.borrowerName;
  document.getElementById("modal-loan-product").textContent = loan.productName;
  document.getElementById("modal-loan-principal").textContent = formatCurrency(loan.principalAmount);
  document.getElementById("modal-loan-balance").textContent = formatCurrency(loan.remainingBalance);
  document.getElementById("modal-loan-status").textContent = loan.status;

  const scheduleBody = document.getElementById("modal-loan-schedule-body");
  if (scheduleBody) {
    scheduleBody.innerHTML = (loan.schedule || []).map(s => `
      <tr>
        <td class="font-tabular">#${s.installmentNo}</td>
        <td class="font-tabular">${formatDate(s.dueDate)}</td>
        <td class="font-tabular">${formatCurrency(s.principal)}</td>
        <td class="font-tabular">${formatCurrency(s.interest)}</td>
        <td class="font-tabular"><strong>${formatCurrency(s.total)}</strong></td>
        <td><span class="status-badge ${s.status.toLowerCase()}">${s.status}</span></td>
      </tr>
    `).join('');
  }

  modal.classList.add("active");
}

function openBorrowerProfileModal(borrowerId) {
  const borrower = AppStore.data.borrowers.find(b => b.id === borrowerId);
  if (!borrower) return;

  showToast(`Loading Master Credit File for ${borrower.firstName} ${borrower.lastName}...`, "info");
}

function printReceiptModal(receiptNo) {
  showToast(`Generating Official Receipt PDF for ${receiptNo}...`, "info");
}
