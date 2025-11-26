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
        // Default to English if undefined
        language = body.language || "English";
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    // PROMPT
    const prompt = `
        I am a user exploring a 3D globe. I just clicked on a location: 
        Name: ${city}
        Coordinates: ${lat}, ${lng}.
        
        Generate 1 unique, detailed, and interesting trivia fact about this location.
        
        CRITICAL INSTRUCTION:
        You MUST write the response in this language: ${language}.
        
        Rules:
        1. Length: Write a detailed paragraph (approx 50-80 words).
        2. Tone: Educational but engaging.
        3. Format: Return a strictly valid JSON object.
        
        JSON Structure:
        {
           "text": "(The detailed fact text in ${language})",
           "source_term": "(A short English search term to verify this fact)"
        }
        
        Do not include markdown formatting like \`\`\`json.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

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