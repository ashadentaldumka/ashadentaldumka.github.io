/**
 * Asha Dental Clinic – booking requests to a Google Sheet.
 *
 * The website's booking form posts each request here, and this script adds it as
 * a new row in the "Bookings" tab. If the script is attached to a spreadsheet
 * (Extensions → Apps Script), it uses that one; otherwise it creates a spreadsheet
 * called "Asha Dental – Bookings" in your Google Drive the first time it runs.
 *
 * Run the "setup" function once from the editor to find the spreadsheet's link.
 * Setup steps are in the README ("Booking requests in Google Sheets").
 */

var SPREADSHEET_NAME = 'Asha Dental – Bookings';
var SHEET_NAME = 'Bookings';
var NOTIFY_EMAIL = ''; // optional: an email address to alert on every new booking

// Run this once from the editor (choose "setup", then ▶ Run). The execution log
// shows the link to the spreadsheet where bookings are saved.
function setup() {
  var sheet = getSheet_();
  Logger.log('Bookings are saved in: ' + sheet.getParent().getUrl());
}

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Spam bots fill in the hidden "website" field; real visitors never see it.
  if (p.website) return reply_({ ok: true });

  var name = clean_(p.name, 100);
  var phone = String(p.phone || '').replace(/[^\d+ ]/g, '').slice(0, 20);
  if (!name || phone.replace(/\D/g, '').length < 10) return reply_({ ok: false, error: 'missing name or phone' });

  var row = [
    new Date(),
    name,
    "'" + phone, // keep the leading 0 or + by storing the number as text
    clean_(p.service, 60),
    clean_(p.date, 40),
    clean_(p.message, 500),
    'New'
  ];

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_().appendRow(row);
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail(NOTIFY_EMAIL, 'New appointment request: ' + name,
      'Name: ' + name + '\nMobile: ' + phone + '\nTreatment: ' + row[3] +
      '\nPreferred date: ' + (row[4] || '-') + '\nMessage: ' + (row[5] || '-'));
  }
  return reply_({ ok: true });
}

// Opening the web-app URL in a browser shows this, to confirm the deployment works.
function doGet() {
  return ContentService.createTextOutput('Asha Dental booking sheet is running.');
}

// The spreadsheet this script is attached to, or else the one it created earlier
// (its ID is remembered in the script's properties), or else a new one.
function getSpreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  ss.getSheets()[0].setName(SHEET_NAME);
  props.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function getSheet_() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Received', 'Name', 'Mobile', 'Treatment', 'Preferred date', 'Message', 'Status']);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('dd mmm yyyy, hh:mm');
  }
  return sheet;
}

// Trims and shortens a value, and stops text that starts with = + - @ from
// being treated as a spreadsheet formula.
function clean_(value, max) {
  var v = String(value || '').trim().slice(0, max);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
