'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GymPlanService } from '@/lib/services/gymPlanService';
import SystemMessage from '@/app/components/ui/SystemMessage';
import StatCard from '@/app/components/dashboard/StatCard';
import { doc, collection, addDoc, serverTimestamp } from '@firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function ViewGymPlanPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const { planId } = unwrappedParams;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemMessage, setSystemMessage] = useState('');
  const [creatingQuest, setCreatingQuest] = useState(false);

  const gymPlanService = new GymPlanService();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load the plan
  useEffect(() => {
    if (user && planId) {
      loadPlan();
    }
  }, [user, planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const planData = await gymPlanService.getPlan(user.uid, planId);

      if (!planData) {
        setError('Plan not found. It may have been deleted or you may not have permission to view it.');
        return;
      }

      setPlan({ id: planId, ...planData });
    } catch (err) {
      console.error('Error loading plan:', err);
      setError('Failed to load the gym plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createQuest = async () => {
    if (!plan || creatingQuest) return;

    try {
      setCreatingQuest(true);
      showSystemMessage('Creating quest...');

      // Create a quest based on the gym plan
      const questsRef = collection(db, 'quests');
      await addDoc(questsRef, {
        title: 'Complete Your Personalized Gym Plan',
        description: 'Follow your personalized gym plan for one week to earn experience and level up!',
        type: 'workout',
        difficulty: plan.intensity === 'high' ? 'hard' : (plan.intensity === 'low' ? 'easy' : 'normal'),
        experienceReward: plan.intensity === 'high' ? 300 : (plan.intensity === 'low' ? 100 : 200),
        requirements: {
          workoutDays: plan.daysPerWeek,
          minutesPerSession: plan.minutesPerSession,
        },
        planId: plan.id,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        isCustom: true,
      });

      showSystemMessage('Quest created successfully! Check your quest log to track progress.', 5000);
    } catch (err) {
      console.error('Error creating quest:', err);
      showSystemMessage('Failed to create quest. Please try again.', 5000);
    } finally {
      setCreatingQuest(false);
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
          Your Gym Plan
        </h1>
        <Link href="/gym-plan" className="text-sm text-blue-400 hover:underline">
          Back to Gym Plans
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={loadPlan}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : plan ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Plan Details Card */}
            <div className="bg-gradient-to-br from-[#1f2a40] to-[#1a2335] rounded-lg shadow-lg overflow-hidden border border-blue-500/20">
              <div className="bg-gradient-to-r from-[#2a3a5a] to-[#344467] p-4">
                <h2 className="text-xl font-bold text-white">Plan Details</h2>
                <p className="text-sm text-gray-300">
                  Created on {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="p-6">
                {/* Plan Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard title="Fitness Level" value={plan.fitnessLevel} />
                  <StatCard title="Intensity" value={plan.intensity} />
                  <StatCard title="Days Per Week" value={plan.daysPerWeek} />
                </div>

                {/* Goals */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Goals</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.goals.map((goal, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Equipment</h3>
                  <p className="text-gray-300">
                    {plan.equipmentAccess === 'gym'
                      ? 'Full Gym (Access to machines, free weights, etc.)'
                      : plan.equipmentAccess === 'limited'
                      ? 'Limited Equipment (Some dumbbells, resistance bands, etc.)'
                      : 'Bodyweight Only (No equipment)'}
                  </p>
                </div>

                {/* Additional Info */}
                {(plan.healthConditions.length > 0 || plan.preferences.length > 0) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Additional Information</h3>

                    {plan.healthConditions.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-400">Health Conditions:</h4>
                        <p className="text-gray-300">{plan.healthConditions.join(', ')}</p>
                      </div>
                    )}

                    {plan.preferences.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Preferences:</h4>
                        <p className="text-gray-300">{plan.preferences.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Create Quest Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={createQuest}
                    disabled={creatingQuest}
                    className={`px-6 py-3 rounded-md font-medium text-white transition-colors ${
                      creatingQuest
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {creatingQuest ? 'Creating Quest...' : 'Create Quest From This Plan'}
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Plan Card */}
            <div className="bg-gradient-to-br from-[#1f2a40] to-[#1a2335] rounded-lg shadow-lg overflow-hidden border border-blue-500/20">
              <div className="bg-gradient-to-r from-[#2a3a5a] to-[#344467] p-4">
                <h2 className="text-xl font-bold text-white">Your Personalized Plan</h2>
              </div>
              <div className="p-6">
                {plan.generatedPlan ? (
                  <div className="prose prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: markdownToHtml(plan.generatedPlan) }} />
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No plan content available. Try creating a new plan.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-2">Plan Not Found</h2>
            <p className="text-gray-400 mb-6">
              The requested plan could not be found or you don't have permission to view it.
            </p>
            <Link
              href="/gym-plan"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition-colors"
            >
              Back to Gym Plans
            </Link>
          </div>
        )}
      </main>

      {/* System Message */}
      <SystemMessage message={systemMessage} />
    </div>
  );
}

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
  if (!markdown) return '';

  // Convert headers
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert lists
  html = html
    .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/^(\d+)\. (.*$)/gim, '<ol><li>$2</li></ol>');

  // Fix lists (combine consecutive list items)
  html = html
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/<\/ol>\s*<ol>/g, '');

  // Convert bold and italic
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\_\_(.*?)\_\_/g, '<strong>$1</strong>')
    .replace(/\_(.*?)\_/g, '<em>$1</em>');

  // Convert paragraphs (lines that are not headers or lists)
  html = html.replace(/^(?!<h|<ul|<ol)(.+)$/gim, '<p>$1</p>');

  // Convert line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
}
