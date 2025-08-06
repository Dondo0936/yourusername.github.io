# Google Calendar API Setup Guide

## 📋 Complete Setup Instructions

### Step 1: Google Cloud Console Setup

1. **Create Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "New Project" → Name: "Portfolio Calendar API"
   - Select the project

2. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - "Google Calendar API"
     - "Google Meet API" (optional, for meet links)

3. **Create Service Account** (Recommended for server-side)
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Name: "calendar-booking-service"
   - Download the JSON key file

4. **Set up OAuth 2.0** (Alternative method)
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized origins: `https://yourdomain.netlify.app`
   - Copy Client ID and Client Secret

### Step 2: Google Calendar Setup

1. **Create Calendar**
   - Go to [Google Calendar](https://calendar.google.com)
   - Click "+" → "Create new calendar"
   - Name: "Portfolio Meetings"
   - Description: "Automated meetings from portfolio website"

2. **Get Calendar ID**
   - Go to calendar settings
   - Scroll to "Calendar ID" → Copy it
   - Example: `abc123@group.calendar.google.com`

3. **Share Calendar with Service Account**
   - In calendar settings → "Share with specific people"
   - Add your service account email with "Make changes to events" permission
   - Service account email format: `calendar-booking-service@project-id.iam.gserviceaccount.com`

### Step 3: Environment Variables

Add these to your Netlify environment variables:

```bash
# Service Account Method (Recommended)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com

# OAuth Method (Alternative)
GOOGLE_CALENDAR_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=your-client-secret
GOOGLE_CALENDAR_REFRESH_TOKEN=your-refresh-token
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

### Step 4: Get OAuth Refresh Token (if using OAuth)

1. **Get Authorization Code**
   ```bash
   https://accounts.google.com/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=https://developers.google.com/oauthplayground&scope=https://www.googleapis.com/auth/calendar&response_type=code&access_type=offline&approval_prompt=force
   ```

2. **Exchange for Refresh Token**
   ```bash
   curl -X POST https://oauth2.googleapis.com/token \
     -d client_id=YOUR_CLIENT_ID \
     -d client_secret=YOUR_CLIENT_SECRET \
     -d code=AUTHORIZATION_CODE \
     -d grant_type=authorization_code \
     -d redirect_uri=https://developers.google.com/oauthplayground
   ```

### Step 5: Update Netlify Function (Service Account Version)

Replace the OAuth code in `calendar-booking.js` with this service account version:

```javascript
const { google } = require('googleapis');

// Service Account Authentication
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  },
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]
});

const calendar = google.calendar({ version: 'v3', auth });
```

### Step 6: Deploy and Test

1. **Deploy to Netlify**
   ```bash
   git add .
   git commit -m "Add Google Calendar integration"
   git push origin main
   ```

2. **Test the Integration**
   - Open your portfolio chatbot
   - Try: "Can you help me schedule a meeting?"
   - Check if real availability is shown
   - Complete a booking and verify calendar event is created

### Step 7: Verify Setup

✅ **Checklist:**
- [ ] Google Cloud project created
- [ ] Calendar API enabled
- [ ] Service account created and JSON downloaded
- [ ] Calendar created and shared with service account
- [ ] Environment variables set in Netlify
- [ ] Function deployed successfully
- [ ] Test booking creates real calendar event
- [ ] Email invites are sent automatically
- [ ] Google Meet links are generated

## 🔧 Troubleshooting

### Common Issues:

1. **"Calendar not found"**
   - Check Calendar ID is correct
   - Ensure calendar is shared with service account

2. **"Authentication failed"**
   - Verify service account credentials
   - Check private key formatting (newlines)

3. **"Permission denied"**
   - Service account needs "Make changes to events" permission
   - Calendar API must be enabled

4. **"No available slots"**
   - Check timezone settings (Asia/Ho_Chi_Minh)
   - Verify business hours logic

5. **"Meet link not generated"**
   - Enable Google Meet API
   - Check conferenceData settings

### Testing Commands:

```bash
# Test API connectivity
curl -X POST https://yoursite.netlify.app/.netlify/functions/calendar-booking \
  -H "Content-Type: application/json" \
  -d '{"action":"getAvailability","startDate":"2024-01-08T00:00:00Z","endDate":"2024-01-15T00:00:00Z"}'
```

## 🎉 What You Get

After setup, your chatbot will:
- ✅ Show real availability from your Google Calendar
- ✅ Create actual calendar events
- ✅ Send calendar invites with Google Meet links
- ✅ Set automatic reminders
- ✅ Handle timezone conversions
- ✅ Prevent double bookings
- ✅ Work across all devices

The integration is professional-grade and ready for real client meetings!