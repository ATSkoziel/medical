# Registration Form

A clean, modern single-page registration form that saves submissions to Google Sheets.

## Files

| File | Description |
|------|-------------|
| `index.html` | Main form page |
| `style.css` | Styling (modern, minimal, responsive) |
| `script.js` | Form validation & submission logic |
| `google-apps-script.gs` | Backend script for Google Sheets |

## Quick Start — Preview Locally

Just open `index.html` in a browser. The form works in **demo mode** — it validates inputs and logs data to the browser console. No backend needed for testing.

## Setup: Save Data to Google Sheets

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. In **Row 1**, add these column headers:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Timestamp | Name | Surname | Nationality | Phone | Email | Address | Offer |

### Step 2: Add the Apps Script

1. In your spreadsheet, go to **Extensions → Apps Script**
2. Delete any existing code in the editor
3. Copy the entire contents of `google-apps-script.gs` and paste it in
4. Click the **Save** icon (or Ctrl+S)

### Step 3: Deploy as a Web App

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Set **Description**: "Form Backend" (optional)
4. Set **Execute as**: **Me**
5. Set **Who has access**: **Anyone**
6. Click **Deploy**
7. **Authorize** the script when prompted (click through the "unsafe" warning — it's your own script)
8. **Copy the Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

### Step 4: Connect the Form

1. Open `script.js`
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your Web app URL:
   ```js
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
   ```
3. Save the file

### Step 5: Test It

1. Open `index.html` in a browser
2. Fill in the form and click Submit
3. Check your Google Sheet — a new row should appear!

## Deploy to GitHub Pages

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit: registration form"
   git push origin main
   ```

2. Go to your repo on GitHub → **Settings → Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**
6. Your site will be live at: `https://<username>.github.io/<repo-name>/`

## Troubleshooting

- **Form says "Something went wrong"**: Check the browser console (F12) for errors. Make sure the Google Apps Script URL is correct.
- **Data not appearing in Sheet**: Re-deploy the Apps Script (Deploy → Manage deployments → Edit → New version → Deploy).
- **CORS errors**: The form uses `mode: 'no-cors'` which should work. If you see issues, try re-deploying the Apps Script.
