# Implementation Plan: Expense Tracker (Browser Local Storage App)

## Overview

Implement a single-page Expense Tracker using HTML, CSS, and Vanilla JavaScript. All logic lives in three files: `index.html`, `css/style.css`, and `js/app.js`. Data is persisted in `localStorage` as JSON. Chart.js is loaded via CDN for the spending pie chart.

## Tasks

- [x] 1. Scaffold `index.html`
  - Create the base HTML5 document with `<meta charset>`, `<meta viewport>`, and a `<title>`
  - Add `<link>` to `css/style.css`
  - Add Chart.js CDN `<script>` tag before the closing `</body>`
  - Add `<script src="js/app.js" defer>` tag
  - Add semantic sections: `<header>`, `<section id="balance">`, `<section id="chart">`, `<section id="form">`, `<section id="list">`
  - Inside `#form`: add inputs for Item Name (text), Amount (number), Category (select: Food, Transport, Fun), a submit button, and a `<div id="form-errors">` for inline validation messages
  - Inside `#chart`: add `<canvas id="expense-chart">` and a `<p id="chart-empty">` fallback element
  - _Requirements: 1.1, 2.2, 4.1, 5.1, 5.4_

- [x] 2. Write `css/style.css`
  - Style the overall layout: centered container, readable font, consistent spacing
  - Style `#balance` to be visually prominent at the top
  - Style `#form` inputs, select, and submit button with clear focus states
  - Style `#form-errors` to show validation messages in a visible error color
  - Style `#list` as a scrollable container; style each transaction row with name, amount, category, and a delete button
  - Style the empty-state messages for both list and chart
  - Add a warning banner style (`.storage-warning`) for localStorage error states
  - _Requirements: 1.1, 2.2, 5.4, 6.4_

- [x] 3. Implement storage functions in `js/app.js`
  - Define the `localStorage` key constant: `STORAGE_KEY = "expense_tracker_transactions"`
  - Implement `loadTransactions()`: reads from `localStorage`, parses JSON, returns array; wraps in try/catch — returns `[]` and shows `.storage-warning` banner on any error
  - Implement `saveTransactions(transactions)`: serializes to JSON and writes to `localStorage`; wraps in try/catch — shows `.storage-warning` banner on quota/unavailable errors
  - _Requirements: 6.1, 6.2, 6.4_

  - [ ]* 3.1 Write property test for storage round-trip (Property 8)
    - **Property 8: Storage serialization round-trip**
    - For any array of valid Transaction objects, `loadTransactions` after `saveTransactions` SHALL return an equivalent array
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 4. Implement `validateForm(name, amount, category)` in `js/app.js`
  - Returns `{ valid: boolean, errors: string[] }`
  - Rejects empty/whitespace-only name
  - Rejects amount that is not a positive finite number
  - Rejects category not in `["Food", "Transport", "Fun"]`
  - _Requirements: 1.1, 1.4_

  - [ ]* 4.1 Write property test for validation (Property 1)
    - **Property 1: Validation rejects all invalid inputs**
    - For any combination where at least one field is invalid, `validateForm` SHALL return `valid: false`
    - **Validates: Requirements 1.1, 1.4**

- [x] 5. Implement rendering functions in `js/app.js`
  - Implement `renderBalance(transactions)`: sums all `amount` fields and updates `#balance` text; shows `0` when array is empty
  - Implement `renderList(transactions)`: clears and rebuilds `#list` DOM; shows empty-state message when array is empty; each row shows name, amount, category, and a delete button with `data-id` attribute
  - Implement `renderAll()`: calls `loadTransactions()` then calls `renderBalance`, `renderList`, and `renderChart` with the result
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.3_

  - [ ]* 5.1 Write property test for balance computation (Property 6)
    - **Property 6: Balance equals sum of all amounts**
    - For any transaction array, computed balance SHALL equal `transactions.reduce((s, t) => s + t.amount, 0)`
    - **Validates: Requirements 4.1, 4.3**

  - [ ]* 5.2 Write property test for list rendering completeness (Property 4)
    - **Property 4: List rendering completeness**
    - For any non-empty transaction array, rendered HTML SHALL contain each transaction's name, amount, category, and a delete control
    - **Validates: Requirements 2.1, 3.1**

- [x] 6. Implement Chart.js pie chart in `js/app.js`
  - Implement `computeCategoryTotals(transactions)`: returns `{ Food, Transport, Fun }` sums
  - Implement `renderChart(transactions)`: if array is empty, destroy any existing chart instance and show `#chart-empty` fallback; otherwise hide fallback, compute category totals, and render/update a Chart.js pie chart on `#expense-chart` with category labels and totals
  - Guard against Chart.js CDN failure: if `window.Chart` is undefined, show fallback text and skip chart rendering
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.1 Write property test for category aggregation (Property 7)
    - **Property 7: Category aggregation correctness**
    - For any transaction array, sum of all category totals SHALL equal the total balance
    - **Validates: Requirements 5.2**

- [x] 7. Implement event handlers in `js/app.js`
  - Implement `handleAddTransaction(event)`: prevents default, reads form values, calls `validateForm`, displays errors in `#form-errors` if invalid; if valid, generates an ID (`crypto.randomUUID()` with fallback to `Date.now().toString() + Math.random()`), appends transaction to storage via `saveTransactions`, resets the form, clears errors, and calls `renderAll()`
  - Implement delete via event delegation: attach a single `click` listener on `#list`; when a delete button is clicked, read its `data-id`, filter it out of `loadTransactions()`, call `saveTransactions`, then call `renderAll()`
  - Attach `handleAddTransaction` to the form's `submit` event
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3_

  - [ ]* 7.1 Write property test for delete removes from storage (Property 5)
    - **Property 5: Delete removes transaction from storage**
    - For any transaction list, after deleting one by id, `loadTransactions` SHALL NOT contain a transaction with that id
    - **Validates: Requirements 3.2**

  - [ ]* 7.2 Write property test for form reset after valid submission (Property 3)
    - **Property 3: Form resets after valid submission**
    - For any valid form submission, all form input fields SHALL be empty/default after submit
    - **Validates: Requirements 1.5**

- [x] 8. Checkpoint — wire everything together and verify
  - Call `renderAll()` on `DOMContentLoaded` to load persisted data on startup
  - Verify the full flow works: add transaction → list/balance/chart update → delete → list/balance/chart update → reload → data persists
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.2, 1.3, 2.3, 3.3, 6.1, 6.2, 6.3_

  - [ ]* 8.1 Write property test for transaction add round-trip (Property 2)
    - **Property 2: Transaction add round-trip**
    - For any valid transaction, after saving it, `loadTransactions` SHALL return a list containing a transaction with equivalent name, amount, and category
    - **Validates: Requirements 1.2, 2.3**

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests are described for future implementation using fast-check via CDN or a minimal test script
- All code lives in exactly three files: `index.html`, `css/style.css`, `js/app.js`
