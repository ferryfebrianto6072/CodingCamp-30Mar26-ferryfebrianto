// ─── Storage ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "expense_tracker_transactions";

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

// ─── Validation ─────────────────────────────────────────────────────────────

const VALID_CATEGORIES = ["Food", "Transport", "Fun"];

function validateForm(name, amount, category) {
  const errors = [];

  if (!name || !name.trim()) {
    errors.push("Item name is required.");
  }

  const parsed = parseFloat(amount);
  if (amount === "" || amount === null || isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
    errors.push("Amount must be a positive number.");
  }

  if (!VALID_CATEGORIES.includes(category)) {
    errors.push("Category must be Food, Transport, or Fun.");
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
  const section = document.getElementById("list");
  if (!section) return;

  // Remove existing list-container if present
  const existing = document.getElementById("list-container");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = "list-container";

  if (transactions.length === 0) {
    const empty = document.createElement("p");
    empty.id = "list-empty";
    empty.textContent = "No transactions yet.";
    container.appendChild(empty);
  } else {
    transactions.forEach((t) => {
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

function computeCategoryTotals(transactions) {
  const totals = { Food: 0, Transport: 0, Fun: 0 };
  transactions.forEach((t) => {
    if (totals.hasOwnProperty(t.category)) {
      totals[t.category] += t.amount;
    }
  });
  return totals;
}

let chartInstance = null;

function renderChart(transactions) {
  const canvas = document.getElementById("expense-chart");
  const emptyMsg = document.getElementById("chart-empty");

  if (transactions.length === 0) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    if (emptyMsg) emptyMsg.style.display = "";
    if (canvas) canvas.style.display = "none";
    return;
  }

  if (!window.Chart) {
    if (emptyMsg) {
      emptyMsg.textContent = "Chart unavailable (Chart.js failed to load).";
      emptyMsg.style.display = "";
    }
    if (canvas) canvas.style.display = "none";
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";
  if (canvas) canvas.style.display = "";

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const totals = computeCategoryTotals(transactions);

  chartInstance = new window.Chart(canvas, {
    type: "pie",
    data: {
      labels: ["Food", "Transport", "Fun"],
      datasets: [
        {
          data: [totals.Food, totals.Transport, totals.Fun],
          backgroundColor: ["#4f46e5", "#10b981", "#f59e0b"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.label + ": $" + context.parsed.toFixed(2);
            },
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
    errors.forEach((msg) => {
      const p = document.createElement("p");
      p.textContent = msg;
      formErrors.appendChild(p);
    });
    return;
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString() + Math.random();

  const transaction = {
    id,
    name: name.trim(),
    amount: parseFloat(amount),
    category,
  };

  const transactions = loadTransactions();
  transactions.push(transaction);
  saveTransactions(transactions);

  event.target.reset();
  formErrors.innerHTML = "";

  renderAll();
}

// ─── Init ────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("transaction-form");
  if (form) form.addEventListener("submit", handleAddTransaction);

  const list = document.getElementById("list");
  if (list) {
    list.addEventListener("click", function (e) {
      if (e.target.classList.contains("transaction-delete")) {
        const id = e.target.dataset.id;
        const transactions = loadTransactions().filter((t) => t.id !== id);
        saveTransactions(transactions);
        renderAll();
      }
    });
  }

  renderAll();
});
