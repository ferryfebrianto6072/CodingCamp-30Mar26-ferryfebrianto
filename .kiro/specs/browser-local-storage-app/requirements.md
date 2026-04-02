# Requirements Document

## Introduction

A client-side Expense Tracker web app built with HTML, CSS, and Vanilla JavaScript. Users can log transactions by name, amount, and category, view a running total balance, and visualize spending through a pie chart — all stored in browser Local Storage with no backend required.

## Glossary

- **App**: The Expense Tracker single-page web application.
- **Transaction**: A single spending record with a name, amount, and category.
- **Category**: A fixed label grouping transactions — one of: Food, Transport, Fun.
- **Storage**: The browser's Local Storage API used for all data persistence.
- **Transaction_List**: The rendered scrollable list of all logged transaction entries.
- **Input_Form**: The UI form used to add a new transaction.
- **Balance**: The sum of all transaction amounts displayed at the top of the App.
- **Chart**: A pie chart visualizing spending distribution by Category.

---

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a user, I want to log a transaction with a name, amount, and category, so that I can track my spending.

#### Acceptance Criteria

1. THE Input_Form SHALL accept the following fields: Item Name (non-empty text), Amount (positive number), and Category (one of: Food, Transport, Fun).
2. WHEN the user submits the Input_Form with valid data, THE App SHALL append the new Transaction to Storage.
3. WHEN the user submits the Input_Form with valid data, THE App SHALL re-render the Transaction_List, Balance, and Chart without a page reload.
4. IF the user submits the Input_Form with any empty or invalid field, THEN THE App SHALL display a validation error and SHALL NOT save the Transaction to Storage.
5. WHEN the user submits the Input_Form successfully, THE App SHALL reset the Input_Form to its default state.

---

### Requirement 2: View Transaction List

**User Story:** As a user, I want to see all my logged transactions in a scrollable list, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each Transaction with its name, amount, and category.
2. WHEN no transactions have been logged, THE Transaction_List SHALL display an empty-state message.
3. WHEN the App loads, THE App SHALL read all transactions from Storage and render the Transaction_List.

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete a transaction, so that I can correct mistakes in my records.

#### Acceptance Criteria

1. THE Transaction_List SHALL render a delete control for each Transaction entry.
2. WHEN the user activates the delete control for a Transaction, THE App SHALL remove that Transaction from Storage.
3. WHEN the user activates the delete control for a Transaction, THE App SHALL re-render the Transaction_List, Balance, and Chart without a page reload.

---

### Requirement 4: Display Total Balance

**User Story:** As a user, I want to see my total balance at the top of the page, so that I know my overall spending at a glance.

#### Acceptance Criteria

1. THE App SHALL display the Balance as the sum of all Transaction amounts at the top of the page.
2. WHEN a Transaction is added or deleted, THE App SHALL update the Balance immediately.
3. WHEN no transactions have been logged, THE App SHALL display a Balance of zero.

---

### Requirement 5: Spending Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where most of my money goes.

#### Acceptance Criteria

1. THE Chart SHALL display spending totals grouped by Category as a pie chart, rendered using Chart.js or an equivalent client-side chart library.
2. THE Chart SHALL label each segment with the Category name and its total amount.
3. WHEN a Transaction is added or deleted, THE App SHALL update the Chart immediately.
4. WHEN no transactions have been logged, THE Chart SHALL display an empty-state message in place of the chart.

---

### Requirement 6: Data Persistence

**User Story:** As a user, I want my transactions to persist across browser sessions, so that I don't lose my records when I close the tab.

#### Acceptance Criteria

1. THE App SHALL serialize all Transaction data as JSON before writing to Storage.
2. THE App SHALL deserialize JSON from Storage when reading Transaction data.
3. FOR ALL valid Transaction data states, serializing then deserializing SHALL produce a data set equivalent to the original (round-trip property).
4. IF Storage is unavailable or returns malformed data, THEN THE App SHALL initialize with an empty transaction list and SHALL display a non-blocking warning to the user.
