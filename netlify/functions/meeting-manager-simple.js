// Simple meeting manager fallback without external dependencies
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
      case 'getUserMeetings':
        return await getUserMeetings(data);
      case 'updateMeeting':
        return await updateMeeting(data);
      default:
        return generateMockResponse(action);
    }
  } catch (error) {
    console.error('Meeting manager error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};

async function getAvailability({ startDate, endDate }) {
  const slots = [];
  const start = new Date(startDate || new Date());
  const end = new Date(endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));

  // Generate mock available slots
  for (let i = 1; i <= 10; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends

    const slot = new Date(date);
    slot.setHours(9 + (i % 8), 0, 0, 0);

    slots.push({
      id: slot.getTime().toString(),
      datetime: slot.toISOString(),
      available: true,
      formattedTime: slot.toLocaleDateString('en-US', {
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

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      availableSlots: slots.slice(0, 5),
      totalBooked: 0,
      hasCalendarIntegration: false,
      databaseAvailable: false
    })
  };
}

async function bookMeeting({ meetingData, ...directData }) {
  // Handle both API formats
  const data = meetingData || directData;
  const meetingId = `meeting-${Date.now()}`;
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      meetingId,
      message: 'Meeting booked successfully! (Mock booking - calendar invite will be sent manually)',
      meeting: {
        id: meetingId,
        datetime: data.datetime,
        type: data.meetingType || 'consultation',
        duration: data.duration || 30,
        status: 'confirmed'
      },
      databaseAvailable: false
    })
  };
}

async function getUserMeetings({ userEmail }) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      meetings: [],
      databaseAvailable: false
    })
  };
}

async function updateMeeting({ meetingId, newDatetime }) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      meetingId,
      message: 'Meeting updated successfully! (Mock update)',
      newDatetime,
      databaseAvailable: false
    })
  };
}

function generateMockResponse(action) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action,
      success: true,
      message: 'Mock response - function working',
      databaseAvailable: false
    })
  };
}