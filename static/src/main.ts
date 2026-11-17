import "./style.css";
import { analyzeDataset } from "./features/eda/analyzeDataset";
import { readDataset } from "./features/eda/readDataset";
import type { ColumnInsight, DataCell, Dataset, DatasetInsight } from "./features/eda/types";

interface AnalysisHistoryRecord {
  email: string;
  fileName: string;
  format: string;
  analyzedAt: string;
  rowCount: number;
  columnCount: number;
  missingCells: number;
  duplicateRows: number;
}

const PROFILE_EMAIL_KEY = "profileEmail";
const PROFILE_FIRST_NAME_KEY = "profileFirstName";
const PROFILE_LAST_NAME_KEY = "profileLastName";
const PROFILE_PHONE_KEY = "profilePhone";
const ANALYSIS_HISTORY_KEY = "analysisHistory";

// The current account flow is a frontend preview; FastAPI will replace this demo state.
const openLoginButton = document.querySelector<HTMLButtonElement>("#open-login");
const profileButton = document.querySelector<HTMLButtonElement>("#profile-button");
const loginDialog = document.querySelector<HTMLDialogElement>("#login-dialog");
const closeLoginButton = document.querySelector<HTMLButtonElement>("#close-login");
const loginView = document.querySelector<HTMLElement>("#login-view");
const signupView = document.querySelector<HTMLElement>("#signup-view");
const loginForm = document.querySelector<HTMLFormElement>("#login-form");
const loginEmailInput = document.querySelector<HTMLInputElement>("#login-email");
const openSignupButton = document.querySelector<HTMLButtonElement>("#open-signup");
const backToLoginButton = document.querySelector<HTMLButtonElement>("#back-to-login");

function updateAccountNavigation(): void {
  if (!openLoginButton || !profileButton) return;
  const isSignedIn = sessionStorage.getItem(PROFILE_EMAIL_KEY) !== null;
  openLoginButton.hidden = isSignedIn;
  profileButton.hidden = !isSignedIn;
}

updateAccountNavigation();

if (
  openLoginButton && profileButton && loginDialog && closeLoginButton &&
  loginView && signupView && loginForm && loginEmailInput &&
  openSignupButton && backToLoginButton
) {
  openLoginButton.addEventListener("click", () => loginDialog.showModal());
  profileButton.addEventListener("click", () => window.location.assign("/profile.html"));

  openSignupButton.addEventListener("click", () => {
    loginView.hidden = true;
    signupView.hidden = false;
    loginDialog.setAttribute("aria-labelledby", "signup-title");
  });

  backToLoginButton.addEventListener("click", () => {
    signupView.hidden = true;
    loginView.hidden = false;
    loginDialog.setAttribute("aria-labelledby", "login-title");
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = loginEmailInput.value.trim().toLowerCase();
    const previousEmail = sessionStorage.getItem(PROFILE_EMAIL_KEY)?.toLowerCase();

    if (previousEmail !== email) clearDemoProfile();
    sessionStorage.setItem(PROFILE_EMAIL_KEY, email);
    updateAccountNavigation();
    loginDialog.close();
    loginForm.reset();
  });

  closeLoginButton.addEventListener("click", () => loginDialog.close());
  loginDialog.addEventListener("click", (event) => {
    if (event.target === loginDialog) loginDialog.close();
  });
  loginDialog.addEventListener("close", () => {
    signupView.hidden = true;
    loginView.hidden = false;
    loginDialog.setAttribute("aria-labelledby", "login-title");
  });
}

const signupForm = document.querySelector<HTMLFormElement>("#signup-form");
const signupMessage = document.querySelector<HTMLElement>("#signup-message");
const signupEmailInput = document.querySelector<HTMLInputElement>("#signup-email");
const firstNameInput = document.querySelector<HTMLInputElement>("#first-name");
const lastNameInput = document.querySelector<HTMLInputElement>("#last-name");
const phoneInput = document.querySelector<HTMLInputElement>("#phone");
const signupPasswordInput = document.querySelector<HTMLInputElement>("#signup-password");
const confirmPasswordInput = document.querySelector<HTMLInputElement>("#confirm-password");

if (
  signupForm && signupMessage && signupEmailInput && firstNameInput &&
  lastNameInput && phoneInput && signupPasswordInput && confirmPasswordInput
) {
  const validatePasswordMatch = () => {
    const matches = confirmPasswordInput.value === signupPasswordInput.value;
    confirmPasswordInput.setCustomValidity(matches ? "" : "Passwords do not match.");
  };

  signupPasswordInput.addEventListener("input", validatePasswordMatch);
  confirmPasswordInput.addEventListener("input", validatePasswordMatch);

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    validatePasswordMatch();
    if (!signupForm.reportValidity()) {
      signupMessage.textContent = "Check the highlighted fields and try again.";
      return;
    }

    // Keep profile details only for this tab. Never store the password.
    sessionStorage.setItem(PROFILE_FIRST_NAME_KEY, firstNameInput.value.trim());
    sessionStorage.setItem(PROFILE_LAST_NAME_KEY, lastNameInput.value.trim());
    sessionStorage.setItem(PROFILE_EMAIL_KEY, signupEmailInput.value.trim().toLowerCase());
    sessionStorage.setItem(PROFILE_PHONE_KEY, phoneInput.value.trim());
    sessionStorage.removeItem(ANALYSIS_HISTORY_KEY);
    window.location.assign("/profile.html");
  });
}

const logoutButton = document.querySelector<HTMLButtonElement>("#logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    clearDemoProfile();
    window.location.assign("/");
  });
}

function clearDemoProfile(): void {
  sessionStorage.removeItem(PROFILE_EMAIL_KEY);
  sessionStorage.removeItem(PROFILE_FIRST_NAME_KEY);
  sessionStorage.removeItem(PROFILE_LAST_NAME_KEY);
  sessionStorage.removeItem(PROFILE_PHONE_KEY);
  sessionStorage.removeItem(ANALYSIS_HISTORY_KEY);
}

function readAnalysisHistory(): AnalysisHistoryRecord[] {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(ANALYSIS_HISTORY_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter(isAnalysisHistoryRecord) : [];
  } catch {
    return [];
  }
}

function isAnalysisHistoryRecord(value: unknown): value is AnalysisHistoryRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.email === "string" && typeof record.fileName === "string" &&
    typeof record.format === "string" && typeof record.analyzedAt === "string" &&
    typeof record.rowCount === "number" && typeof record.columnCount === "number" &&
    typeof record.missingCells === "number" && typeof record.duplicateRows === "number";
}

function saveAnalysisHistory(dataset: Dataset, insight: DatasetInsight): void {
  const email = sessionStorage.getItem(PROFILE_EMAIL_KEY);
  if (!email) return;

  const history = readAnalysisHistory();
  history.unshift({
    email,
    fileName: dataset.fileName,
    format: dataset.format,
    analyzedAt: new Date().toISOString(),
    rowCount: insight.rowCount,
    columnCount: insight.columnCount,
    missingCells: insight.missingCells,
    duplicateRows: insight.duplicateRows,
  });
  sessionStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
}

// Populate the profile page from the temporary browser-tab profile.
const profileEmailElement = document.querySelector<HTMLElement>("#profile-email");
if (profileEmailElement) {
  const email = sessionStorage.getItem(PROFILE_EMAIL_KEY);
  const firstName = sessionStorage.getItem(PROFILE_FIRST_NAME_KEY) ?? "";
  const lastName = sessionStorage.getItem(PROFILE_LAST_NAME_KEY) ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  profileEmailElement.textContent = email ?? "No demo sign-in email found in this tab.";

  const profileNameElement = document.querySelector<HTMLElement>("#profile-name");
  if (profileNameElement) profileNameElement.textContent = fullName || "Your profile";
  setText("#profile-first-name", firstName || "—");
  setText("#profile-last-name", lastName || "—");
  setText("#profile-email-detail", email || "—");
  setText("#profile-phone", sessionStorage.getItem(PROFILE_PHONE_KEY) || "—");
  renderProfileHistory(email);
}

function setText(selector: string, value: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

function renderProfileHistory(email: string | null): void {
  const emptyState = document.querySelector<HTMLElement>("#analysis-empty");
  const tableWrap = document.querySelector<HTMLElement>("#history-table-wrap");
  const historyBody = document.querySelector<HTMLTableSectionElement>("#analysis-history-body");
  if (!emptyState || !tableWrap || !historyBody) return;

  const history = readAnalysisHistory().filter((record) => record.email === email);
  setText("#analysis-count", history.length.toLocaleString());
  setText("#dataset-count", new Set(history.map((record) => record.fileName)).size.toLocaleString());
  emptyState.hidden = history.length > 0;
  tableWrap.hidden = history.length === 0;

  const fragment = document.createDocumentFragment();
  for (const record of history) {
    const row = document.createElement("tr");
    addHistoryCell(row, record.fileName);
    addHistoryCell(row, new Date(record.analyzedAt).toLocaleString());
    addHistoryCell(row, `${record.rowCount.toLocaleString()} × ${record.columnCount.toLocaleString()}`);
    addHistoryCell(row, record.missingCells.toLocaleString());
    addHistoryCell(row, record.duplicateRows.toLocaleString());
    fragment.append(row);
  }
  historyBody.replaceChildren(fragment);
}

function addHistoryCell(row: HTMLTableRowElement, text: string): void {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.append(cell);
}

// Browser-only dataset inspection. The file and its summary are not sent to FastAPI.
const fileInput = document.querySelector<HTMLInputElement>("#dataset-file");
const dropZone = document.querySelector<HTMLElement>("#drop-zone");
const selectedFileName = document.querySelector<HTMLElement>("#selected-file-name");
const analyzeButton = document.querySelector<HTMLButtonElement>("#analyze-button");
const uploadMessage = document.querySelector<HTMLElement>("#upload-message");
const insightsPanel = document.querySelector<HTMLElement>("#insights-panel");
const resultFileName = document.querySelector<HTMLElement>("#result-file-name");
const metricGrid = document.querySelector<HTMLElement>("#metric-grid");
const columnTableBody = document.querySelector<HTMLTableSectionElement>("#column-table-body");
const previewTableHead = document.querySelector<HTMLTableSectionElement>("#preview-table-head");
const previewTableBody = document.querySelector<HTMLTableSectionElement>("#preview-table-body");
const previewCount = document.querySelector<HTMLElement>("#preview-count");

if (
  fileInput && dropZone && selectedFileName && analyzeButton && uploadMessage &&
  insightsPanel && resultFileName && metricGrid && columnTableBody &&
  previewTableHead && previewTableBody && previewCount
) {
  let selectedFile: File | null = null;

  const showMessage = (message: string, state: "info" | "success" | "error" = "info") => {
    uploadMessage.textContent = message;
    uploadMessage.dataset.state = state;
  };

  const chooseFile = (file: File | null | undefined) => {
    if (!file) return;
    selectedFile = file;
    selectedFileName.textContent = file.name;
    analyzeButton.disabled = false;
    insightsPanel.hidden = true;
    showMessage("File selected. Generate insights when you’re ready.");
    fileInput.value = "";
  };

  fileInput.addEventListener("change", () => chooseFile(fileInput.files?.[0]));
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("is-dragging"));
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
    chooseFile(event.dataTransfer?.files[0]);
  });

  analyzeButton.addEventListener("click", async () => {
    if (!selectedFile) return;
    analyzeButton.disabled = true;
    analyzeButton.textContent = "Analyzing…";
    showMessage("Reading the file in your browser…");

    try {
      const dataset = await readDataset(selectedFile);
      const insight = analyzeDataset(dataset);
      renderInsights(dataset, insight);
      saveAnalysisHistory(dataset, insight);
      insightsPanel.hidden = false;
      showMessage("Analysis complete. Your original file was not changed.", "success");
    } catch (error) {
      insightsPanel.hidden = true;
      showMessage(error instanceof Error ? error.message : "Could not read this file.", "error");
    } finally {
      analyzeButton.disabled = false;
      analyzeButton.innerHTML = 'Generate insights <span aria-hidden="true">→</span>';
    }
  });

  function renderInsights(dataset: Dataset, insight: DatasetInsight): void {
    resultFileName.textContent = `${dataset.fileName} · ${dataset.format}`;
    renderMetrics(insight, metricGrid);
    renderColumns(insight.columns, columnTableBody);
    renderPreview(dataset, previewTableHead, previewTableBody, previewCount);
  }
}

function renderMetrics(insight: DatasetInsight, container: HTMLElement): void {
  const metrics = [
    { label: "Rows", value: insight.rowCount, detail: "records in the dataset", tone: "mint" },
    { label: "Columns", value: insight.columnCount, detail: `${insight.numericColumns} inferred as numeric`, tone: "blue" },
    { label: "Missing values", value: insight.missingCells, detail: "blank or null cells", tone: "amber" },
    { label: "Duplicate rows", value: insight.duplicateRows, detail: "repeated rows after the first", tone: "violet" },
  ];
  const fragment = document.createDocumentFragment();

  for (const metric of metrics) {
    const card = document.createElement("article");
    card.className = `metric-card metric-${metric.tone}`;
    const label = document.createElement("p");
    label.className = "metric-label";
    label.textContent = metric.label;
    const value = document.createElement("strong");
    value.className = "metric-value";
    value.textContent = metric.value.toLocaleString();
    const detail = document.createElement("p");
    detail.className = "metric-detail";
    detail.textContent = metric.detail;
    card.append(label, value, detail);
    fragment.append(card);
  }

  container.replaceChildren(fragment);
}

function renderColumns(columns: ColumnInsight[], body: HTMLTableSectionElement): void {
  const fragment = document.createDocumentFragment();
  for (const column of columns) {
    const row = document.createElement("tr");
    appendTextCell(row, column.name, "column-name");
    const typeCell = document.createElement("td");
    const typeBadge = document.createElement("span");
    typeBadge.className = "type-badge";
    typeBadge.textContent = column.dataType;
    typeCell.append(typeBadge);
    row.append(typeCell);
    appendTextCell(row, column.nonEmpty.toLocaleString());
    appendTextCell(row, column.missing.toLocaleString(), column.missing > 0 ? "cell-warning" : "");
    appendTextCell(row, column.unique.toLocaleString());
    fragment.append(row);
  }
  body.replaceChildren(fragment);
}

function renderPreview(
  dataset: Dataset,
  head: HTMLTableSectionElement,
  body: HTMLTableSectionElement,
  countLabel: HTMLElement,
): void {
  const headerRow = document.createElement("tr");
  for (const column of dataset.columns) appendHeaderCell(headerRow, column);
  head.replaceChildren(headerRow);

  const previewRows = dataset.rows.slice(0, 10);
  const fragment = document.createDocumentFragment();
  for (const values of previewRows) {
    const row = document.createElement("tr");
    for (const value of values) appendTextCell(row, formatCell(value), value === null ? "cell-missing" : "");
    fragment.append(row);
  }
  body.replaceChildren(fragment);
  countLabel.textContent = `Showing ${previewRows.length} of ${dataset.rows.length}`;
}

function appendTextCell(row: HTMLTableRowElement, text: string, className = ""): void {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  row.append(cell);
}

function appendHeaderCell(row: HTMLTableRowElement, text: string): void {
  const cell = document.createElement("th");
  cell.scope = "col";
  cell.textContent = text;
  row.append(cell);
}

function formatCell(value: DataCell): string {
  if (value === null) return "—";
  if (value instanceof Date) return value.toLocaleString();
  return String(value);
}
