# ashadentaldumka.github.io

Website for Asha Dental Clinic, Dumka. A single static page (`index.html`) hosted on GitHub Pages.

## Booking requests in Google Sheets

The booking form sends every request to the clinic's WhatsApp. It can also save each
request as a row in a Google Sheet, using the small script in
[`apps-script/booking-sheet.gs`](apps-script/booking-sheet.gs). Setup takes about 5 minutes
and is done once, signed in to the clinic's Google account:

1. Go to [sheets.new](https://sheets.new) to create a new Google Sheet, and name it
   something like "Asha Dental – Bookings".
2. In the sheet, open **Extensions → Apps Script**. Delete the sample code, paste in the
   whole of `apps-script/booking-sheet.gs`, and click **Save**.
   - Optional: to get an email for every booking, put an address in `NOTIFY_EMAIL`,
     for example `var NOTIFY_EMAIL = 'clinic@example.com';`
3. Click **Deploy → New deployment**. Click the gear icon, choose **Web app**, then set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, then **Authorize access**, and allow it with the clinic's Google account.
   Google shows an "unverified app" warning because you wrote the script yourself: click
   **Advanced → Go to (project name)** to continue.
5. Copy the **Web app URL** (it ends in `/exec`).
6. In `index.html`, paste that URL between the quotes in this line, then commit and push:

   ```js
   var BOOKING_SHEET_URL = '';
   ```

Bookings then appear in a **Bookings** tab with the columns Received, Name, Mobile,
Treatment, Preferred date, Message and Status. Status starts as "New", and staff can change it
(for example to "Called" or "Booked").

**If you edit the script later**, use **Deploy → Manage deployments → Edit → Version: New
version** so the URL stays the same.

### Privacy

The sheet holds patients' names, phone numbers and dental details. Share it only with
clinic staff, and delete old rows you no longer need.
