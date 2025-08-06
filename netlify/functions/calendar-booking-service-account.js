const { google } = require('googleapis');

// Service Account Authentication (Recommended)
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { action, ...data } = JSON.parse(event.body);

    switch (action) {
      case 'getAvailability':
        return await getAvailability(data);
      case 'bookMeeting':
        return await bookMeeting(data);
      case 'cancelMeeting':
        return await cancelMeeting(data);
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Calendar API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

async function getAvailability({ startDate, endDate }) {
  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate,
        timeMax: endDate,
        items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
        timeZone: 'Asia/Ho_Chi_Minh'
      }
    });

    const busyTimes = response.data.calendars[process.env.GOOGLE_CALENDAR_ID]?.busy || [];
    
    // Generate available slots
    const availableSlots = generateAvailableSlots(startDate, endDate, busyTimes);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ availableSlots })
    };
  } catch (error) {
    console.error('Get availability error:', error);
    throw new Error(`Failed to get availability: ${error.message}`);
  }
}

async function bookMeeting({ datetime, duration, userName, userEmail, meetingType, notes }) {
  try {
    const startTime = new Date(datetime);
    const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));

    const event = {
      summary: `${meetingType.replace('-', ' ').toUpperCase()} - ${userName}`,
      description: `Meeting booked via portfolio website

Type: ${meetingType.replace('-', ' ')}
Duration: ${duration} minutes
${notes ? `Notes: ${notes}` : ''}

Booked by: ${userName}
Email: ${userEmail}
Booking Time: ${new Date().toISOString()}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh'
      },
      attendees: [
        { 
          email: userEmail, 
          displayName: userName,
          responseStatus: 'accepted'
        },
        { 
          email: 'tiendat0936@gmail.com', 
          displayName: 'Tien Dat Do',
          organizer: true
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 },      // 30 minutes before
          { method: 'email', minutes: 10 }       // 10 minutes before
        ]
      },
      conferenceData: {
        createRequest: {
          requestId: `meeting-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: false
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all' // Send invites to all attendees
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        eventId: response.data.id,
        meetingLink: response.data.conferenceData?.entryPoints?.find(entry => entry.entryPointType === 'video')?.uri || '',
        htmlLink: response.data.htmlLink,
        event: {
          id: response.data.id,
          summary: response.data.summary,
          start: response.data.start,
          end: response.data.end,
          attendees: response.data.attendees,
          meetingLink: response.data.conferenceData?.entryPoints?.find(entry => entry.entryPointType === 'video')?.uri
        }
      })
    };
  } catch (error) {
    console.error('Book meeting error:', error);
    throw new Error(`Failed to book meeting: ${error.message}`);
  }
}

async function cancelMeeting({ eventId }) {
  try {
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId,
      sendUpdates: 'all'
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Cancel meeting error:', error);
    throw new Error(`Failed to cancel meeting: ${error.message}`);
  }
}

function generateAvailableSlots(startDate, endDate, busyTimes) {
  const slots = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Business hours: 9 AM - 6 PM, Monday-Friday (Asia/Ho_Chi_Minh)
  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Skip past dates
    if (date.toDateString() === now.toDateString() && now.getHours() >= 17) continue;

    for (let hour = 9; hour < 18; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      
      // Skip past time slots
      if (slotStart <= now) continue;
      
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check if slot conflicts with busy times
      const isAvailable = !busyTimes.some(busyTime => {
        const busyStart = new Date(busyTime.start);
        const busyEnd = new Date(busyTime.end);
        return (slotStart >= busyStart && slotStart < busyEnd) ||
               (slotEnd > busyStart && slotEnd <= busyEnd) ||
               (slotStart <= busyStart && slotEnd >= busyEnd);
      });

      if (isAvailable) {
        slots.push({
          id: slotStart.getTime().toString(),
          datetime: slotStart.toISOString(),
          available: true,
          formattedTime: slotStart.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
          })
        });
      }
    }
  }

  return slots.slice(0, 20); // Return max 20 slots
}