# Data_Insight

A browser-based exploratory data analysis workspace built with TypeScript and Vite. The FastAPI files are retained and remain unchanged; EDA work, demo account state, and temporary analysis history currently stay in the browser tab.

## Current frontend features

- Upload and inspect CSV, TSV, and JSON datasets.
- View row and column counts, inferred column types, missing cells, and duplicate rows.
- Inspect unique and non-empty counts for each column.
- Preview the first ten data rows.
- Preview login, sign-up, profile details, and recent analysis history.

Excel formats and data-cleaning actions such as removing duplicates or filling missing values are planned for later additions. Login and sign-up are not connected to a server. Passwords are never stored by the frontend; demo profile fields and analysis summaries are kept only in the current browser tab and are cleared on logout.

## Run the frontend

Open a terminal in `static` and run:

```powershell
npm install
npm run dev
```

Open the local address printed by Vite. Dataset reading and analysis happen locally in the browser; selected files are not sent to FastAPI.

## Frontend organization

- `static/index.html` contains the landing page, upload workflow, and account dialog.
- `static/profile.html` contains the profile and analysis-history view.
- `static/src/main.ts` connects page controls and renders results.
- `static/src/features/eda/readDataset.ts` reads supported file formats.
- `static/src/features/eda/analyzeDataset.ts` calculates the initial EDA summary.
- `static/src/features/eda/types.ts` defines the dataset and analysis types.
- `static/src/style.css` contains the page styles.
