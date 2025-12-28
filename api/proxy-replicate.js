module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) {
        return res.status(500).json({ error: 'Server misconfigured: Missing REPLICATE_API_TOKEN' });
    }

    // Proxy logic
    try {
        // 1. POST Request - Start Prediction
        if (req.method === 'POST') {
            const { version, input } = req.body;
            
            const response = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ version, input })
            });

            if (!response.ok) {
                const error = await response.json();
                return res.status(response.status).json({ error: error.detail || 'Replicate Error' });
            }

            const prediction = await response.json();
            return res.status(201).json(prediction);
        }
        
        // 2. GET Request - Check Status
        if (req.method === 'GET') {
            const { id } = req.query;
            
            if (!id) return res.status(400).json({ error: 'Missing prediction ID' });

            const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
                headers: {
                    "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const error = await response.json();
                return res.status(response.status).json({ error: error.detail || 'Replicate Error' });
            }

            const prediction = await response.json();
            return res.status(200).json(prediction);
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ error: error.message });
    }
};