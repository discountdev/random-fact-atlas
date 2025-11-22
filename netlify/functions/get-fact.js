// netlify/functions/get-fact.js

exports.handler = async function(event, context) {
    // 1. Get Key
    const API_KEY = process.env.GEMINI_API_KEY;
    
    // Security Check: Did the key load?
    if (!API_KEY) {
        console.error("Error: API Key is missing in Environment Variables.");
        return { statusCode: 500, body: JSON.stringify({ error: "Server Configuration Error" }) };
    }

    // 2. Parse Input
    let city, lat, lng;
    try {
        const body = JSON.parse(event.body);
        city = body.city;
        lat = body.lat;
        lng = body.lng;
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON input" }) };
    }

    // 3. The Prompt
    const prompt = `
        I am a user exploring a 3D globe. I just clicked on a location: 
        Name: ${city}
        Coordinates: ${lat}, ${lng}.
        Generate 3 interesting trivia facts about this location.
        Rules:
        1. Keep each fact under 30 words.
        2. Format output as a JSON array of objects with 'text' and 'source_term'.
        Example: [{"text": "Fact...", "source_term": "Search..."}]
        Do not include markdown.
    `;

    // 4. API Call (Using Native Fetch - No 'require' needed)
    // Switching to the stable 1.5 Flash model to ensure reliability
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            console.error(`Google API Error: ${response.status} ${response.statusText}`);
            return { statusCode: response.status, body: JSON.stringify({ error: "Google API Error" }) };
        }

        const data = await response.json();
        return { statusCode: 200, body: JSON.stringify(data) };

    } catch (error) {
        console.error("Function Crash:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};