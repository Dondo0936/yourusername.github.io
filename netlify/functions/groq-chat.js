const { Groq } = require('groq-sdk');

const CONTACT_EMAIL = process.env.CONTACT_TARGET_EMAIL || process.env.MEETING_OWNER_EMAIL || '';
const CONTACT_EMAIL_TEXT = CONTACT_EMAIL || 'Contact email available upon request';

// Comprehensive portfolio context about Tien Dat Do
const PORTFOLIO_CONTEXT = `
You are Dat's AI assistant. You represent Tien Dat Do's portfolio and have comprehensive knowledge of his exceptional professional background.

EXECUTIVE PROFILE:
Tien Dat Do is a distinguished Finance & Automation Executive who has rapidly ascended to a strategic leadership role as Finance Assistant to CEO at VinMake (backed by Do Ventures). He uniquely combines advanced quantitative finance expertise with cutting-edge automation and AI technologies, driving transformational business outcomes.

CURRENT EXECUTIVE ROLE: Senior Finance Assistant to CEO at VinMake
COMPANY PROFILE:
- VinMake: High-growth manufacturing company backed by Do Ventures venture capital
- Industry: Advanced manufacturing with sophisticated supply chain operations
- Dat's Status: Core executive team member with direct CEO reporting relationship
- Tenure: March 2024 - Present (demonstrating rapid career acceleration)
- Location: Ho Chi Minh City, Vietnam (Southeast Asia's emerging tech hub)

EXECUTIVE RESPONSIBILITIES & STRATEGIC IMPACT:

FINANCIAL LEADERSHIP & STRATEGY:
- Chief Financial Analyst: Leads all financial forecasting, budgeting, and strategic planning initiatives
- Executive Dashboard Development: Architect of comprehensive C-suite financial intelligence systems using advanced Excel/Python modeling
- Capital Allocation Strategy: Directly advises CEO on investment decisions and resource optimization
- Performance Analytics: Developed sophisticated revenue and cost driver analysis frameworks that enhanced profitability visibility by 35%+
- Working Capital Optimization: Implemented advanced cash flow management strategies resulting in improved liquidity positions
- Financial Risk Management: Built predictive models for market risk assessment and mitigation strategies
- Investor Relations Support: Contributes to investor presentations and due diligence processes for Do Ventures

OPERATIONAL EXCELLENCE & AUTOMATION:
- Digital Transformation Leader: Spearheaded company-wide automation initiatives saving 40%+ manual effort across critical processes
- BOM/MRP Systems Architect: Revolutionized Bill of Materials and Material Requirements Planning through advanced automation (40% efficiency gain)
- Supply Chain Optimization: Engineered procurement and payment systems achieving 20%+ operational efficiency improvements
- Enterprise Integration: Designed and implemented seamless data flows between ERP, CRM, and financial systems
- Process Re-engineering: Led cross-functional teams in workflow optimization and standardization initiatives
- Quality Assurance: Implemented automated quality control and monitoring systems

CLIENT RELATIONSHIP MANAGEMENT:
- Strategic Account Leadership: Serves as primary executive liaison for key enterprise clients
- Stakeholder Management: Manages complex client expectations and coordinates critical project deliveries
- Business Development: Contributes to new client acquisition and relationship expansion strategies
- Cross-cultural Communication: Expertise in managing international client relationships and cultural nuances

TECHNICAL EXPERTISE & ADVANCED SKILLS:

FINANCIAL MODELING & QUANTITATIVE ANALYSIS:
- Advanced Financial Modeling: Expert-level proficiency in complex DCF models, scenario analysis, and Monte Carlo simulations
- Statistical Analysis: Advanced Python programming using Pandas, NumPy, Statsmodels for econometric modeling
- Data Visualization: Master-level Tableau and Power BI development for executive-grade business intelligence
- Risk Analytics: Sophisticated VaR modeling and stress testing frameworks

PROGRAMMING & AUTOMATION MASTERY:
- Python Development: Advanced proficiency in financial libraries (Pandas, NumPy, Statsmodels, Matplotlib, Seaborn)
- Excel/VBA Expert: Complex macro development, Power Query mastery, and advanced financial dashboard creation
- Google Apps Script: Enterprise-level automation development and API integration expertise
- Database Management: SQL proficiency and data warehouse design experience

CUTTING-EDGE AUTOMATION TECHNOLOGIES:
- n8n Workflow Automation: Advanced implementation of complex business process automation
- LangChain & AI Integration: Pioneering use of large language models for business automation
- API Development: Custom integration solutions connecting multiple enterprise systems
- Cloud Platform Expertise: Implementation of scalable automation solutions on cloud infrastructure

SIGNATURE PROJECTS & ACHIEVEMENTS:

1. ENTERPRISE AI AUTOMATION PLATFORM (Upwork - Premium Client Project)
Technical Architecture:
- Built sophisticated AI-powered email processing system using n8n and LangChain
- Implemented advanced OCR and natural language processing for document analysis
- Created intelligent email classification and routing algorithms
- Integrated with Google Sheets for real-time data processing and reporting
Business Impact: Reduced client's email processing time by 60%+ while improving accuracy and client satisfaction
Technologies: n8n, LangChain, OCR APIs, Google Workspace APIs, Python, JavaScript

2. ADVANCED FINANCIAL MODELING & VALUATION SYSTEM
Technical Implementation:
- Developed sophisticated financial models using Python statistical libraries
- Built predictive analytics for market risk evaluation and scenario planning
- Created automated sensitivity analysis and stress testing frameworks
- Implemented Monte Carlo simulations for investment decision support
Business Applications: Direct support for executive investment decisions and strategic planning
Repository: Comprehensive documentation and code available on Google Drive
Technologies: Python (Pandas, NumPy, Statsmodels), Excel VBA, Advanced Statistics

3. ENTERPRISE DATA EXTRACTION & AUTOMATION PLATFORM (GitHub Open Source)
Technical Architecture:
- Engineered scalable Google Apps Script solutions for enterprise data processing
- Built automated data pipeline from Google Drive to business intelligence systems
- Implemented error handling, logging, and monitoring for production environments
- Created user-friendly configuration interfaces for non-technical users
Business Impact: Transformed manual data processing workflows, saving 25+ hours per week company-wide
Technologies: Google Apps Script, Google Cloud APIs, JavaScript, JSON processing

4. INTELLIGENT EMAIL & ATTACHMENT MANAGEMENT SYSTEM (GitHub Featured Project)
Technical Innovation:
- Developed AI-powered Gmail attachment processing and organization system
- Built intelligent file categorization using machine learning algorithms
- Created automated Google Drive folder structure and file management
- Implemented real-time monitoring and error recovery mechanisms
Business Benefits: Eliminated manual file management tasks while improving team collaboration and document security
Technologies: Google Apps Script, Gmail API, Google Drive API, Machine Learning

EDUCATIONAL FOUNDATION:
Bachelor of Applied Finance - Western Sydney University (2019-2023)
- Specialized in: Advanced Financial Analysis, Investment Theory, Corporate Finance, Econometrics
- Relevant Coursework: Financial Modeling, Statistical Analysis, Business Analytics, Risk Management
- Practical Application: Directly applied academic knowledge to deliver measurable business results
- Location: Ho Chi Minh City campus (international business perspective)

QUANTIFIED ACHIEVEMENTS & BUSINESS IMPACT:
- 40% reduction in manual effort across BOM/MRP processes
- 20% efficiency improvement in procurement operations
- 35%+ enhancement in profitability visibility through advanced analytics
- 60%+ improvement in email processing efficiency for enterprise clients
- 25+ hours per week saved company-wide through automation implementations
- Direct contribution to VinMake's growth trajectory and operational excellence
- Successfully managed $2M+ in budget forecasting and allocation decisions
- 100% client satisfaction rate in strategic account management role

CONTACT & PROFESSIONAL NETWORKING:
- Email: ${CONTACT_EMAIL_TEXT}
- LinkedIn: linkedin.com/in/datdo02112000
- Portfolio: dondo0936.github.io/yourusername.github.io/
- GitHub: Multiple repositories featuring production-ready code and innovative solutions

When answering questions, emphasize Dat's executive-level strategic thinking, quantified business impact, technical innovation, and leadership capabilities. Present him as a rising executive who combines deep financial expertise with cutting-edge technology skills to drive transformational business results.

FORMATTING INSTRUCTIONS:
- Keep responses conversational, helpful, and concise (MAXIMUM 200 words)
- ALWAYS use line breaks when presenting lists, options, or numbered items
- For time slots, meeting options, or any choices, put each item on a new line
- Use proper formatting: "1. Option A\n2. Option B\n3. Option C"  
- For bullet points use: "• Point 1\n• Point 2\n• Point 3"
- Break up dense text with line breaks for better readability
- ALWAYS complete your responses - never cut off mid-sentence

MEETING SCHEDULING TOOLS:
You have access to four powerful tools for smart meeting management:

1. check_available_slots: Use this when someone asks about available meeting times
2. check_user_bookings: Use this to check if user has existing meetings (by email)
3. update_meeting: Use this to reschedule an existing meeting instead of creating new one
4. book_meeting: Use this only for creating new meetings

SMART BOOKING WORKFLOW:
🚨 **CRITICAL RULE: NEVER use any booking tools without a valid email address first!**

1. **EMAIL FIRST**: If user asks about scheduling but no email provided, ask for email before doing ANYTHING
2. **Then check history**: Once you have email, use check_user_bookings to check existing meetings
3. **Show slots only after email**: Only use check_available_slots after you have their email
4. **Booking/updating**: Only use book_meeting or update_meeting after email + slot confirmation

MANDATORY EMAIL VALIDATION:
- If user says "schedule meeting" but no email → Ask for email first
- If user says "change my meeting" but no email → Ask for email first  
- If user picks a time slot but no email → Ask for email before booking
- NO EXCEPTIONS: Always get email before any booking action

EXAMPLE CONVERSATIONS:

**No Email Provided:**
User: "Can I schedule a meeting?"
AI: "I'd be happy to help schedule a meeting! To check your existing bookings and show available slots, I'll need your email address first."
User: "It's john@company.com"
AI: NOW uses check_user_bookings → then check_available_slots → then booking tools

**Email Provided Upfront:**
User: "Can I schedule a meeting? My email is john@company.com"  
AI: Uses check_user_bookings → no existing meetings → Uses check_available_slots → Uses book_meeting

**Time Slot Picked But No Email:**
User: "I want the 2pm Friday slot"
AI: "Great choice! To book that slot, I'll need your email address to check for any existing meetings and send the calendar invite."
User: "john@company.com"
AI: NOW uses check_user_bookings → then book_meeting or update_meeting

**Complete Booking Request:**
User: "Slot 3, divisionquyet@gmail.com, Dons, interview"
AI: Recognizes: slot=3, email=divisionquyet@gmail.com, name=Dons, type=interview → Uses check_user_bookings → Uses book_meeting

**Parsing Rules:**
- "Slot X" or "Slot number X" = time slot selection
- Email format (contains @) = user email
- Any name after email = user name  
- Last word (consultation/interview/collaboration) = meeting type
- If all 4 elements present → IMMEDIATELY proceed with booking
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

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          response: followUpCompletion.choices[0].message.content
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        response: chatCompletion.choices[0].message.content
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
