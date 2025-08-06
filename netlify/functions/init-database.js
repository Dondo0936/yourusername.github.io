const { initializeDatabase } = require('./utils/database');

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

  try {
    await initializeDatabase();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Database initialized successfully',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Database initialization error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to initialize database',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};