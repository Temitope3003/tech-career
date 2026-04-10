# Setup Guide

## Step 1: Deploy the Platform

### Netlify (recommended)
1. Go to [netlify.com](https://netlify.com) and sign in or create a free account
2. Scroll down to the "Deploy manually" box on the dashboard
3. Drag `index.html` into the box
4. Netlify gives you a live URL immediately (e.g. `random-name-123.netlify.app`)
5. To rename it: Site Settings → Change site name

### GitHub Pages
1. Fork this repository
2. Go to Settings → Pages
3. Set source to the `main` branch, root folder
4. Your platform goes live at `yourusername.github.io/tech-career-platform`

---

## Step 2: Set Up Google Sheets

### Create the spreadsheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: **Mentee Career Results**
4. Leave all rows empty — the script creates headers automatically on first submission

### Add the Apps Script
1. Inside the sheet, click **Extensions → Apps Script**
2. Delete all code in the editor
3. Copy the contents of `google-apps-script.js` from this repository
4. Paste it into the editor
5. Click **Save** (floppy disk icon or Ctrl+S)
6. Click **Run → testConnection** to verify the sheet connects correctly
7. Check your spreadsheet — a test row should appear

### Deploy as a Web App
1. Click **Deploy → New Deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set **Description**: Career Platform Receiver
4. Set **Execute as**: Me
5. Set **Who has access**: Anyone
6. Click **Deploy**
7. Copy the Web App URL (looks like `https://script.google.com/macros/s/ABC.../exec`)

---

## Step 3: Connect the Sheet to the Platform

1. Open `index.html` in any text editor
2. Find this line near the top of the `<script>` section:
   ```javascript
   const SHEET_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_APPS_SCRIPT_URL_HERE` with the Web App URL you copied
4. Save the file
5. Re-upload to Netlify or push to GitHub

---

## Step 4: Test End-to-End

1. Open your live Netlify or GitHub Pages URL
2. Enter a test name and email
3. Type a test goal (at least 20 characters)
4. Complete all 18 questions
5. Check your Google Sheet — the row should appear within seconds

---

## Spreadsheet Columns

| Column | What it contains |
|---|---|
| A: Timestamp | Date and time of submission |
| B: Full Name | Mentee's name |
| C: Email | For follow-up emails |
| D: Stated Goal | Their free text goal verbatim |
| E: Goal Domain (AI) | Domain Claude mapped their goal to |
| F: Alignment Status | match, partial, or conflict |
| G: Top Aptitude Match | Highest scoring domain from assessment |
| H: Second Match | Second highest domain |
| I: Mentor Note (AI) | Claude-generated 1-on-1 talking point |
| J: All Domain Scores | Full scores across all 8 domains |

---

## Troubleshooting

**Data is not appearing in the sheet:**
- Make sure you clicked Deploy and copied the correct Web App URL
- Check that "Who has access" is set to Anyone (not "Only myself")
- After changing any Apps Script code, always create a **New Deployment** (do not reuse the old one)

**AI analysis is not showing on results:**
- The analysis requires an internet connection and the Anthropic API to be reachable
- If the API call fails, the analysis section is hidden silently and the rest of the results still show

**Platform looks broken after editing:**
- Open browser DevTools (F12) and check the Console tab for JavaScript errors
- Most issues come from accidentally deleting a closing bracket or quote when editing the HTML
