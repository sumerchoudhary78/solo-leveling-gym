'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GymPlanService } from '@/lib/services/gymPlanService';
import SystemMessage from '@/app/components/ui/SystemMessage';

export default function CreateGymPlanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemMessage, setSystemMessage] = useState('');

  // Form state
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('beginner');
  const [goals, setGoals] = useState([]);
  const [intensity, setIntensity] = useState('moderate');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [minutesPerSession, setMinutesPerSession] = useState(60);
  const [equipmentAccess, setEquipmentAccess] = useState('gym');
  const [healthConditions, setHealthConditions] = useState('');
  const [preferences, setPreferences] = useState('');

  const gymPlanService = new GymPlanService();

  // Available goals
  const availableGoals = [
    'Weight Loss',
    'Muscle Gain',
    'Strength',
    'Endurance',
    'General Fitness',
    'Athletic Performance',
  ];

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleGoalToggle = (goal) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (goals.length === 0) {
      setError('Please select at least one goal');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare plan data
      const planData = {
        age: age ? parseInt(age) : null,
        sex,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        fitnessLevel,
        goals,
        intensity,
        daysPerWeek,
        minutesPerSession,
        equipmentAccess,
        healthConditions: healthConditions ? healthConditions.split(',').map(item => item.trim()) : [],
        preferences: preferences ? preferences.split(',').map(item => item.trim()) : [],
      };

      // Generate the plan
      showSystemMessage('Generating your personalized plan...');

      let generatedPlan;
      try {
        generatedPlan = await gymPlanService.generatePlan(planData);
      } catch (planError) {
        console.error('Error generating plan:', planError);
        showSystemMessage('Using fallback plan generator due to API limitations.');

        // Create a simple fallback plan if the API fails
        generatedPlan = `# Personalized Workout Plan

## Overview
This ${fitnessLevel} level workout plan is designed for ${intensity} intensity training ${daysPerWeek} days per week.

## Weekly Schedule
${daysPerWeek === 3 ? '- Monday: Full Body Workout\n- Wednesday: Full Body Workout\n- Friday: Full Body Workout' :
  daysPerWeek === 4 ? '- Monday: Upper Body\n- Tuesday: Lower Body\n- Thursday: Upper Body\n- Friday: Lower Body' :
  '- Monday: Push\n- Tuesday: Pull\n- Wednesday: Legs\n- Thursday: Rest\n- Friday: Push\n- Saturday: Pull\n- Sunday: Legs'}

## Warm-up (5-10 minutes)
- Light cardio
- Dynamic stretching

## Cool-down (5-10 minutes)
- Static stretching
- Deep breathing

## Progression Guidelines
- Increase weight when you can complete all sets with good form
- Add 1-2 reps per set each week

## Nutrition Tips
- Stay hydrated
- Consume protein after workouts
- Focus on whole foods`;
      }

      // Save the plan with the generated content
      planData.generatedPlan = generatedPlan;
      const planId = await gymPlanService.savePlan(user.uid, planData);

      // Navigate to the plan view page
      router.push(`/gym-plan/${planId}`);
    } catch (err) {
      console.error('Error creating gym plan:', err);
      setError('Failed to create your gym plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showSystemMessage = (message, duration = 5000) => {
    setSystemMessage(message);
    setTimeout(() => setSystemMessage(''), duration);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#101827] text-gray-100 font-sans p-4 sm:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101827] text-gray-100 font-sans p-4 sm:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 sm:mb-10 flex-wrap gap-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-300 tracking-wide">
          Create Personalized Gym Plan
        </h1>
        <Link href="/gym-plan" className="text-sm text-blue-400 hover:underline">
          Back to Gym Plans
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-[#1f2a40] to-[#1a2335] rounded-lg shadow-lg overflow-hidden border border-blue-500/20 p-6">
          <form onSubmit={handleSubmit}>
            {/* Introduction */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-2">Personalized Gym Plan</h2>
              <p className="text-gray-300">
                Answer the questions below to create a personalized gym plan tailored to your goals and preferences.
              </p>
            </div>

            {/* Basic Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-blue-300 mb-4 border-b border-blue-500/30 pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">
                    Age (optional)
                  </label>
                  <input
                    type="number"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                  />
                </div>

                {/* Sex */}
                <div>
                  <label htmlFor="sex" className="block text-sm font-medium text-gray-300 mb-1">
                    Sex (optional)
                  </label>
                  <select
                    id="sex"
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Height */}
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">
                    Height in cm (optional)
                  </label>
                  <input
                    type="number"
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your height"
                    min="1"
                    max="300"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">
                    Weight in kg (optional)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your weight"
                    min="1"
                    max="500"
                  />
                </div>
              </div>
            </div>

            {/* Fitness Profile Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-blue-300 mb-4 border-b border-blue-500/30 pb-2">
                Fitness Profile
              </h3>

              {/* Fitness Level */}
              <div className="mb-4">
                <label htmlFor="fitnessLevel" className="block text-sm font-medium text-gray-300 mb-1">
                  Current Fitness Level
                </label>
                <select
                  id="fitnessLevel"
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value)}
                  className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner (Little to no recent exercise experience)</option>
                  <option value="intermediate">Intermediate (Consistent exercise for 6+ months)</option>
                  <option value="advanced">Advanced (Consistent, structured training for years)</option>
                </select>
              </div>

              {/* Goals */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goals (select at least one)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableGoals.map((goal) => (
                    <div key={goal} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`goal-${goal}`}
                        checked={goals.includes(goal)}
                        onChange={() => handleGoalToggle(goal)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`goal-${goal}`} className="ml-2 block text-sm text-gray-300">
                        {goal}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div className="mb-4">
                <label htmlFor="intensity" className="block text-sm font-medium text-gray-300 mb-1">
                  Desired Intensity
                </label>
                <select
                  id="intensity"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low (Gentle workouts, focus on movement and consistency)</option>
                  <option value="moderate">Moderate (Challenging but sustainable, aiming for noticeable effort)</option>
                  <option value="high">High (Pushing close to your limits, very demanding workouts)</option>
                </select>
              </div>
            </div>

            {/* Time & Equipment Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-blue-300 mb-4 border-b border-blue-500/30 pb-2">
                Time & Equipment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Days Per Week */}
                <div>
                  <label htmlFor="daysPerWeek" className="block text-sm font-medium text-gray-300 mb-1">
                    Days Per Week
                  </label>
                  <select
                    id="daysPerWeek"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
                    className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <option key={day} value={day}>
                        {day} {day === 1 ? 'day' : 'days'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minutes Per Session */}
                <div>
                  <label htmlFor="minutesPerSession" className="block text-sm font-medium text-gray-300 mb-1">
                    Minutes Per Session
                  </label>
                  <select
                    id="minutesPerSession"
                    value={minutesPerSession}
                    onChange={(e) => setMinutesPerSession(parseInt(e.target.value))}
                    className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[15, 30, 45, 60, 75, 90, 120].map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} minutes
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Equipment Access */}
              <div>
                <label htmlFor="equipmentAccess" className="block text-sm font-medium text-gray-300 mb-1">
                  Available Equipment
                </label>
                <select
                  id="equipmentAccess"
                  value={equipmentAccess}
                  onChange={(e) => setEquipmentAccess(e.target.value)}
                  className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gym">Full Gym (Access to machines, free weights, etc.)</option>
                  <option value="limited">Limited Equipment (Some dumbbells, resistance bands, etc.)</option>
                  <option value="bodyweight">Bodyweight Only (No equipment)</option>
                </select>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-blue-300 mb-4 border-b border-blue-500/30 pb-2">
                Additional Information (Optional)
              </h3>

              {/* Health Conditions */}
              <div className="mb-4">
                <label htmlFor="healthConditions" className="block text-sm font-medium text-gray-300 mb-1">
                  Health Conditions or Injuries
                </label>
                <textarea
                  id="healthConditions"
                  value={healthConditions}
                  onChange={(e) => setHealthConditions(e.target.value)}
                  className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List any injuries or health conditions, separated by commas"
                  rows="2"
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">
                  E.g., knee injury, lower back pain, asthma
                </p>
              </div>

              {/* Preferences */}
              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-300 mb-1">
                  Exercise Preferences
                </label>
                <textarea
                  id="preferences"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="w-full bg-[#1a2335] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List exercises you enjoy or dislike, separated by commas"
                  rows="2"
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">
                  E.g., enjoy running, dislike burpees, prefer machines over free weights
                </p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-md font-medium text-white transition-colors ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Plan...
                  </span>
                ) : (
                  'Generate My Plan'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* System Message */}
      <SystemMessage message={systemMessage} />
    </div>
  );
}
