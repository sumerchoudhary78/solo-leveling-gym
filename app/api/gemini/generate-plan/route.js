// app/api/gemini/generate-plan/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAuthToken } from '@/lib/firebase/auth';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || 'dummy-key');

/**
 * Generate a mock workout plan when the Gemini API is not available
 * @param {string} prompt - The prompt containing plan requirements
 * @returns {string} - A mock workout plan
 */
function generateMockWorkoutPlan(prompt) {
  // Extract some basic info from the prompt to personalize the mock plan
  const fitnessLevel = prompt.includes('Fitness Level: beginner') ? 'beginner' :
                      prompt.includes('Fitness Level: intermediate') ? 'intermediate' : 'advanced';

  const intensity = prompt.includes('Intensity: low') ? 'low' :
                   prompt.includes('Intensity: high') ? 'high' : 'moderate';

  const daysPerWeek = prompt.match(/Days Per Week: (\d+)/) ?
                     parseInt(prompt.match(/Days Per Week: (\d+)/)[1]) : 3;

  const equipment = prompt.includes('Equipment Access: gym') ? 'full gym' :
                   prompt.includes('Equipment Access: limited') ? 'limited equipment' : 'bodyweight only';

  // Create a personalized mock plan
  return `# Personalized Workout Plan

## Overview
This ${fitnessLevel} level workout plan is designed for ${intensity} intensity training ${daysPerWeek} days per week with ${equipment}.

## Weekly Schedule

${createWeeklySchedule(daysPerWeek, fitnessLevel, equipment)}

## Warm-up (5-10 minutes before each workout)
- 5 minutes of light cardio (jogging in place, jumping jacks, etc.)
- Dynamic stretching for major muscle groups
- 10 arm circles each direction
- 10 bodyweight squats
- 10 walking lunges

## Cool-down (5-10 minutes after each workout)
- Static stretching for all major muscle groups
- Deep breathing exercises
- 5 minutes of light walking

## Progression Guidelines
- Increase weight by 5-10% when you can complete all sets and reps with good form
- Add 1-2 reps per set each week until reaching the upper rep range
- Rest 60-90 seconds between sets (${fitnessLevel === 'beginner' ? 'longer' : 'shorter'} for ${fitnessLevel} level)

## Nutrition Tips
- Stay hydrated throughout the day
- Consume protein within 30 minutes after your workout
- Focus on whole foods and limit processed foods
- Adjust calorie intake based on your specific goals

## Notes
- Listen to your body and rest when needed
- Proper form is more important than lifting heavy weights
- Consistency is key to seeing results
- Consider working with a certified personal trainer for form checks`;
}

/**
 * Create a weekly schedule based on days per week, fitness level, and equipment
 * @param {number} daysPerWeek - Number of workout days per week
 * @param {string} fitnessLevel - Fitness level (beginner, intermediate, advanced)
 * @param {string} equipment - Available equipment
 * @returns {string} - Weekly schedule in markdown format
 */
function createWeeklySchedule(daysPerWeek, fitnessLevel, equipment) {
  const workoutTypes = {
    fullBody: '**Full Body Workout**',
    upperBody: '**Upper Body Workout**',
    lowerBody: '**Lower Body Workout**',
    push: '**Push Workout** (Chest, Shoulders, Triceps)',
    pull: '**Pull Workout** (Back, Biceps)',
    legs: '**Legs Workout** (Quads, Hamstrings, Calves)',
    cardio: '**Cardio & Core**',
    rest: '**Rest Day** (Active recovery, light walking, or yoga recommended)'
  };

  let schedule = '';

  // Create schedule based on days per week
  if (daysPerWeek <= 3) {
    // Full body or upper/lower split for fewer days
    const workouts = [
      workoutTypes.fullBody,
      workoutTypes.rest,
      workoutTypes.fullBody,
      workoutTypes.rest,
      workoutTypes.fullBody,
      workoutTypes.rest,
      workoutTypes.rest
    ];

    for (let i = 0; i < 7; i++) {
      const day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i];
      schedule += `### ${day}\n${workouts[i]}\n\n`;
    }
  } else if (daysPerWeek <= 5) {
    // Push/Pull/Legs split for more days
    const workouts = [
      workoutTypes.push,
      workoutTypes.pull,
      workoutTypes.legs,
      workoutTypes.rest,
      workoutTypes.push,
      workoutTypes.pull,
      workoutTypes.rest
    ];

    for (let i = 0; i < 7; i++) {
      const day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i];
      schedule += `### ${day}\n${workouts[i]}\n\n`;
    }
  } else {
    // 6-day PPL split
    const workouts = [
      workoutTypes.push,
      workoutTypes.pull,
      workoutTypes.legs,
      workoutTypes.push,
      workoutTypes.pull,
      workoutTypes.legs,
      workoutTypes.rest
    ];

    for (let i = 0; i < 7; i++) {
      const day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i];
      schedule += `### ${day}\n${workouts[i]}\n\n`;
    }
  }

  return schedule;
}


// Get the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request) {
  try {
    // Get the request body
    const { prompt } = await request.json();

    // Verify authentication (optional for development)
    const authHeader = request.headers.get('Authorization');
    let isAuthenticated = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const userData = await verifyAuthToken(token);
      isAuthenticated = !!userData;
    }

    // In production, you would uncomment this to require authentication
    // if (!isAuthenticated) {
    //   return new Response(JSON.stringify({
    //     error: 'Unauthorized'
    //   }), {
    //     headers: { 'Content-Type': 'application/json' },
    //     status: 401,
    //   });
    // }

    if (!prompt) {
      return new Response(JSON.stringify({
        error: 'Missing prompt parameter'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    let plan;

    try {
      // Try to generate content using Google's Generative AI
      if (process.env.GOOGLE_GENAI_API_KEY) {
        const result = await model.generateContent(prompt);
        plan = result.response.text();
      } else {
        // If no API key is available, use a mock response
        console.warn('No Gemini API key found. Using mock response.');
        plan = generateMockWorkoutPlan(prompt);
      }
    } catch (error) {
      console.warn('Error generating content with Gemini API:', error);
      // Fallback to mock response
      plan = generateMockWorkoutPlan(prompt);
    }

    return new Response(JSON.stringify({ plan }), {
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
