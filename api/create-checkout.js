// API endpoint to create a Stripe Checkout Session
const Stripe = require('stripe');

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { planId, userEmail } = req.body;

    // Define plans (One-Time Payments / Mode Ponctuel)
    const PLANS = {
        tier1: {
            name: 'Basic',
            priceId: process.env.STRIPE_PRICE_TIER1, // 2.99€
            mode: 'payment'
        },
        tier2: {
            name: 'Pro',
            priceId: process.env.STRIPE_PRICE_TIER2, // 5.99€
            mode: 'payment'
        },
        lifetime: {
            name: 'Illimité',
            priceId: process.env.STRIPE_PRICE_LIFETIME, // 6.99€
            mode: 'payment'
        }
    };

    const plan = PLANS[planId];
    if (!plan) {
        return res.status(400).json({ error: 'Invalid plan' });
    }

    try {
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price: plan.priceId,
                    quantity: 1,
                },
            ],
            mode: plan.mode, // 'payment' implies one-time
            success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
            cancel_url: process.env.CANCEL_URL,
            metadata: {
                planId: planId,
                userEmail: userEmail || 'anonymous'
            }
        };

        // Add customer email if provided
        if (userEmail) {
            sessionConfig.customer_email = userEmail;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.status(200).json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
};
