class PortfolioChatbot {
    constructor() {
        this.chatbotToggle = document.getElementById('chatbot-toggle');
        this.chatbotContainer = document.getElementById('chatbot-container');
        this.chatbotClose = document.getElementById('chatbot-close');
        this.chatbotMessages = document.getElementById('chatbot-messages');
        this.chatbotInput = document.getElementById('chatbot-input');
        this.chatbotSend = document.getElementById('chatbot-send');
        
        this.isOpen = false;
        this.isLoading = false;
        
        this.initEventListeners();
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
        this.chatbotInput.value = '';
        this.chatbotInput.style.height = 'auto';
        
        // Show loading state
        this.setLoading(true);
        const typingIndicator = this.addTypingIndicator();
        
        try {
            // Send message to Claude API
            const response = await fetch('/api/chat', {
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
    
    addTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
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
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioChatbot();
});

// Add some helpful example questions
const EXAMPLE_QUESTIONS = [
    "What is Tien Dat's professional background?",
    "What skills does he have in data analysis?",
    "Tell me about his experience with automation?",
    "What projects has he worked on?",
    "How can I contact him?"
];

// Add click-to-ask functionality for mobile users
document.addEventListener('DOMContentLoaded', () => {
    const chatbotInput = document.getElementById('chatbot-input');
    
    // Add placeholder rotation for engagement
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
});