// app/api/gemini/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

// Get the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request) {
  try {
    const { query, username } = await request.json();

    if (!query) {
      return new Response(JSON.stringify({ 
        error: 'Missing query parameter' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Generate content using Google's Generative AI
    const result = await model.generateContent(query);
    let response = result.response.text();

    // If a username is provided, prefix the response with a mention to that user
    if (username) {
      response = `@${username} ${response}`;
    }

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to process request',
      message: error.message || 'An unexpected error occurred.'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}