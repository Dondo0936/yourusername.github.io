const {
  sql,
  initializeDatabase,
  createMeeting,
  getMeetingBySlotId,
  getMeetingsByEmail,
  getBookedSlots,
  cancelMeeting,
  updateMeeting,
  saveConversationMessage,
  getConversationHistory,
  getMeetingStats
} = require('./utils/database');

const { google } = require('googleapis');

// Service Account Authentication for Google Calendar
let calendar;
if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
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
  calendar = google.calendar({ version: 'v3', auth });
}

exports.handler = async (event, context) => {
  // Check if database is available, fallback to mock data if not
  let databaseAvailable = true;
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not found, using fallback mode');
      databaseAvailable = false;
    } else {
      await initializeDatabase();
    }
  } catch (dbError) {
    console.error('Database initialization failed, using fallback mode:', dbError);
    databaseAvailable = false;
  }

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
        return await getAvailability(data, databaseAvailable);
      case 'bookMeeting':
        return await bookMeeting(data, databaseAvailable);
      case 'getUserMeetings':
        return await getUserMeetings(data, databaseAvailable);
      case 'updateMeeting':
        return await updateMeetingHandler(data, databaseAvailable);
      case 'cancelMeeting':
        return await cancelMeetingHandler(data, databaseAvailable);
      case 'saveConversation':
        return await saveConversation(data, databaseAvailable);
      case 'getConversation':
        return await getConversation(data, databaseAvailable);
      case 'getStats':
        return await getStats(databaseAvailable);
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Meeting manager error:', error);
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

async function getAvailability({ startDate, endDate }, databaseAvailable = true) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get booked slots from database or use empty fallback
    let bookedSlots = [];
    let bookedSlotIds = [];
    
    if (databaseAvailable) {
      try {
        bookedSlots = await getBookedSlots(startDate, endDate);
        bookedSlotIds = bookedSlots.map(slot => slot.slot_id);
      } catch (dbError) {
        console.warn('Database query failed, using empty bookings:', dbError);
      }
    }

    // Get busy times from Google Calendar if available
    let busyTimes = [];
    if (calendar && process.env.GOOGLE_CALENDAR_ID) {
      try {
        const response = await calendar.freebusy.query({
          requestBody: {
            timeMin: startDate,
            timeMax: endDate,
            items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
            timeZone: 'Asia/Ho_Chi_Minh'
          }
        });
        busyTimes = response.data.calendars[process.env.GOOGLE_CALENDAR_ID]?.busy || [];
      } catch (calendarError) {
        console.warn('Calendar API error, using database only:', calendarError.message);
      }
    }

    // Generate available slots
    const availableSlots = generateAvailableSlots(start, end, busyTimes, bookedSlotIds);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        availableSlots,
        totalBooked: bookedSlots.length,
        hasCalendarIntegration: !!calendar,
        databaseAvailable
      })
    };
  } catch (error) {
    console.error('Get availability error:', error);
    throw new Error(`Failed to get availability: ${error.message}`);
  }
}

async function bookMeeting({ slotId, userEmail, userName, meetingType, notes, datetime, duration = 30, meetingData }, databaseAvailable = true) {
  // Handle both old and new API formats
  if (meetingData) {
    slotId = slotId || meetingData.sessionId;
    userEmail = userEmail || meetingData.userEmail;
    userName = userName || meetingData.userName;
    meetingType = meetingType || meetingData.meetingType;
    notes = notes || meetingData.notes;
    datetime = datetime || meetingData.datetime;
    duration = duration || meetingData.duration || 30;
  }
  try {
    // Check if slot is already booked (skip if database unavailable)
    if (databaseAvailable) {
      try {
        const existingMeeting = await getMeetingBySlotId(slotId);
        if (existingMeeting) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Time slot is no longer available' })
          };
        }
      } catch (dbError) {
        console.warn('Could not check existing meetings, proceeding:', dbError);
      }
    }

    let calendarEventId = null;
    let meetingLink = null;

    // Create calendar event if Google Calendar is configured
    if (calendar && process.env.GOOGLE_CALENDAR_ID) {
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
            { email: userEmail, displayName: userName },
            { email: 'tiendat0936@gmail.com', displayName: 'Tien Dat Do' }
          ],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 },
              { method: 'email', minutes: 10 }
            ]
          },
          conferenceData: {
            createRequest: {
              requestId: `meeting-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        };

        const calendarResponse = await calendar.events.insert({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          requestBody: event,
          conferenceDataVersion: 1,
          sendUpdates: 'all'
        });

        calendarEventId = calendarResponse.data.id;
        meetingLink = calendarResponse.data.conferenceData?.entryPoints?.find(entry => entry.entryPointType === 'video')?.uri;
      } catch (calendarError) {
        console.warn('Calendar creation failed, proceeding with database only:', calendarError.message);
      }
    }

    // Create meeting in database or return mock response
    let meeting;
    if (databaseAvailable) {
      try {
        meeting = await createMeeting({
          slotId,
          userEmail,
          userName,
          meetingType,
          notes,
          datetime,
          duration,
          calendarEventId,
          meetingLink
        });
      } catch (dbError) {
        console.warn('Could not save to database, returning mock response:', dbError);
        meeting = {
          id: `mock-${Date.now()}`,
          datetime,
          meeting_type: meetingType,
          duration,
          meeting_link: meetingLink,
          calendar_event_id: calendarEventId,
          status: 'confirmed'
        };
      }
    } else {
      // Mock meeting response when database unavailable
      meeting = {
        id: `mock-${Date.now()}`,
        datetime,
        meeting_type: meetingType,
        duration,
        meeting_link: meetingLink,
        calendar_event_id: calendarEventId,
        status: 'confirmed'
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        meetingId: meeting.id,
        meeting: {
          id: meeting.id,
          datetime: meeting.datetime,
          type: meeting.meeting_type,
          duration: meeting.duration,
          meetingLink: meeting.meeting_link,
          calendarEventId: meeting.calendar_event_id,
          status: meeting.status
        },
        databaseAvailable
      })
    };
  } catch (error) {
    console.error('Book meeting error:', error);
    throw new Error(`Failed to book meeting: ${error.message}`);
  }
}

async function getUserMeetings({ userEmail }, databaseAvailable = true) {
  try {
    let meetings = [];
    
    if (databaseAvailable) {
      try {
        meetings = await getMeetingsByEmail(userEmail);
      } catch (dbError) {
        console.warn('Could not fetch user meetings from database:', dbError);
      }
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        meetings,
        databaseAvailable
      })
    };
  } catch (error) {
    console.error('Get user meetings error:', error);
    throw new Error(`Failed to get user meetings: ${error.message}`);
  }
}

async function updateMeetingHandler({ meetingId, newDatetime, notes }, databaseAvailable = true) {
  try {
    // Get existing meeting first
    const existingMeeting = await sql`
      SELECT * FROM meetings WHERE id = ${meetingId} AND status = 'confirmed'
    `.then(result => result[0]);
    
    if (!existingMeeting) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Meeting not found' })
      };
    }

    // Update in database
    const updates = { datetime: newDatetime };
    if (notes) updates.notes = notes;
    
    const updatedMeeting = await updateMeeting(meetingId, updates);
    
    // Update Google Calendar event if it exists
    if (existingMeeting.calendar_event_id && calendar && process.env.GOOGLE_CALENDAR_ID) {
      try {
        const startTime = new Date(newDatetime);
        const endTime = new Date(startTime.getTime() + (existingMeeting.duration * 60 * 1000));

        await calendar.events.patch({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          eventId: existingMeeting.calendar_event_id,
          requestBody: {
            start: {
              dateTime: startTime.toISOString(),
              timeZone: 'Asia/Ho_Chi_Minh'
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone: 'Asia/Ho_Chi_Minh'
            },
            description: notes ? existingMeeting.description + `\nUpdated Notes: ${notes}` : existingMeeting.description
          },
          sendUpdates: 'all'
        });
      } catch (calendarError) {
        console.warn('Calendar update failed:', calendarError.message);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        meeting: updatedMeeting,
        meetingId: meetingId
      })
    };
  } catch (error) {
    console.error('Update meeting error:', error);
    throw new Error(`Failed to update meeting: ${error.message}`);
  }
}

async function cancelMeetingHandler({ meetingId }, databaseAvailable = true) {
  try {
    const meeting = await cancelMeeting(meetingId);
    
    // Cancel Google Calendar event if it exists
    if (meeting.calendar_event_id && calendar && process.env.GOOGLE_CALENDAR_ID) {
      try {
        await calendar.events.delete({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          eventId: meeting.calendar_event_id,
          sendUpdates: 'all'
        });
      } catch (calendarError) {
        console.warn('Calendar cancellation failed:', calendarError.message);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: true, meeting })
    };
  } catch (error) {
    console.error('Cancel meeting error:', error);
    throw new Error(`Failed to cancel meeting: ${error.message}`);
  }
}

async function saveConversation({ sessionId, userEmail, message, messageType }, databaseAvailable = true) {
  try {
    const conversation = await saveConversationMessage({
      sessionId,
      userEmail,
      message,
      messageType
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: true, conversation })
    };
  } catch (error) {
    console.error('Save conversation error:', error);
    throw new Error(`Failed to save conversation: ${error.message}`);
  }
}

async function getConversation({ sessionId }, databaseAvailable = true) {
  try {
    const history = await getConversationHistory(sessionId);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ history })
    };
  } catch (error) {
    console.error('Get conversation error:', error);
    throw new Error(`Failed to get conversation: ${error.message}`);
  }
}

async function getStats(databaseAvailable = true) {
  try {
    const stats = await getMeetingStats();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stats })
    };
  } catch (error) {
    console.error('Get stats error:', error);
    throw new Error(`Failed to get stats: ${error.message}`);
  }
}

function generateAvailableSlots(startDate, endDate, busyTimes, bookedSlotIds) {
  const slots = [];
  const now = new Date();

  // Business hours: 9 AM - 6 PM, Monday-Friday (Asia/Ho_Chi_Minh)
  for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
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
      
      const slotId = slotStart.getTime().toString();

      // Check if already booked in database
      if (bookedSlotIds.includes(slotId)) continue;

      // Check if conflicts with Google Calendar busy times
      const isAvailableInCalendar = !busyTimes.some(busyTime => {
        const busyStart = new Date(busyTime.start);
        const busyEnd = new Date(busyTime.end);
        return (slotStart >= busyStart && slotStart < busyEnd) ||
               (slotEnd > busyStart && slotEnd <= busyEnd) ||
               (slotStart <= busyStart && slotEnd >= busyEnd);
      });

      if (isAvailableInCalendar) {
        slots.push({
          id: slotId,
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