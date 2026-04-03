// ─── Storage ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "expense_tracker_transactions";
const CATEGORIES_KEY = "expense_tracker_categories";
const DEFAULT_CATEGORIES = ["Food", "Transport", "Fun", "Sport"];

const CHART_COLORS = [
  "#4f46e5", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
  "#ec4899", "#14b8a6"
];

function showStorageWarning() {
  if (document.getElementById("storage-warning")) return;
  const banner = document.createElement("div");
  banner.id = "storage-warning";
  banner.textContent = "Warning: Unable to access localStorage. Your data may not be saved.";
  banner.style.cssText =
    "position:fixed;top:0;left:0;right:0;background:#f59e0b;color:#000;padding:8px 16px;text-align:center;z-index:9999;";
  document.body.prepend(banner);
}

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    showStorageWarning();
    return [];
  }
}

function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    showStorageWarning();
  }
}

// ─── Categories ──────────────────────────────────────────────────────────────

function loadCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [...DEFAULT_CATEGORIES];
  } catch (e) {
    return [...DEFAULT_CATEGORIES];
  }
}

function saveCategories(categories) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    showStorageWarning();
  }
}

function addCustomCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const categories = loadCategories();
  if (categories.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) return false;
  categories.push(trimmed);
  saveCategories(categories);
  return trimmed;
}

function populateCategorySelects() {
  const categories = loadCategories();
  const categorySelect = document.getElementById("category");
  const filterSelect = document.getElementById("category-filter");

  // Save current values
  const currentCat = categorySelect.value;
  const currentFilter = filterSelect.value;

  // Rebuild form select
  categorySelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "-- Select Category --";
  categorySelect.appendChild(placeholder);

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  const addOpt = document.createElement("option");
  addOpt.value = "__add__";
  addOpt.textContent = "+ Add category...";
  categorySelect.appendChild(addOpt);

  // Restore value if still valid
  if (currentCat && categories.includes(currentCat)) categorySelect.value = currentCat;

  // Rebuild filter select
  filterSelect.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All Categories";
  filterSelect.appendChild(allOpt);

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterSelect.appendChild(opt);
  });

  // Restore filter value
  if (currentFilter && (currentFilter === "all" || categories.includes(currentFilter))) {
    filterSelect.value = currentFilter;
  }
}

// ─── Validation ─────────────────────────────────────────────────────────────

function validateForm(name, amount, category) {
  const errors = [];
  const categories = loadCategories();

  if (!name || !name.trim()) {
    errors.push("Item name is required.");
  }

  const parsed = parseFloat(amount);
  if (amount === "" || amount === null || isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
    errors.push("Amount must be a positive number.");
  }

  if (!categories.includes(category)) {
    errors.push("Please select a valid category.");
  }

  return { valid: errors.length === 0, errors };
}

// ─── Rendering ──────────────────────────────────────────────────────────────

function renderBalance(transactions) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const el = document.getElementById("balance-amount");
  if (el) el.textContent = "$" + total.toFixed(2);
}

function renderList(transactions) {
  const filter = document.getElementById("category-filter")?.value || "all";
  const filtered = filter === "all" ? transactions : transactions.filter(t => t.category === filter);

  const section = document.getElementById("list");
  if (!section) return;

  const existing = document.getElementById("list-container");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = "list-container";

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.id = "list-empty";
    empty.textContent = filter === "all" ? "No transactions yet." : `No ${filter} transactions.`;
    container.appendChild(empty);
  } else {
    filtered.forEach((t) => {
      const item = document.createElement("div");
      item.className = "transaction-item";

      const nameSpan = document.createElement("span");
      nameSpan.className = "transaction-name";
      nameSpan.textContent = t.name;

      const amountSpan = document.createElement("span");
      amountSpan.className = "transaction-amount";
      amountSpan.textContent = "$" + t.amount.toFixed(2);

      const categorySpan = document.createElement("span");
      categorySpan.className = "transaction-category";
      categorySpan.textContent = t.category;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "transaction-delete";
      deleteBtn.dataset.id = t.id;
      deleteBtn.textContent = "Delete";

      if (t.amount > 100) item.classList.add("over-limit");

      item.appendChild(nameSpan);
      item.appendChild(amountSpan);
      item.appendChild(categorySpan);
      item.appendChild(deleteBtn);
      container.appendChild(item);
    });
  }

  section.appendChild(container);
}

// ─── Chart ──────────────────────────────────────────────────────────────────

let chartInstance = null;

function renderChart(transactions) {
  const canvas = document.getElementById("expense-chart");
  const emptyMsg = document.getElementById("chart-empty");
  const categories = loadCategories();

  if (transactions.length === 0) {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    if (emptyMsg) emptyMsg.style.display = "";
    if (canvas) canvas.style.display = "none";
    return;
  }

  if (!window.Chart) {
    if (emptyMsg) { emptyMsg.textContent = "Chart unavailable (Chart.js failed to load)."; emptyMsg.style.display = ""; }
    if (canvas) canvas.style.display = "none";
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";
  if (canvas) canvas.style.display = "";
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  // Compute totals dynamically for all categories
  const totals = {};
  categories.forEach(cat => { totals[cat] = 0; });
  transactions.forEach(t => {
    if (totals.hasOwnProperty(t.category)) totals[t.category] += t.amount;
    else totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  // Only show categories with spending > 0
  const activeCategories = Object.keys(totals).filter(cat => totals[cat] > 0);
  const data = activeCategories.map(cat => totals[cat]);
  const colors = activeCategories.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  chartInstance = new window.Chart(canvas, {
    type: "pie",
    data: {
      labels: activeCategories,
      datasets: [{ data, backgroundColor: colors }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: ctx => ctx.label + ": $" + ctx.parsed.toFixed(2),
          },
        },
      },
    },
  });
}

function renderAll() {
  const transactions = loadTransactions();
  renderBalance(transactions);
  renderList(transactions);
  renderChart(transactions);
}

// ─── Event Handlers ─────────────────────────────────────────────────────────

function handleAddTransaction(event) {
  event.preventDefault();

  const name = document.getElementById("item-name").value;
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const { valid, errors } = validateForm(name, amount, category);
  const formErrors = document.getElementById("form-errors");
  formErrors.innerHTML = "";

  if (!valid) {
    errors.forEach(msg => {
      const p = document.createElement("p");
      p.textContent = msg;
      formErrors.appendChild(p);
    });
    return;
  }

  const id = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString() + Math.random();

  const transactions = loadTransactions();
  transactions.push({ id, name: name.trim(), amount: parseFloat(amount), category });
  saveTransactions(transactions);

  event.target.reset();
  formErrors.innerHTML = "";
  renderAll();
}

function handleCategorySelectChange() {
  const select = document.getElementById("category");
  if (select.value === "__add__") {
    select.value = "";
    document.getElementById("new-category-row").style.display = "flex";
    document.getElementById("new-category-input").focus();
  }
}

function confirmNewCategory() {
  const input = document.getElementById("new-category-input");
  const name = input.value.trim();
  if (!name) { input.focus(); return; }

  const added = addCustomCategory(name);
  if (!added) {
    input.select();
    return;
  }

  populateCategorySelects();
  document.getElementById("category").value = added;
  document.getElementById("new-category-row").style.display = "none";
  input.value = "";
}

function cancelNewCategory() {
  document.getElementById("new-category-row").style.display = "none";
  document.getElementById("new-category-input").value = "";
  document.getElementById("category").value = "";
}

// ─── Theme ───────────────────────────────────────────────────────────────────

function initTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    document.getElementById("theme-toggle").textContent = "☀️";
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  document.getElementById("theme-toggle").textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// ─── Init ────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  populateCategorySelects();

  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("category").addEventListener("change", handleCategorySelectChange);
  document.getElementById("new-category-confirm").addEventListener("click", confirmNewCategory);
  document.getElementById("new-category-cancel").addEventListener("click", cancelNewCategory);
  document.getElementById("new-category-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); confirmNewCategory(); }
    if (e.key === "Escape") cancelNewCategory();
  });

  document.getElementById("category-filter").addEventListener("change", function () {
    renderList(loadTransactions());
  });

  document.getElementById("transaction-form").addEventListener("submit", handleAddTransaction);

  document.getElementById("list").addEventListener("click", function (e) {
    if (e.target.classList.contains("transaction-delete")) {
      const id = e.target.dataset.id;
      saveTransactions(loadTransactions().filter(t => t.id !== id));
      renderAll();
    }
  });

  renderAll();
});
