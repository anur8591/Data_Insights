# Data_Insight

A browser-based exploratory data analysis (EDA) workspace built with TypeScript and Vite. The FastAPI files are retained and have not been changed; this first EDA version processes selected files in the browser without sending them to the backend.

## Current frontend features

- Upload and inspect CSV, TSV, and JSON datasets.
- View row and column counts, inferred column types, missing cells, and duplicate rows.
- Inspect unique and non-empty counts for each column.
- Preview the first ten data rows.

Excel formats and data-cleaning actions such as removing duplicates or filling missing values are planned for later additions. The current demo login is visual only and does not verify user accounts.

## Run the frontend

Open a terminal in `static` and run:

```powershell
npm install
npm run dev
```

Open the local address printed by Vite. Dataset reading and analysis happen locally in the browser.

## Frontend organization

- `static/index.html` contains the page structure and upload/insights areas.
- `static/src/main.ts` connects the interface controls and renders results.
- `static/src/features/eda/readDataset.ts` reads supported file formats.
- `static/src/features/eda/analyzeDataset.ts` calculates the initial EDA summary.
- `static/src/features/eda/types.ts` defines the dataset and analysis types.
- `static/src/style.css` contains the page styles.
