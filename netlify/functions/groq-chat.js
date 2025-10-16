const { Groq } = require('groq-sdk');

const CONTACT_EMAIL = process.env.CONTACT_TARGET_EMAIL || process.env.MEETING_OWNER_EMAIL || '';
const CONTACT_EMAIL_TEXT = CONTACT_EMAIL || 'Contact email available upon request';

function extractMessageContent(message) {
  if (!message) return '';

  const { content } = message;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part) return '';
        if (typeof part === 'string') return part;
        if (typeof part.text === 'string') return part.text;
        if (part.type === 'text' && typeof part.text?.value === 'string') return part.text.value;
        if (typeof part.text?.content === 'string') return part.text.content;
        return '';
      })
      .join('')
      .trim();
  }

  if (typeof content?.text === 'string') {
    return content.text.trim();
  }

  if (typeof content?.text?.value === 'string') {
    return content.text.value.trim();
  }

  return '';
}

// Comprehensive portfolio context about Tien Dat Do (Data Analytics focus)
const PORTFOLIO_CONTEXT = `
You are Dat's AI assistant. Always introduce yourself that way and keep every conversation anchored in Dat Do's data analytics, automation, and business intelligence work.
Craft tailored responses from the information below or live tool outputs—never rely on canned scripts. If a request is unrelated to Dat's professional background, politely decline and explain you can only cover his skills, projects, and collaboration opportunities.

CORE PROFESSIONAL STORY (grounded in his resume):
- VinMake (Assistant to CEO, Apr 2024–Present, Ho Chi Minh City): Leads data & performance analytics (60%) by building lightweight ETL/ELT pipelines in Lark Base/Airtable with Google Apps Script. Models star schemas (fact_po, fact_shipment, fact_qc with supporting dimensions) to keep metrics consistent. Created metric layers for OTIF, lead-time percentiles, defect/AQL rates, yield, cost variance, and post-logistics margins—lifting gross-margin visibility 12% and cash-flow forecast accuracy 25%. Owns process mapping, SLA design, validation rules, and alert thresholds across procurement → production → QC → shipment. Maintains client reporting packs that cut manual prep 40%.
- Upwork Freelance (Virtual Assistant & Automation Specialist, Mar–May 2025): Built Gmail-triggered workflows that classify emails with LangChain, extract PDFs via OCR, parse line-item data into structured JSON, and sync to Google Sheets—eliminating manual procurement inbox triage.
- BreakdownAI (Developer & AI Integrator, Jul–Sep 2025): Architected a multimodal AI pipeline (Claude Sonnet 4 for vision analysis, Kimi K2 for BOM generation, GPT-120B for supplier research) atop Firebase Cloud Functions and Firestore job queues, delivering SAP-style CSV exports for manufacturing analytics.
- AbeL (Founder, Jan–Aug 2024): Negotiated with 12+ suppliers to cut material costs 10%, built BOM cost sheets for 50+ SKUs, launched 8 collections, and stood up dashboards for SKU profitability, campaign ROI, and defect/return tracking.
- Academic foundation: Bachelor of Applied Finance (Western Sydney University, 2019–2023) with coursework in Business & Data Analytics, Financial Modeling, Forecasting, and Budgeting.

DATA & ANALYTICS SKILL SET:
- Programming & Analytics: Python (pandas, NumPy, matplotlib, seaborn), Jupyter, SQL joins/aggregations, regression analysis, Monte Carlo simulations, hypothesis testing.
- Data Engineering & Automation: Google Apps Script, ETL workflows, star schema design, Airtable/Lark Base automation, data validation and audit trails, lightweight ELT pipelines.
- Business Intelligence: Tableau, Power BI (Power Query, some DAX), Looker Studio, Excel (VBA, Power Query, advanced formulas), Google Sheets dashboards/metric layers.
- Collaboration & Ops: Process mapping, SLA definition, procurement/QC operations, templated reporting packs, tooling such as Notion, Lark, Slack, Linear, Trello.

HIGHLIGHTED PROJECTS:
1. Gmail-to-Sheets procurement automation: Classifies inbound emails, downloads attachments with OCR, parses structured data, and updates Google Sheets for PO tracking.
2. Recursive “Payment entry” processor: Scans Drive folders for “(NEW)” files, extracts rows from the “Payment entry” sheet, cleans and reloads standardized tables automatically.
3. Gmail attachment uploader: Filters specific senders/subjects, renames attachments with metadata, stores them in Google Drive with client/date folders, and archives email content as EML.
4. Financial modeling & valuation studies: Normalized Vietstock/CafeF data, analyzed return distributions, ran Monte Carlo simulations, and published stakeholder-ready dashboards (pandas/Plotly/Seaborn).

COLLABORATION CHANNELS:
- Email: ${CONTACT_EMAIL_TEXT}
- LinkedIn: linkedin.com/in/datdo02112000
- Portfolio: dondo0936.github.io/yourusername.github.io/
- GitHub/Drive: Hosts automation and analytics samples referenced above.

RESPONSE GUIDELINES:
- Stay under 200 words; use concise paragraphs or bullet lists for clarity.
- Connect answers to Dat's analytical approach, tools, and quantified impact.
- Clarify assumptions or data sources when helpful; invite follow-up questions that deepen understanding.
- Offer the contact email or meeting scheduling help when collaboration is requested.
- For unrelated or personal questions, reply politely: “I’m Dat’s AI assistant and can only discuss his professional background, skills, and projects.”

MEETING & TOOL USAGE:
- Use check_user_bookings, check_available_slots, book_meeting, or update_meeting only when the user explicitly wants to schedule/reschedule with Dat. Collect name, email, preferred slot, meeting type, and optional agenda before booking.
- Present available slots one per line; if booking fails, suggest reaching out via email.

Tone: Professional, data-driven, supportive. End with a helpful prompt or next step when it adds value.
`;

// Tool handler functions
async function handleCheckAvailableSlots(args) {
  // Generate available slots for the next 14 days
  // Note: user_email is required for context tracking
  const slots = [];
  const now = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Add morning and afternoon slots
    const morningSlot = new Date(date);
    morningSlot.setHours(9, 0, 0, 0);
    
    const afternoonSlot = new Date(date);
    afternoonSlot.setHours(14, 0, 0, 0);
    
    slots.push({
      datetime: morningSlot.toISOString(),
      display: morningSlot.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });
    
    slots.push({
      datetime: afternoonSlot.toISOString(),
      display: afternoonSlot.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });
  }
  
  return {
    success: true,
    slots: slots.slice(0, 10), // Return first 10 slots
    message: "Available time slots retrieved"
  };
}

async function handleCheckUserBookings(args) {
  try {
    const response = await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/meeting-manager`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getUserMeetings',
        userEmail: args.user_email
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        existingMeetings: result.meetings || [],
        hasExistingBooking: result.meetings && result.meetings.length > 0,
        message: result.meetings && result.meetings.length > 0 
          ? `Found ${result.meetings.length} existing meeting(s)` 
          : "No existing meetings found"
      };
    } else {
      return {
        success: false,
        existingMeetings: [],
        hasExistingBooking: false,
        message: "Could not check existing bookings"
      };
    }
  } catch (error) {
    console.error('Error checking user bookings:', error);
    return {
      success: false,
      existingMeetings: [],
      hasExistingBooking: false,
      message: "Could not check existing bookings"
    };
  }
}

async function handleUpdateMeeting(args) {
  try {
    const response = await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/meeting-manager`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateMeeting',
        meetingId: args.meeting_id,
        newDatetime: args.new_datetime,
        notes: args.notes || ''
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        meetingId: args.meeting_id,
        message: "Meeting successfully rescheduled! Updated calendar invite sent.",
        newDatetime: args.new_datetime
      };
    } else {
      throw new Error('Failed to update meeting');
    }
  } catch (error) {
    console.error('Error updating meeting:', error);
    return {
      success: false,
      message: "Sorry, I couldn't reschedule the meeting automatically. Please contact us directly.",
      error: error.message
    };
  }
}

async function handleBookMeeting(args) {
  try {
    // Here you would integrate with your existing meeting-manager function
    const response = await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/meeting-manager`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'bookMeeting',
        meetingData: {
          datetime: args.datetime,
          userEmail: args.user_email,
          userName: args.user_name,
          meetingType: args.meeting_type,
          notes: args.notes || '',
          duration: 30,
          sessionId: 'ai-booking-' + Date.now()
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        meetingId: result.meetingId,
        message: "Meeting booked successfully! You'll receive a calendar invite shortly.",
        details: {
          datetime: args.datetime,
          userEmail: args.user_email,
          userName: args.user_name,
          meetingType: args.meeting_type
        }
      };
    } else {
      throw new Error('Failed to book meeting');
    }
  } catch (error) {
    console.error('Error booking meeting:', error);
    return {
      success: false,
      message: "Sorry, I couldn't book the meeting automatically. Please use the contact form to schedule manually.",
      error: error.message
    };
  }
}

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { message } = JSON.parse(event.body);

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Rate limiting - basic check
    if (message.length > 500) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Message too long. Please keep it under 500 characters.' })
      };
    }

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Define tools for meeting booking
    const tools = [
      {
        type: "function",
        function: {
          name: "check_available_slots",
          description: "Get available time slots for scheduling meetings - ONLY use after getting user's email",
          parameters: {
            type: "object",
            properties: {
              user_email: {
                type: "string",
                description: "User's email address (required for context tracking)"
              },
              date_range: {
                type: "string",
                description: "Date range to check (e.g., 'next_week', 'this_month')"
              }
            },
            required: ["user_email"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "check_user_bookings",
          description: "Check if user has existing meetings and get their booking history",
          parameters: {
            type: "object",
            properties: {
              user_email: {
                type: "string",
                description: "User's email address to check for existing bookings"
              }
            },
            required: ["user_email"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_meeting",
          description: "Update/reschedule an existing meeting instead of creating a new one",
          parameters: {
            type: "object",
            properties: {
              meeting_id: {
                type: "string",
                description: "ID of the existing meeting to update"
              },
              new_datetime: {
                type: "string",
                description: "New meeting date and time in ISO format"
              },
              notes: {
                type: "string",
                description: "Updated meeting notes"
              }
            },
            required: ["meeting_id", "new_datetime"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "book_meeting",
          description: "Book a meeting at a specific time slot",
          parameters: {
            type: "object",
            properties: {
              datetime: {
                type: "string",
                description: "Meeting date and time in ISO format"
              },
              user_email: {
                type: "string",
                description: "User's email address"
              },
              user_name: {
                type: "string",
                description: "User's name"
              },
              meeting_type: {
                type: "string",
                enum: ["consultation", "collaboration", "job-opportunity", "other"],
                description: "Type of meeting"
              },
              notes: {
                type: "string",
                description: "Additional meeting notes or agenda"
              }
            },
            required: ["datetime", "user_email", "user_name", "meeting_type"]
          }
        }
      }
    ];

    // Call Groq API with Qwen 3 and function calling
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: PORTFOLIO_CONTEXT
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "qwen/qwen3-32b",
      temperature: 0.6,
      max_completion_tokens: 300,
      top_p: 0.95,
      stream: false,
      reasoning_effort: "default",
      tools: tools,
      tool_choice: "auto"
    });

    // Handle function calls
    if (chatCompletion.choices[0].message.tool_calls) {
      const toolCall = chatCompletion.choices[0].message.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      let functionResult;
      
      if (functionName === "check_available_slots") {
        functionResult = await handleCheckAvailableSlots(functionArgs);
      } else if (functionName === "check_user_bookings") {
        functionResult = await handleCheckUserBookings(functionArgs);
      } else if (functionName === "update_meeting") {
        functionResult = await handleUpdateMeeting(functionArgs);
      } else if (functionName === "book_meeting") {
        functionResult = await handleBookMeeting(functionArgs);
      }

      // Get final response with function result
      const followUpCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: PORTFOLIO_CONTEXT
          },
          {
            role: "user",
            content: message
          },
          chatCompletion.choices[0].message,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(functionResult)
          }
        ],
        model: "qwen/qwen3-32b",
        temperature: 0.6,
        max_completion_tokens: 300,
        top_p: 0.95
      });

      const followUpContent = extractMessageContent(followUpCompletion.choices[0].message);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          response: followUpContent || 'I’m sorry, I could not generate a response to that. Could you rephrase your question?'
        })
      };
    }

    const directContent = extractMessageContent(chatCompletion.choices[0].message);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        response: directContent || 'I’m sorry, I could not generate a response to that. Could you try asking in a different way?'
      })
    };

  } catch (error) {
    console.error('Error calling Groq API:', error);
    
    // Handle different types of errors
    let errorMessage = 'Sorry, I encountered an error. Please try again later.';
    let statusCode = 500;

    if (error.status === 401) {
      errorMessage = 'Authentication error. Please contact the site administrator.';
      statusCode = 500; // Don't expose auth errors to client
    } else if (error.status === 429) {
      errorMessage = 'I\'m receiving too many requests right now. Please try again in a moment.';
      statusCode = 429;
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = 'Invalid request. Please check your message and try again.';
      statusCode = 400;
    }

    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: errorMessage })
    };
  }
};
