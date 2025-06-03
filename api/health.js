export default function handler(req, res) {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        mailslurp: process.env.MAILSLURP_API_KEY ? 'configured' : 'missing'
    });
}