// Project data for modals
const PROJECT_DATA = {
    'ai-email-agent': {
        title: 'AI-Powered Email & Data Agent',
        description: 'Developed a sophisticated AI agent using n8n and LangChain for automated email classification, PDF data extraction with OCR capabilities, and seamless Google Sheets integration. This enterprise-grade solution processes hundreds of emails daily, extracting key data points and routing them to appropriate workflows.',
        features: [
            'Intelligent email classification using LangChain',
            'Advanced OCR for PDF document processing',
            'Real-time Google Sheets integration',
            'Custom workflow automation with n8n',
            'Error handling and monitoring systems'
        ],
        technologies: ['n8n', 'LangChain', 'OCR APIs', 'Google Sheets API', 'JavaScript'],
        links: [
            { text: 'View on Upwork', url: 'https://www.upwork.com/freelancers/~01d919364bdbf903ce?p=1916487322753646592' }
        ],
        impact: '60% reduction in email processing time, 95% accuracy in data extraction'
    },
    'financial-modeling': {
        title: 'Financial Modeling & Valuation',
        description: 'Led comprehensive financial analysis projects creating sophisticated predictive models and sensitivity analyses using Python and Excel. Built advanced DCF models, Monte Carlo simulations, and risk assessment frameworks for executive decision-making.',
        features: [
            'Advanced DCF valuation models',
            'Monte Carlo risk simulations',
            'Sensitivity analysis frameworks',
            'Automated reporting systems',
            'Executive dashboard creation'
        ],
        technologies: ['Python', 'Pandas', 'NumPy', 'Statsmodels', 'Excel VBA'],
        links: [
            { text: 'View Portfolio', url: 'https://drive.google.com/drive/folders/1WBIQdZ7DdKcvxrTuklL-pbwSu9px-7T1?usp=sharing' }
        ],
        impact: 'Supported $2M+ investment decisions, 35% improvement in forecast accuracy'
    },
    'data-extraction': {
        title: 'Automated Data Extraction',
        description: 'Engineered scalable Google Apps Scripts for automated data extraction from Google Drive, enhancing data accessibility and workflow efficiency. Built enterprise-grade solutions with error handling, logging, and user-friendly interfaces.',
        features: [
            'Automated Google Drive data processing',
            'Enterprise-grade error handling',
            'Real-time monitoring and logging',
            'User-friendly configuration interfaces',
            'Scalable architecture design'
        ],
        technologies: ['Google Apps Script', 'Google Drive API', 'JavaScript', 'JSON'],
        links: [
            { text: 'View on GitHub', url: 'https://github.com/Dondo0936/App-Script-Automation' }
        ],
        impact: '25+ hours saved per week, 100% accuracy in data processing'
    },
    'gmail-automation': {
        title: 'Gmail Attachment Automation',
        description: 'Streamlined Gmail attachment processing with intelligent file categorization, automated Google Drive storage, and smart folder organization. Features include duplicate detection, file type validation, and comprehensive error recovery.',
        features: [
            'Intelligent attachment categorization',
            'Automated Google Drive organization',
            'Duplicate detection and handling',
            'File type validation',
            'Comprehensive error recovery'
        ],
        technologies: ['Google Apps Script', 'Gmail API', 'Google Drive API', 'JavaScript'],
        links: [
            { text: 'View on GitHub', url: 'https://github.com/Dondo0936/GmailAttachmentsSaving' }
        ],
        impact: 'Eliminated manual file management, improved team collaboration by 40%'
    }
};

// Enhanced chatbot with conversation memory and suggestions
class PortfolioChatbot {
    constructor() {
        this.chatbotToggle = document.getElementById('chatbot-toggle');
        this.chatbotContainer = document.getElementById('chatbot-container');
        this.chatbotClose = document.getElementById('chatbot-close');
        this.chatbotMessages = document.getElementById('chatbot-messages');
        this.chatbotInput = document.getElementById('chatbot-input');
        this.chatbotSend = document.getElementById('chatbot-send');
        this.quickActions = document.getElementById('quick-actions');
        this.suggestedQuestions = document.getElementById('suggested-questions');
        
        this.isOpen = false;
        this.isLoading = false;
        this.conversationHistory = this.loadConversationHistory();
        
        this.suggestionQuestions = [
            "Tell me more about his automation expertise",
            "What makes his financial modeling unique?",
            "How does he combine finance with technology?",
            "What are his biggest achievements?",
            "What industries has he worked in?",
            "Can you help me schedule a meeting?",
            "What are his available time slots?",
            "I'd like to book a consultation"
        ];
        
        // Meeting management
        this.availableSlots = [];
        this.bookedMeetings = [];
        this.userBookingData = null;
        this.sessionId = this.generateSessionId();
        this.initializeAvailableSlots();
        
        this.initEventListeners();
        this.loadConversationHistory();
    }
    
    initEventListeners() {
        // Toggle chatbot
        this.chatbotToggle.addEventListener('click', () => this.toggleChatbot());
        this.chatbotClose.addEventListener('click', () => this.closeChatbot());
        
        // Send message
        this.chatbotSend.addEventListener('click', () => this.sendMessage());
        this.chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Quick actions
        this.quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                const message = e.target.dataset.message;
                this.chatbotInput.value = message;
                this.sendMessage();
            }
        });
        
        // Close chatbot when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.chatbotContainer.contains(e.target) && 
                !this.chatbotToggle.contains(e.target)) {
                this.closeChatbot();
            }
        });
        
        // Auto-resize input
        this.chatbotInput.addEventListener('input', () => {
            this.chatbotInput.style.height = 'auto';
            this.chatbotInput.style.height = this.chatbotInput.scrollHeight + 'px';
        });
    }
    
    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }
    
    openChatbot() {
        this.chatbotContainer.classList.add('open');
        this.isOpen = true;
        this.chatbotInput.focus();
        this.loadConversationHistory();
        
        // Animation
        this.chatbotContainer.style.opacity = '0';
        this.chatbotContainer.style.transform = 'translateY(20px) scale(0.95)';
        
        requestAnimationFrame(() => {
            this.chatbotContainer.style.transition = 'all 0.3s ease-out';
            this.chatbotContainer.style.opacity = '1';
            this.chatbotContainer.style.transform = 'translateY(0) scale(1)';
        });
    }
    
    closeChatbot() {
        this.chatbotContainer.style.transition = 'all 0.2s ease-in';
        this.chatbotContainer.style.opacity = '0';
        this.chatbotContainer.style.transform = 'translateY(10px) scale(0.98)';
        
        setTimeout(() => {
            this.chatbotContainer.classList.remove('open');
            this.isOpen = false;
            this.chatbotContainer.style.transition = '';
            this.chatbotContainer.style.transform = '';
            this.chatbotContainer.style.opacity = '';
        }, 200);
    }
    
    async sendMessage() {
        const message = this.chatbotInput.value.trim();
        if (!message || this.isLoading) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        this.saveMessageToHistory(message, 'user');
        this.chatbotInput.value = '';
        this.chatbotInput.style.height = 'auto';
        
        // Hide suggestions
        this.hideSuggestions();
        
        // Show enhanced loading state
        this.setLoading(true);
        const typingIndicator = this.addEnhancedTypingIndicator();
        
        try {
            // Check if message is about meeting booking first
            const meetingResponse = await this.handleMeetingRequest(message);
            if (meetingResponse) {
                // Handle meeting booking locally
                this.removeTypingIndicator(typingIndicator);
                this.addMessage(meetingResponse, 'bot');
                this.saveMessageToHistory(meetingResponse, 'bot');
                this.showSuggestedQuestions();
                return;
            }
            
            // Check if user is providing booking details
            if (this.isBookingInProgress(message)) {
                const bookingResponse = await this.processBookingDetails(message);
                this.removeTypingIndicator(typingIndicator);
                this.addMessage(bookingResponse, 'bot');
                this.saveMessageToHistory(bookingResponse, 'bot');
                this.showSuggestedQuestions();
                return;
            }
            
            // Send message to Claude API for other queries
            const response = await fetch('/.netlify/functions/claude-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network error occurred');
            }
            
            const data = await response.json();
            
            // Remove typing indicator and add bot response
            this.removeTypingIndicator(typingIndicator);
            this.addMessage(data.response, 'bot');
            this.saveMessageToHistory(data.response, 'bot');
            
            // Show suggested questions
            this.showSuggestedQuestions();
            
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator(typingIndicator);
            
            let errorMessage = 'Sorry, I encountered an error. Please try again later.';
            if (error.message.includes('too many requests')) {
                errorMessage = 'I\'m receiving too many requests right now. Please try again in a moment.';
            } else if (error.message.includes('Message too long')) {
                errorMessage = error.message;
            }
            
            this.addMessage(errorMessage, 'bot');
        } finally {
            this.setLoading(false);
        }
    }
    
    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        this.chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom with smooth animation
        setTimeout(() => {
            this.chatbotMessages.scrollTo({
                top: this.chatbotMessages.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
        
        return messageDiv;
    }
    
    addEnhancedTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator enhanced';
        typingDiv.innerHTML = `
            <div class="typing-dot enhanced"></div>
            <div class="typing-dot enhanced"></div>
            <div class="typing-dot enhanced"></div>
        `;
        
        messageDiv.appendChild(typingDiv);
        this.chatbotMessages.appendChild(messageDiv);
        
        this.chatbotMessages.scrollTo({
            top: this.chatbotMessages.scrollHeight,
            behavior: 'smooth'
        });
        
        return messageDiv;
    }
    
    removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.chatbotSend.disabled = loading;
        this.chatbotInput.disabled = loading;
        
        if (loading) {
            this.chatbotSend.textContent = '...';
        } else {
            this.chatbotSend.textContent = 'Send';
            this.chatbotInput.focus();
        }
    }
    
    showSuggestedQuestions() {
        this.suggestedQuestions.innerHTML = '';
        
        // Randomly select 3 suggestions
        const randomSuggestions = this.suggestionQuestions
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        randomSuggestions.forEach((question, index) => {
            setTimeout(() => {
                const bubble = document.createElement('span');
                bubble.className = 'suggestion-bubble';
                bubble.textContent = question;
                bubble.addEventListener('click', () => {
                    this.chatbotInput.value = question;
                    this.sendMessage();
                });
                this.suggestedQuestions.appendChild(bubble);
            }, index * 200);
        });
        
        this.suggestedQuestions.classList.add('show');
    }
    
    hideSuggestions() {
        this.suggestedQuestions.classList.remove('show');
    }
    
    async saveMessageToHistory(message, type, userEmail = null) {
        const timestamp = new Date().toISOString();
        this.conversationHistory.push({ message, type, timestamp });
        
        // Keep only last 50 messages locally
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
        
        // Save to database
        try {
            await fetch('/.netlify/functions/meeting-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'saveConversation',
                    sessionId: this.sessionId,
                    userEmail: userEmail,
                    message: message,
                    messageType: type
                })
            });
        } catch (error) {
            console.warn('Failed to save conversation to database:', error);
        }
        
        // Keep localStorage as fallback
        localStorage.setItem('chatbot_history', JSON.stringify(this.conversationHistory));
    }
    
    loadConversationHistory() {
        const saved = localStorage.getItem('chatbot_history');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
            
            // Clear existing messages except initial greeting
            const messages = this.chatbotMessages.querySelectorAll('.message');
            messages.forEach((msg, index) => {
                if (index > 0) msg.remove();
            });
            
            // Restore conversation
            this.conversationHistory.forEach(({ message, type }) => {
                if (type !== 'greeting') {
                    this.addMessage(message, type);
                }
            });
        } else {
            this.conversationHistory = [];
        }
    }
    
    // Meeting Management Methods
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async generateAvailableSlots() {
        try {
            const now = new Date();
            const endDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days from now
            
            const response = await fetch('/.netlify/functions/meeting-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'getAvailability',
                    startDate: now.toISOString(),
                    endDate: endDate.toISOString()
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.availableSlots.map(slot => ({
                    ...slot,
                    datetime: new Date(slot.datetime)
                }));
            } else {
                throw new Error('Failed to fetch availability');
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
            // Fallback to local slots if API fails
            return this.generateFallbackSlots();
        }
    }
    
    generateFallbackSlots() {
        const slots = [];
        const now = new Date();
        
        // Generate slots for next 14 days (fallback)
        for (let day = 1; day <= 14; day++) {
            const date = new Date(now);
            date.setDate(now.getDate() + day);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            
            // Business hours: 9 AM - 6 PM (GMT+7)
            for (let hour = 9; hour < 18; hour++) {
                const slotTime = new Date(date);
                slotTime.setHours(hour, 0, 0, 0);
                
                slots.push({
                    id: this.generateSlotId(slotTime),
                    datetime: slotTime,
                    available: true
                });
            }
        }
        
        return slots.slice(0, 20);
    }
    
    generateSlotId(datetime) {
        return datetime.toISOString().replace(/[-:\.]/g, '').slice(0, -1);
    }
    
    async getUserMeetings(email) {
        try {
            const response = await fetch('/.netlify/functions/meeting-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'getUserMeetings',
                    userEmail: email
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.meetings.filter(m => new Date(m.datetime) > new Date());
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error getting user meetings:', error);
            return [];
        }
    }
    
    formatDateTime(datetime) {
        return datetime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    }
    
    getAvailableSlots(days = 7) {
        const now = new Date();
        const bookedSlotIds = this.bookedMeetings.map(meeting => meeting.slotId);
        
        return this.availableSlots
            .filter(slot => 
                slot.datetime > now && 
                !bookedSlotIds.includes(slot.id) &&
                slot.datetime.getDate() <= now.getDate() + days
            )
            .slice(0, 10); // Show max 10 slots
    }
    
    async bookMeeting(slotId, userEmail, userName, meetingType, notes) {
        try {
            const slot = this.availableSlots.find(s => s.id === slotId);
            if (!slot) {
                return false;
            }
            
            const duration = this.getMeetingDurationMinutes(meetingType);
            
            const response = await fetch('/.netlify/functions/meeting-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'bookMeeting',
                    slotId: slotId,
                    userEmail: userEmail,
                    userName: userName,
                    meetingType: meetingType,
                    notes: notes,
                    datetime: slot.datetime.toISOString(),
                    duration: duration
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                const meeting = {
                    id: data.meeting.id,
                    slotId,
                    datetime: slot.datetime,
                    userEmail,
                    userName,
                    type: meetingType || 'consultation',
                    notes,
                    status: data.meeting.status,
                    createdAt: new Date(),
                    meetingLink: data.meeting.meetingLink,
                    calendarEventId: data.meeting.calendarEventId
                };
                
                return meeting;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to book meeting');
            }
        } catch (error) {
            console.error('Booking error:', error);
            return false;
        }
    }
    
    cancelMeeting(meetingId) {
        const meetingIndex = this.bookedMeetings.findIndex(m => m.id === meetingId);
        if (meetingIndex === -1) return false;
        
        const meeting = this.bookedMeetings[meetingIndex];
        this.bookedMeetings.splice(meetingIndex, 1);
        this.saveBookedMeetings();
        
        return meeting;
    }
    
    getUserMeetings(email) {
        return this.bookedMeetings.filter(m => 
            m.userEmail.toLowerCase() === email.toLowerCase() && 
            m.datetime > new Date()
        );
    }
    
    sendMeetingConfirmation(meeting) {
        // Send notification email TO YOU (Tien Dat)
        const notificationSubject = `🗓️ New Meeting Request - ${meeting.userName}`;
        const notificationBody = `Hi Tien Dat,

You have a new meeting request:

👤 Name: ${meeting.userName}
📧 Email: ${meeting.userEmail}
📅 Requested Time: ${this.formatDateTime(meeting.datetime)}
⏱️ Duration: ${this.getMeetingDuration(meeting.type)}
📝 Type: ${meeting.type.replace('-', ' ').toUpperCase()}
${meeting.notes ? `📋 Notes: ${meeting.notes}` : ''}

PLEASE REPLY TO ${meeting.userEmail} TO CONFIRM OR SUGGEST ALTERNATIVE TIMES.

Meeting ID: ${meeting.id}
Booked via: Website Chatbot`;
        
        // Email to YOU first
        const notificationUrl = `mailto:tiendat0936@gmail.com?subject=${encodeURIComponent(notificationSubject)}&body=${encodeURIComponent(notificationBody)}&cc=${meeting.userEmail}`;
        
        // Also prepare confirmation email template for the visitor
        const confirmationSubject = `Meeting Request Submitted - ${this.formatDateTime(meeting.datetime)}`;
        const confirmationBody = `Hi ${meeting.userName},

Thank you for your meeting request with Tien Dat Do!

Your Request Details:
📅 Date & Time: ${this.formatDateTime(meeting.datetime)}
⏱️ Duration: ${this.getMeetingDuration(meeting.type)}
📝 Type: ${meeting.type.replace('-', ' ').toUpperCase()}
${meeting.notes ? `📋 Notes: ${meeting.notes}` : ''}

Status: PENDING CONFIRMATION

Tien Dat will reply within 24 hours to confirm this time slot or suggest alternatives.

If you need to modify your request, please reply to the confirmation email you'll receive from Tien Dat.

Best regards,
Tien Dat's AI Assistant`;
        
        // Open email client with notification to you (CC'ing the visitor)
        window.open(notificationUrl, '_blank');
        
        return { notificationSubject, notificationBody, confirmationSubject, confirmationBody };
    }
    
    async initializeAvailableSlots() {
        try {
            this.availableSlots = await this.generateAvailableSlots();
        } catch (error) {
            console.error('Failed to initialize available slots:', error);
            this.availableSlots = this.generateFallbackSlots();
        }
    }
    
    getMeetingDuration(type) {
        const durations = {
            'consultation': '30 minutes',
            'project-discussion': '45 minutes',
            'collaboration': '60 minutes'
        };
        return durations[type] || '30 minutes';
    }
    
    getMeetingDurationMinutes(type) {
        const durations = {
            'consultation': 30,
            'project-discussion': 45,
            'collaboration': 60
        };
        return durations[type] || 30;
    }
    
    async handleMeetingRequest(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check if user wants to schedule a meeting
        if (lowerMessage.includes('schedule') || lowerMessage.includes('book') || 
            lowerMessage.includes('meeting') || lowerMessage.includes('appointment')) {
            
            if (lowerMessage.includes('cancel') || lowerMessage.includes('reschedule')) {
                return await this.handleMeetingManagement(message);
            }
            
            return this.startBookingProcess();
        }
        
        // Check if user is asking about availability
        if (lowerMessage.includes('available') || lowerMessage.includes('time slot') || 
            lowerMessage.includes('when can')) {
            return this.showAvailableSlots();
        }
        
        return null;
    }
    
    startBookingProcess() {
        const availableSlots = this.getAvailableSlots();
        
        if (availableSlots.length === 0) {
            return "I don't have any available slots in the next week. Would you like me to check for slots in the following week, or would you prefer to send an email request?";
        }
        
        let response = "I'd be happy to help you schedule a meeting with Tien Dat! Here are some available time slots:\n\n";
        
        availableSlots.slice(0, 5).forEach((slot, index) => {
            response += `${index + 1}. ${this.formatDateTime(slot.datetime)}\n`;
        });
        
        response += "\nTo book a meeting, please tell me:\n";
        response += "1. Your preferred time slot (number)\n";
        response += "2. Your email address\n";
        response += "3. Your name\n";
        response += "4. Type of meeting (consultation/project-discussion/collaboration)\n\n";
        response += "For example: 'I'd like slot 2, my email is john@example.com, I'm John Smith, and I need a consultation'";
        
        return response;
    }
    
    showAvailableSlots() {
        const availableSlots = this.getAvailableSlots();
        
        if (availableSlots.length === 0) {
            return "Currently, there are no available slots in the next week. Would you like me to check further ahead or help you send an email request?";
        }
        
        let response = "Here are Tien Dat's available time slots:\n\n";
        
        availableSlots.slice(0, 8).forEach((slot, index) => {
            response += `${index + 1}. ${this.formatDateTime(slot.datetime)}\n`;
        });
        
        response += "\nWould you like to book any of these slots? Just let me know which one you prefer!";
        
        return response;
    }
    
    async processBookingDetails(message) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const email = message.match(emailRegex);
        
        const slotMatch = message.match(/slot\s*(\d+)|(\d+)(?:\.|st|nd|rd|th)/i);
        const slotNumber = slotMatch ? parseInt(slotMatch[1] || slotMatch[2]) : null;
        
        const nameMatch = message.match(/(?:i'm|name is|call me)\s+([a-zA-Z\s]+)/i) ||
                         message.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
        const name = nameMatch ? nameMatch[1].trim() : null;
        
        const meetingTypes = ['consultation', 'project-discussion', 'collaboration'];
        const meetingType = meetingTypes.find(type => 
            message.toLowerCase().includes(type) || 
            message.toLowerCase().includes(type.replace('-', ' '))
        ) || 'consultation';
        
        if (!email || !slotNumber || !name) {
            return "I need a few more details to book your meeting. Please provide:\n" +
                   `${!email ? '• Your email address\n' : ''}` +
                   `${!slotNumber ? '• Your preferred time slot number\n' : ''}` +
                   `${!name ? '• Your name\n' : ''}` +
                   "\nFor example: 'Slot 2, john@example.com, John Smith, consultation'";
        }
        
        const availableSlots = this.getAvailableSlots();
        if (slotNumber < 1 || slotNumber > availableSlots.length) {
            return `Please choose a valid slot number between 1 and ${availableSlots.length}.`;
        }
        
        const selectedSlot = availableSlots[slotNumber - 1];
        const meeting = await this.bookMeeting(
            selectedSlot.id,
            email[0],
            name,
            meetingType,
            'Booked via chatbot'
        );
        
        if (meeting) {
            let response = `🎉 Perfect! Your meeting with Tien Dat Do has been CONFIRMED!\n\n` +
                          `📅 Date & Time: ${this.formatDateTime(meeting.datetime)}\n` +
                          `⏱️ Duration: ${this.getMeetingDuration(meeting.type)}\n` +
                          `📝 Type: ${meeting.type.replace('-', ' ').toUpperCase()}\n` +
                          `✅ Status: CONFIRMED\n\n`;
            
            if (meeting.meetingLink) {
                response += `🔗 Google Meet Link: ${meeting.meetingLink}\n\n`;
            }
            
            response += `📧 Calendar invite sent to ${meeting.userEmail}\n` +
                       `⏰ You'll receive email reminders 1 day and 30 minutes before the meeting\n\n` +
                       `If you need to reschedule or cancel, just let me know!`;
            
            return response;
        } else {
            return "Sorry, that time slot is no longer available. Would you like to see updated available slots?";
        }
    }
    
    async handleMeetingManagement(message) {
        const lowerMessage = message.toLowerCase();
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const email = message.match(emailRegex);
        
        if (!email) {
            return "To manage your meetings, please provide your email address. For example: 'Cancel my meeting, my email is john@example.com'";
        }
        
        const userMeetings = await this.getUserMeetings(email[0]);
        
        if (userMeetings.length === 0) {
            return "I don't find any upcoming meetings for that email address. Would you like to schedule a new meeting?";
        }
        
        let response = "Here are your upcoming meetings:\n\n";
        userMeetings.forEach((meeting, index) => {
            response += `${index + 1}. ${this.formatDateTime(meeting.datetime)} - ${meeting.type.replace('-', ' ').toUpperCase()}\n`;
        });
        
        if (lowerMessage.includes('cancel')) {
            response += "\nTo cancel a meeting, tell me which number to cancel. For example: 'Cancel meeting 1'";
        } else if (lowerMessage.includes('reschedule')) {
            response += "\nTo reschedule, tell me which meeting number and your preferred new time. For example: 'Reschedule meeting 1 to tomorrow at 2 PM'";
        }
        
        return response;
    }
    
    isBookingInProgress(message) {
        const lowerMessage = message.toLowerCase();
        const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(message);
        const hasSlot = /slot\s*\d+|\d+(?:\.|st|nd|rd|th)/.test(lowerMessage);
        const hasName = /(i'm|name is|call me)\s+[a-zA-Z\s]+|[A-Z][a-z]+\s+[A-Z][a-z]+/.test(message);
        
        // Check recent conversation for booking context
        const recentMessages = this.conversationHistory.slice(-4);
        const hasBookingContext = recentMessages.some(msg => 
            msg.type === 'bot' && 
            (msg.message.includes('available time slots') || 
             msg.message.includes('To book a meeting') ||
             msg.message.includes('I need a few more details'))
        );
        
        return hasBookingContext && (hasEmail || hasSlot || hasName);
    }
}

// Project filtering functionality
class ProjectFilter {
    constructor() {
        this.searchInput = document.getElementById('project-search');
        this.filterTags = document.querySelectorAll('.filter-tag');
        this.projectEntries = document.querySelectorAll('.project-entry');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Search input
        this.searchInput.addEventListener('input', () => this.filterProjects());
        
        // Filter tags
        this.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                // Remove active class from all tags
                this.filterTags.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tag
                e.target.classList.add('active');
                this.filterProjects();
            });
        });
    }
    
    filterProjects() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-tag.active').dataset.filter;
        
        this.projectEntries.forEach(project => {
            const projectTags = project.dataset.tags.toLowerCase();
            const projectText = project.textContent.toLowerCase();
            
            const matchesSearch = projectText.includes(searchTerm);
            const matchesFilter = activeFilter === 'all' || projectTags.includes(activeFilter);
            
            if (matchesSearch && matchesFilter) {
                project.classList.remove('hidden');
            } else {
                project.classList.add('hidden');
            }
        });
    }
}

// Project modals functionality
class ProjectModals {
    constructor() {
        this.modalOverlay = document.getElementById('project-modal-overlay');
        this.modalBody = document.getElementById('modal-body');
        this.closeButtons = document.querySelectorAll('.modal-close');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Project modal triggers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('project-modal-trigger')) {
                e.preventDefault();
                const projectId = e.target.dataset.project;
                this.showProjectModal(projectId);
            }
        });
        
        // Close modal buttons
        this.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        // Close modal by clicking overlay
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModals();
            }
        });
        
        // Close modal with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }
    
    showProjectModal(projectId) {
        const project = PROJECT_DATA[projectId];
        if (!project) return;
        
        const modalContent = this.createProjectModalContent(project);
        this.modalBody.innerHTML = modalContent;
        this.modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    createProjectModalContent(project) {
        const featuresHTML = project.features.map(feature => 
            `<li>${feature}</li>`
        ).join('');
        
        const linksHTML = project.links.map(link => 
            `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a>`
        ).join('');
        
        const techTagsHTML = project.technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');
        
        return `
            <div class="project-modal-content">
                <h2>${project.title}</h2>
                <p>${project.description}</p>
                
                <div class="project-links">
                    ${linksHTML}
                </div>
                
                <h4>Key Features:</h4>
                <ul>
                    ${featuresHTML}
                </ul>
                
                <div class="tech-stack">
                    <h4>Technologies Used:</h4>
                    <div class="tech-tags">
                        ${techTagsHTML}
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background-color: rgba(240, 240, 240, 0.05); border-radius: 8px;">
                    <strong>Impact:</strong> ${project.impact}
                </div>
            </div>
        `;
    }
    
    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
}

// Contact form with real-time validation
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.scheduleBtn = document.getElementById('schedule-meeting');
        this.calendarModal = document.getElementById('calendar-modal');
        
        if (this.form) {
            this.initEventListeners();
        }
    }
    
    initEventListeners() {
        // Form validation on input
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearValidation(input));
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Schedule meeting button
        if (this.scheduleBtn) {
            this.scheduleBtn.addEventListener('click', () => this.openCalendar());
        }
    }
    
    validateField(field) {
        const validation = field.parentElement.querySelector('.form-validation');
        let isValid = true;
        let message = '';
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        } else if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }
        
        validation.textContent = message;
        validation.classList.toggle('show', !isValid);
        validation.classList.toggle('valid', isValid && field.value.trim());
        
        if (isValid && field.value.trim()) {
            validation.textContent = '✓';
        }
        
        return isValid;
    }
    
    clearValidation(field) {
        const validation = field.parentElement.querySelector('.form-validation');
        validation.classList.remove('show');
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (isFormValid) {
            // Here you would normally send the form data
            alert('Thank you for your message! Tien Dat will get back to you soon.');
            this.form.reset();
            
            // Clear all validations
            inputs.forEach(input => this.clearValidation(input));
        }
    }
    
    openCalendar() {
        this.calendarModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.initCalendarButtons();
    }
    
    initCalendarButtons() {
        const googleCalendarBtn = document.getElementById('google-calendar-btn');
        const emailMeetingBtn = document.getElementById('email-meeting-btn');
        const submitMeetingBtn = document.getElementById('submit-meeting-request');
        
        if (googleCalendarBtn) {
            googleCalendarBtn.addEventListener('click', () => this.openGoogleCalendar());
        }
        
        if (emailMeetingBtn) {
            emailMeetingBtn.addEventListener('click', () => this.sendEmailRequest());
        }
        
        if (submitMeetingBtn) {
            submitMeetingBtn.addEventListener('click', () => this.submitMeetingRequest());
        }
    }
    
    openGoogleCalendar() {
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + 1); // Tomorrow
        startTime.setHours(10, 0, 0, 0); // 10:00 AM
        
        const endTime = new Date(startTime);
        endTime.setHours(11, 0, 0, 0); // 11:00 AM (1 hour meeting)
        
        const eventDetails = {
            text: 'Meeting with Tien Dat Do',
            dates: this.formatGoogleCalendarDate(startTime) + '/' + this.formatGoogleCalendarDate(endTime),
            details: 'Meeting to discuss collaboration opportunities, projects, or consultations.',
            location: 'Online (Google Meet or Zoom)',
            ctz: 'Asia/Ho_Chi_Minh'
        };
        
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.text)}&dates=${eventDetails.dates}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}&ctz=${eventDetails.ctz}`;
        
        window.open(googleCalendarUrl, '_blank');
        this.calendarModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    formatGoogleCalendarDate(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    
    sendEmailRequest() {
        const subject = 'Meeting Request - Tien Dat Do';
        const body = `Hi Tien Dat,

I would like to schedule a meeting with you to discuss:
- [Please describe what you'd like to discuss]

My preferred times are:
- [Please list 2-3 time options]

Please let me know what works best for you.

Best regards,
[Your name]`;
        
        const mailtoUrl = `mailto:tiendat0936@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
        
        this.calendarModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    submitMeetingRequest() {
        const email = document.getElementById('meeting-email').value;
        const meetingType = document.getElementById('meeting-type').value;
        const notes = document.getElementById('meeting-notes').value;
        
        if (!email || !meetingType) {
            alert('Please fill in your email and select a meeting type.');
            return;
        }
        
        const duration = {
            'consultation': '30 minutes',
            'project-discussion': '45 minutes',
            'collaboration': '60 minutes'
        }[meetingType];
        
        const subject = `Meeting Request: ${meetingType.replace('-', ' ').toUpperCase()} - ${duration}`;
        const body = `Hi Tien Dat,

I would like to schedule a ${meetingType.replace('-', ' ')} meeting (${duration}) with you.

My email: ${email}

What I'd like to discuss:
${notes || 'General discussion about opportunities'}

I'm available during your business hours (Monday-Friday, 9 AM - 6 PM GMT+7). Please let me know a few time slots that work for you.

Looking forward to connecting!

Best regards`;
        
        const mailtoUrl = `mailto:tiendat0936@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
        
        // Clear form
        document.getElementById('meeting-email').value = '';
        document.getElementById('meeting-type').value = '';
        document.getElementById('meeting-notes').value = '';
        
        this.calendarModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioChatbot();
    new ProjectFilter();
    new ProjectModals();
    new ContactForm();
    
    // Add some helpful example questions
    const EXAMPLE_QUESTIONS = [
        "What is Tien Dat's professional background?",
        "What skills does he have in data analysis?",
        "Tell me about his experience with automation?",
        "What projects has he worked on?",
        "How can I contact him?"
    ];
    
    // Add placeholder rotation for engagement
    const chatbotInput = document.getElementById('chatbot-input');
    let placeholderIndex = 0;
    const placeholders = [
        "Ask me about Tien Dat's experience...",
        "What would you like to know?",
        "Ask about his skills or projects...",
        "How can I help you today?"
    ];
    
    setInterval(() => {
        if (chatbotInput && !chatbotInput.value && document.activeElement !== chatbotInput) {
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
            chatbotInput.placeholder = placeholders[placeholderIndex];
        }
    }, 3000);
    
    // Section Focus Effects
    class SectionFocusManager {
        constructor() {
            this.init();
        }
        
        init() {
            // Get all navigation links
            const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
            
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const targetId = link.getAttribute('href').substring(1);
                    this.focusSection(targetId);
                });
            });
            
            // Clear focus after 3 seconds
            this.clearFocusTimeout = null;
        }
        
        focusSection(targetId) {
            // Clear any existing timeout
            if (this.clearFocusTimeout) {
                clearTimeout(this.clearFocusTimeout);
            }
            
            // Get all sections
            const hero = document.querySelector('.hero');
            const sections = document.querySelectorAll('.content-section, .contact-section');
            const allSections = [hero, ...sections];
            
            // Remove existing classes
            allSections.forEach(section => {
                if (section) {
                    section.classList.remove('section-blur', 'section-focused');
                }
            });
            
            // Find target section
            let targetSection = null;
            if (targetId === 'home' || targetId === '') {
                targetSection = hero;
            } else {
                targetSection = document.getElementById(targetId);
            }
            
            if (targetSection) {
                // Apply blur to all other sections
                allSections.forEach(section => {
                    if (section && section !== targetSection) {
                        section.classList.add('section-blur');
                    }
                });
                
                // Focus the target section
                targetSection.classList.add('section-focused');
                
                // Clear focus after 4 seconds
                this.clearFocusTimeout = setTimeout(() => {
                    this.clearAllFocus();
                }, 4000);
            }
        }
        
        clearAllFocus() {
            const hero = document.querySelector('.hero');
            const sections = document.querySelectorAll('.content-section, .contact-section');
            const allSections = [hero, ...sections];
            
            allSections.forEach(section => {
                if (section) {
                    section.classList.remove('section-blur', 'section-focused');
                }
            });
        }
    }
    
    // Initialize section focus manager
    new SectionFocusManager();
});