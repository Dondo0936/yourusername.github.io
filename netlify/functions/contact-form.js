const nodemailer = require('nodemailer');

const BASE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: BASE_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: BASE_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      headers: BASE_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON payload' })
    };
  }

  const { name, email, purpose, message } = payload;

  if (!name || !email || !message) {
    return {
      statusCode: 400,
      headers: BASE_HEADERS,
      body: JSON.stringify({
        error: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : undefined,
          email: !email ? 'Email is required' : undefined,
          message: !message ? 'Message is required' : undefined
        }
      })
    };
  }

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 465;
  const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : smtpPort === 465;
  const targetEmail =
    process.env.CONTACT_TARGET_EMAIL || 'tiendat0936@gmail.com';

  if (!smtpUser || !smtpPass) {
    console.error('Missing SMTP credentials');
    return {
      statusCode: 500,
      headers: BASE_HEADERS,
      body: JSON.stringify({
        error: 'Email service not configured',
        details:
          'Please set SMTP_USER/SMTP_PASS or GMAIL_USER/GMAIL_APP_PASSWORD environment variables.'
      })
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const emailSubject = `New contact form message${
      purpose ? `: ${purpose}` : ''
    }`;

    const emailBody = `
Name: ${name}
Email: ${email}
Purpose: ${purpose || 'Not provided'}

Message:
${message}
    `;

    await transporter.sendMail({
      from: `"Portfolio Contact" <${smtpUser}>`,
      to: targetEmail,
      replyTo: email,
      subject: emailSubject,
      text: emailBody,
      html: emailBody
        .split('\n')
        .map((line) => `<p>${line || '&nbsp;'}</p>`)
        .join('')
    });

    return {
      statusCode: 200,
      headers: BASE_HEADERS,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      statusCode: 500,
      headers: BASE_HEADERS,
      body: JSON.stringify({
        error: 'Failed to send email',
        details: error.message
      })
    };
  }
};
