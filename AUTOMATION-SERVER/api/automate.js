import fetch from 'node-fetch';

// MailSlurp API configuration
const MAILSLURP_API_KEY = process.env.MAILSLURP_API_KEY;
const MAILSLURP_API_URL = 'https://api.mailslurp.com';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId, targetUrl, email } = req.body;

    if (!sessionId) {
        return res.status(400).json({ 
            error: 'Missing required parameter: sessionId',
            required: ['sessionId']
        });
    }

    if (!MAILSLURP_API_KEY) {
        return res.status(500).json({ 
            error: 'MailSlurp API key not configured',
            message: 'Please add MAILSLURP_API_KEY to environment variables'
        });
    }

    try {
        console.log(`Starting automation for session: ${sessionId}`);
        
        // Create disposable email if not provided
        let disposableEmail = email;
        if (!disposableEmail) {
            disposableEmail = await createDisposableEmail(sessionId);
            console.log(`Created disposable email: ${disposableEmail}`);
        }

        // For now, return success with the created email
        // Full browser automation would be added here when needed
        return res.status(200).json({
            success: true,
            sessionId,
            email: disposableEmail,
            message: 'Email created successfully',
            note: 'Full automation coming soon'
        });

    } catch (error) {
        console.error('Automation error:', error);
        return res.status(500).json({
            error: 'Automation failed',
            message: error.message,
            sessionId
        });
    }
}

// Helper function to create disposable email
async function createDisposableEmail(sessionId) {
    const response = await fetch(`${MAILSLURP_API_URL}/inboxes`, {
        method: 'POST',
        headers: {
            'x-api-key': MAILSLURP_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: `auralo-${sessionId}`,
            description: 'AURALO payment automation'
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`MailSlurp API error: ${response.status} - ${error}`);
    }

    const inbox = await response.json();
    return inbox.emailAddress;
}