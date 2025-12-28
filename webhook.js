// Webhook endpoint to handle Stripe events
const Stripe = require('stripe');

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers['stripe-signature'];
    let event;

    // Get raw body for signature verification
    const rawBody = await getRawBody(req);

    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Payment successful!', session);

            // Here you would typically:
            // 1. Store the subscription status in a database
            // 2. Send a confirmation email
            // For now, we'll just log it

            const planId = session.metadata.planId;
            const userEmail = session.metadata.userEmail;

            console.log(`User ${userEmail} subscribed to ${planId}`);

            // TODO: Store in database (Firebase, Supabase, etc.)
            break;

        case 'customer.subscription.deleted':
            // Handle subscription cancellation
            console.log('Subscription cancelled:', event.data.object);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
};

// Helper to get raw body
async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            resolve(data);
        });
        req.on('error', reject);
    });
}

// Disable body parsing to get raw body for signature verification
module.exports.config = {
    api: {
        bodyParser: false,
    },
};
