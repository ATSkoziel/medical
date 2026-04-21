// =====================================================
// Google Apps Script — Form Data Receiver
// =====================================================
// SETUP:
// 1. Open Google Sheets and create a new spreadsheet
// 2. Add these headers in Row 1 (columns A through V):
//    Timestamp | Sex | First Name | Middle Name | Last Name | PESEL |
//    Date of Birth | Place of Birth | Country of Birth | Nationality |
//    Second Nationality | Document Type | Document Number | Date of Issue |
//    Expiration Date | Country of Issue | Phone | Email |
//    City | Zip Code | Country of Residence | Address Line | Have Company
// 3. Go to Extensions > Apps Script
// 4. Paste this code, Deploy as Web app (Execute as: Me, Access: Anyone)
// 5. Copy the URL into script.js
// =====================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.sex || '',
      data.firstName || '',
      data.middleName || '',
      data.lastName || '',
      data.pesel || '',
      data.dateOfBirth || '',
      data.placeOfBirth || '',
      data.countryOfBirth || '',
      data.nationality || '',
      data.secondNationality || '',
      data.documentType || '',
      data.documentNumber || '',
      data.dateOfIssue || '',
      data.expirationDate || '',
      data.countryOfIssue || '',
      data.phone || '',
      data.email || '',
      data.city || '',
      data.zipCode || '',
      data.countryOfResidence || '',
      data.addressLine || '',
      data.plan || '',
      data.haveCompany || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Form backend is running. Use POST to submit data.')
    .setMimeType(ContentService.MimeType.TEXT);
}
