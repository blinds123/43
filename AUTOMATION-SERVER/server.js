/**
 * AURALO Automation Server
 * Handles payment verification automation for all browsers
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['https://auralo.store', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'automation.log' })
    ]
});

// MailSlurp integration
class MailSlurpService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.mailslurp.com';
    }
    
    async createInbox() {
        const axios = require('axios');
        
        try {
            const response = await axios.post(`${this.baseUrl}/inboxes`, {}, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                id: response.data.id,
                email: response.data.emailAddress
            };
        } catch (error) {
            logger.error('Failed to create MailSlurp inbox:', error.message);
            throw new Error('Failed to create disposable email');
        }
    }
    
    async waitForEmail(inboxId, timeout = 120000) {
        const axios = require('axios');
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            try {
                const response = await axios.get(`${this.baseUrl}/inboxes/${inboxId}/emails`, {
                    headers: { 'x-api-key': this.apiKey }
                });
                
                if (response.data.length > 0) {
                    const emailId = response.data[0].id;
                    
                    // Get email content
                    const emailResponse = await axios.get(`${this.baseUrl}/emails/${emailId}`, {
                        headers: { 'x-api-key': this.apiKey }
                    });
                    
                    const code = this.extractVerificationCode(emailResponse.data);
                    if (code) {
                        return {
                            code: code,
                            subject: emailResponse.data.subject,
                            sender: emailResponse.data.from
                        };
                    }
                }
            } catch (error) {
                logger.error('Error checking emails:', error.message);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        throw new Error('Verification email not received within timeout');
    }
    
    extractVerificationCode(email) {
        const content = email.body || '';
        const subject = email.subject || '';
        
        // Enhanced patterns for different providers
        const patterns = [
            /\b(\d{4,8})\b/g,
            /verification code[:\s]*(\d+)/gi,
            /code[:\s]*(\d+)/gi,
            /otp[:\s]*(\d+)/gi
        ];
        
        for (const pattern of patterns) {
            const matches = content.match(pattern) || subject.match(pattern);
            if (matches) {
                const code = matches[0].replace(/\D/g, '');
                if (code.length >= 4 && code.length <= 8) {
                    return code;
                }
            }
        }
        
        return null;
    }
}

// Main automation class
class PaymentAutomation {
    constructor(mailslurpApiKey) {
        this.mailslurp = new MailSlurpService(mailslurpApiKey);
    }
    
    async automateMeldVerification(sessionId, options = {}) {
        logger.info(`Starting Meld automation for session: ${sessionId}`);
        
        let browser = null;
        let disposableEmail = null;
        
        try {
            // Launch browser
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            });
            
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 720 });
            
            // Create disposable email
            logger.info('Creating disposable email...');
            const inbox = await this.mailslurp.createInbox();
            disposableEmail = inbox.email;
            
            logger.info(`Disposable email created: ${disposableEmail}`);
            
            // Navigate to Meld (or provided URL)
            const targetUrl = options.url || 'https://meldcrypto.com';
            await page.goto(targetUrl, { waitUntil: 'networkidle2' });
            
            // Find and fill email field
            logger.info('Looking for email field...');
            const emailSelectors = [
                'input[type="email"]',
                'input[name*="email"]',
                'input[placeholder*="email" i]',
                'input[id*="email"]'
            ];
            
            let emailField = null;
            for (const selector of emailSelectors) {
                try {
                    emailField = await page.$(selector);
                    if (emailField) {
                        const isVisible = await page.evaluate(el => {
                            const rect = el.getBoundingClientRect();
                            return rect.width > 0 && rect.height > 0;
                        }, emailField);
                        
                        if (isVisible) break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!emailField) {
                throw new Error('Email field not found on page');
            }
            
            // Fill email field
            logger.info('Filling email field...');
            await emailField.focus();
            await emailField.type(disposableEmail, { delay: 100 });
            
            // Submit email form
            logger.info('Submitting email form...');
            const submitSelectors = [
                'button[type="submit"]',
                'button:contains("Continue")',
                'button:contains("Next")',
                '.submit-btn'
            ];
            
            for (const selector of submitSelectors) {
                try {
                    const submitBtn = await page.$(selector);
                    if (submitBtn) {
                        await submitBtn.click();
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            // Wait for verification page
            logger.info('Waiting for verification page...');
            await page.waitForTimeout(3000);
            
            // Look for verification code field
            const codeSelectors = [
                'input[placeholder*="code" i]',
                'input[placeholder*="verification" i]',
                'input[name*="code"]',
                'input[id*="code"]'
            ];
            
            let codeField = null;
            let attempts = 0;
            
            while (!codeField && attempts < 10) {
                for (const selector of codeSelectors) {
                    try {
                        codeField = await page.$(selector);
                        if (codeField) break;
                    } catch (e) {
                        continue;
                    }
                }
                
                if (!codeField) {
                    await page.waitForTimeout(2000);
                    attempts++;
                }
            }
            
            if (!codeField) {
                throw new Error('Verification code field not found');
            }
            
            // Wait for verification email
            logger.info('Waiting for verification email...');
            const emailData = await this.mailslurp.waitForEmail(inbox.id, 120000);
            
            logger.info(`Verification code received: ${emailData.code.substr(0, 2)}***`);
            
            // Fill verification code
            await codeField.focus();
            await codeField.type(emailData.code, { delay: 150 });
            
            // Submit verification
            const verifySelectors = [
                'button[type="submit"]',
                'button:contains("Verify")',
                'button:contains("Confirm")',
                '.verify-btn'
            ];
            
            for (const selector of verifySelectors) {
                try {
                    const verifyBtn = await page.$(selector);
                    if (verifyBtn) {
                        await verifyBtn.click();
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            // Wait for completion
            await page.waitForTimeout(5000);
            
            const finalUrl = page.url();
            
            logger.info(`Automation completed successfully for session: ${sessionId}`);
            
            return {
                success: true,
                sessionId: sessionId,
                email: disposableEmail,
                verificationCode: emailData.code.substr(0, 2) + '***',
                finalUrl: finalUrl,
                completedAt: new Date().toISOString()
            };
            
        } catch (error) {
            logger.error(`Automation failed for session ${sessionId}:`, error.message);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

// Initialize automation service
const automation = new PaymentAutomation(process.env.MAILSLURP_API_KEY);

// API Routes
app.post('/api/automate', async (req, res) => {
    const { sessionId, url, orderDetails } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: 'Session ID is required'
        });
    }
    
    try {
        logger.info(`Automation request received for session: ${sessionId}`);
        
        const result = await automation.automateMeldVerification(sessionId, {
            url: url,
            orderDetails: orderDetails
        });
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        logger.error(`Automation failed:`, error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            sessionId: sessionId
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Status endpoint
app.get('/api/status/:sessionId', (req, res) => {
    // In production, this would check session status from database
    res.json({
        sessionId: req.params.sessionId,
        status: 'processing',
        message: 'Automation in progress'
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`AURALO Automation Server running on port ${PORT}`);
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;