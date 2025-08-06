const { neon } = require('@neondatabase/serverless');

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL);

/**
 * Initialize database tables
 */
async function initializeDatabase() {
  try {
    // Create meetings table
    await sql`
      CREATE TABLE IF NOT EXISTS meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slot_id VARCHAR(50) UNIQUE NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        meeting_type VARCHAR(50) NOT NULL DEFAULT 'consultation',
        notes TEXT,
        datetime TIMESTAMPTZ NOT NULL,
        duration INTEGER NOT NULL DEFAULT 30,
        status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
        calendar_event_id VARCHAR(255),
        meeting_link TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // Create index on datetime for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_meetings_datetime ON meetings(datetime)
    `;

    // Create index on user_email for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_meetings_user_email ON meetings(user_email)
    `;

    // Create index on slot_id for faster availability checks
    await sql`
      CREATE INDEX IF NOT EXISTS idx_meetings_slot_id ON meetings(slot_id)
    `;

    // Create conversation history table
    await sql`
      CREATE TABLE IF NOT EXISTS conversation_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(255) NOT NULL,
        user_email VARCHAR(255),
        message TEXT NOT NULL,
        message_type VARCHAR(10) NOT NULL CHECK (message_type IN ('user', 'bot')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // Create index on session_id
    await sql`
      CREATE INDEX IF NOT EXISTS idx_conversation_session ON conversation_history(session_id)
    `;

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Create a new meeting
 */
async function createMeeting({
  slotId,
  userEmail,
  userName,
  meetingType,
  notes,
  datetime,
  duration,
  calendarEventId,
  meetingLink
}) {
  try {
    const result = await sql`
      INSERT INTO meetings (
        slot_id, user_email, user_name, meeting_type, notes, 
        datetime, duration, calendar_event_id, meeting_link
      )
      VALUES (
        ${slotId}, ${userEmail}, ${userName}, ${meetingType}, ${notes},
        ${datetime}, ${duration}, ${calendarEventId}, ${meetingLink}
      )
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Create meeting error:', error);
    throw error;
  }
}

/**
 * Get meeting by slot ID
 */
async function getMeetingBySlotId(slotId) {
  try {
    const result = await sql`
      SELECT * FROM meetings 
      WHERE slot_id = ${slotId} 
      AND datetime > NOW()
      AND status = 'confirmed'
    `;
    return result[0];
  } catch (error) {
    console.error('Get meeting by slot error:', error);
    throw error;
  }
}

/**
 * Get meetings by user email
 */
async function getMeetingsByEmail(userEmail) {
  try {
    const result = await sql`
      SELECT * FROM meetings 
      WHERE user_email = ${userEmail}
      AND datetime > NOW()
      AND status = 'confirmed'
      ORDER BY datetime ASC
    `;
    return result;
  } catch (error) {
    console.error('Get meetings by email error:', error);
    throw error;
  }
}

/**
 * Get all booked slots in a date range
 */
async function getBookedSlots(startDate, endDate) {
  try {
    const result = await sql`
      SELECT slot_id, datetime FROM meetings
      WHERE datetime >= ${startDate}
      AND datetime <= ${endDate}
      AND status = 'confirmed'
    `;
    return result;
  } catch (error) {
    console.error('Get booked slots error:', error);
    throw error;
  }
}

/**
 * Cancel meeting by ID
 */
async function cancelMeeting(meetingId) {
  try {
    const result = await sql`
      UPDATE meetings 
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${meetingId}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Cancel meeting error:', error);
    throw error;
  }
}

/**
 * Update meeting
 */
async function updateMeeting(meetingId, updates) {
  try {
    const setClause = Object.keys(updates)
      .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 2}`)
      .join(', ');
    
    const values = [meetingId, ...Object.values(updates)];
    
    const result = await sql`
      UPDATE meetings 
      SET ${sql.unsafe(setClause)}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `.apply(null, values);
    
    return result[0];
  } catch (error) {
    console.error('Update meeting error:', error);
    throw error;
  }
}

/**
 * Save conversation message
 */
async function saveConversationMessage({
  sessionId,
  userEmail,
  message,
  messageType
}) {
  try {
    const result = await sql`
      INSERT INTO conversation_history (
        session_id, user_email, message, message_type
      )
      VALUES (
        ${sessionId}, ${userEmail}, ${message}, ${messageType}
      )
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Save conversation error:', error);
    throw error;
  }
}

/**
 * Get conversation history by session
 */
async function getConversationHistory(sessionId, limit = 50) {
  try {
    const result = await sql`
      SELECT * FROM conversation_history
      WHERE session_id = ${sessionId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Get conversation history error:', error);
    throw error;
  }
}

/**
 * Clean old conversation history (keep last 30 days)
 */
async function cleanOldConversations() {
  try {
    await sql`
      DELETE FROM conversation_history 
      WHERE created_at < NOW() - INTERVAL '30 days'
    `;
  } catch (error) {
    console.error('Clean old conversations error:', error);
    throw error;
  }
}

/**
 * Get meeting statistics
 */
async function getMeetingStats() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_meetings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_meetings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_meetings,
        COUNT(CASE WHEN datetime > NOW() THEN 1 END) as upcoming_meetings,
        meeting_type,
        COUNT(*) as count_by_type
      FROM meetings 
      GROUP BY meeting_type
    `;
    return result;
  } catch (error) {
    console.error('Get meeting stats error:', error);
    throw error;
  }
}

module.exports = {
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
  cleanOldConversations,
  getMeetingStats
};