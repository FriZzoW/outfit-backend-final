// Simple endpoint to verify subscription status
// In production, this would query a database

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId } = req.query;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            return res.status(200).json({
                success: true,
                planId: session.metadata.planId,
                email: session.customer_email || session.metadata.userEmail
            });
        } else {
            return res.status(200).json({
                success: false,
                status: session.payment_status
            });
        }
    } catch (error) {
        console.error('Error verifying session:', error);
        return res.status(500).json({ error: error.message });
    }
};
