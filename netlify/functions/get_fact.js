const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // 1. Get the API Key securely from Netlify Environment Variables
    const API_KEY = AIzaSyA2BAwrVD6O1Y_LpfFLWsiswtmww5IWLb4;

    // 2. Parse the incoming data from the website
    // We wrap this in a try/catch in case the request body is empty
    let city, lat, lng;
    try {
        const body = JSON.parse(event.body);
        city = body.city;
        lat = body.lat;
        lng = body.lng;
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid Request Body" }) };
    }

    // 3. The Prompt for Gemini 2.0 Flash
    const prompt = `
        I am a user exploring a 3D globe. I just clicked on a location: 
        Name: ${city}
        Coordinates: ${lat}, ${lng}.
        
        Please generate 3 interesting, fun, or surprising trivia facts about this specific location.
        
        Rules:
        1. Keep each fact under 30 words.
        2. Format the output as a strict JSON array of objects. 
        3. Each object must have two properties: 
           - "text": The fact string.
           - "source_term": A short search term to verify this fact (e.g. "Eiffel Tower height").
        
        Example Output:
        [
            {"text": "The Eiffel Tower grows in summer.", "source_term": "Eiffel Tower thermal expansion"},
            {"text": "Fact 2 text here.", "source_term": "Fact 2 search term"}
        ]
        
        Do not include markdown formatting like \`\`\`json. Just the raw array.
    `;

    // 4. API Configuration
    // Note: using gemini-2.0-flash-exp (or whichever alias is active for 2.0)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${AIzaSyA2BAwrVD6O1Y_LpfFLWsiswtmww5IWLb4}`;

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
        
        // Pass the data back to your frontend
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to reach Google AI server" })
        };
    }
};