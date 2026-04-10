// ─────────────────────────────────────────────────────────────
// GOOGLE APPS SCRIPT — Career Platform Database
// ─────────────────────────────────────────────────────────────
// HOW TO SET THIS UP (do this once, takes 5 minutes):
//
// STEP 1: Create a new Google Sheet
//   - Go to sheets.google.com
//   - Create a new blank spreadsheet
//   - Name it: "Mentee Career Results"
//   - Add these headers in Row 1:
//     A1: Timestamp
//     B1: Full Name
//     C1: Email
//     D1: Top Match
//     E1: Second Match
//     F1: All Scores
//
// STEP 2: Open Apps Script
//   - In your Google Sheet, click Extensions > Apps Script
//   - Delete all existing code in the editor
//   - Paste the entire code below
//   - Click Save (floppy disk icon)
//
// STEP 3: Deploy as a Web App
//   - Click Deploy > New Deployment
//   - Click the gear icon next to "Select type" and choose "Web app"
//   - Set Description: Career Platform Receiver
//   - Set Execute as: Me
//   - Set Who has access: Anyone
//   - Click Deploy
//   - Copy the Web App URL that appears
//
// STEP 4: Paste the URL into your HTML file
//   - Open career-platform-v2.html in a text editor
//   - Find this line near the top of the script:
//       const SHEET_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
//   - Replace YOUR_APPS_SCRIPT_URL_HERE with the URL you copied
//   - Save the file and re-upload it to Netlify
//
// STEP 5: Test it
//   - Open your Netlify URL
//   - Fill in a test name and email
//   - Complete the questionnaire
//   - Check your Google Sheet — the row should appear within seconds
// ─────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);

    // Open the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // If sheet is empty, add headers first
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Full Name',
        'Email',
        'Stated Goal',
        'Goal Domain (AI)',
        'Alignment Status',
        'Top Aptitude Match',
        'Second Aptitude Match',
        'Mentor Note (AI)',
        'All Domain Scores'
      ]);

      // Style the header row
      const headerRange = sheet.getRange(1, 1, 1, 10);
      headerRange.setBackground('#FF6B2B');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);

      // Set column widths
      sheet.setColumnWidth(1, 160);
      sheet.setColumnWidth(2, 160);
      sheet.setColumnWidth(3, 200);
      sheet.setColumnWidth(4, 300);
      sheet.setColumnWidth(5, 200);
      sheet.setColumnWidth(6, 130);
      sheet.setColumnWidth(7, 200);
      sheet.setColumnWidth(8, 200);
      sheet.setColumnWidth(9, 360);
      sheet.setColumnWidth(10, 500);
    }

    // Append the mentee's data as a new row
    sheet.appendRow([
      data.date || new Date().toLocaleString(),
      data.name || '',
      data.email || '',
      data.goal || '',
      data.goalDomain || '',
      data.alignmentStatus || '',
      data.topMatch || '',
      data.secondMatch || '',
      data.mentorNote || '',
      data.scores || ''
    ]);

    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error details
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run this manually in the Apps Script editor
// to verify the sheet is connected correctly before going live
function testConnection() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([
    new Date().toLocaleString(),
    'Test Mentee',
    'test@example.com',
    'I want to build AI tools that help small businesses automate their workflows.',
    'AI & Machine Learning',
    'match',
    'AI & Machine Learning',
    'Software Engineering',
    'Goal and aptitude align well. Focus on Python foundations in month 1.',
    'AI & ML: 28 | Data: 12 | Software Engineering: 18 | Cloud: 10 | Security: 6 | Product: 8 | Emerging: 14 | VA: 4'
  ]);
  Logger.log('Test row added successfully.');
}
