// netlify/functions/get-fact.js

exports.handler = async function(event, context) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: "Server Configuration Error" }) };
    }

    let city, lat, lng, language;
    try {
        const body = JSON.parse(event.body);
        city = body.city;
        lat = body.lat;
        lng = body.lng;
        // Default to English if no language is sent
        language = body.language || "English";
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    // UPDATED PROMPT: Requesting ONE detailed fact in the specific language
    const prompt = `
        I am a user exploring a 3D globe. I just clicked on a location: 
        Name: ${city}
        Coordinates: ${lat}, ${lng}.
        
        Generate 1 unique, detailed, and interesting trivia fact about this location.
        
        Rules:
        1. Language: Write the fact in ${language}.
        2. Length: Write a detailed paragraph (approx 50-80 words).
        3. Tone: Educational but engaging.
        4. Format: Return a strictly valid JSON object (NOT a list, just one object).
        
        JSON Structure:
        {
           "text": "The detailed fact text...",
           "source_term": "A short search term to verify this fact"
        }
        
        Do not include markdown formatting like \`\`\`json.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            return { statusCode: response.status, body: JSON.stringify({ error: "Google API Error" }) };
        }

        const data = await response.json();
        return { statusCode: 200, body: JSON.stringify(data) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};