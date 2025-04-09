'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GymPlanService } from '@/lib/services/gymPlanService';
import StatCard from '@/app/components/dashboard/StatCard';
import SystemMessage from '@/app/components/ui/SystemMessage';

export default function GymPlanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [latestPlan, setLatestPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemMessage, setSystemMessage] = useState('');

  const gymPlanService = new GymPlanService();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load the latest plan
  useEffect(() => {
    if (user) {
      loadLatestPlan();
    }
  }, [user]);

  const loadLatestPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const plan = await gymPlanService.getLatestPlan(user.uid);
      setLatestPlan(plan);
    } catch (err) {
      console.error('Error loading latest plan:', err);
      setError('Failed to load your latest gym plan. Please try again.');
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
          Personalized Gym Plan
        </h1>
        <Link href="/" className="text-sm text-blue-400 hover:underline">
          Back to Dashboard
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
              onClick={loadLatestPlan}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : latestPlan ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Latest Plan Card */}
            <div className="bg-gradient-to-br from-[#1f2a40] to-[#1a2335] rounded-lg shadow-lg overflow-hidden border border-blue-500/20">
              <div className="bg-gradient-to-r from-[#2a3a5a] to-[#344467] p-4">
                <h2 className="text-xl font-bold text-white">Your Latest Plan</h2>
                <p className="text-sm text-gray-300">
                  Created on {new Date(latestPlan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="p-6">
                {/* Plan Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard title="Fitness Level" value={latestPlan.fitnessLevel} />
                  <StatCard title="Intensity" value={latestPlan.intensity} />
                  <StatCard title="Days Per Week" value={latestPlan.daysPerWeek} />
                </div>

                {/* Goals */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Goals</h3>
                  <div className="flex flex-wrap gap-2">
                    {latestPlan.goals.map((goal, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>

                {/* View Full Plan Button */}
                <div className="flex justify-center mt-4">
                  <Link
                    href={`/gym-plan/${latestPlan.id}`}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition-colors"
                  >
                    View Full Plan
                  </Link>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-gradient-to-br from-[#1f2a40] to-[#1a2335] rounded-lg shadow-lg overflow-hidden border border-blue-500/20">
              <div className="bg-gradient-to-r from-[#2a3a5a] to-[#344467] p-4">
                <h2 className="text-xl font-bold text-white">Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  href="/gym-plan/create"
                  className="flex items-center p-4 bg-[#1a2335] hover:bg-[#243552] rounded-lg transition-colors border border-blue-500/20"
                >
                  <div className="bg-blue-600 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-300">Create New Plan</h3>
                    <p className="text-sm text-gray-400">Generate a new personalized workout plan</p>
                  </div>
                </Link>
                <Link
                  href="/gym-plan/history"
                  className="flex items-center p-4 bg-[#1a2335] hover:bg-[#243552] rounded-lg transition-colors border border-blue-500/20"
                >
                  <div className="bg-purple-600 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-300">View Plan History</h3>
                    <p className="text-sm text-gray-400">See all your previous workout plans</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-blue-600/20 rounded-full p-4 inline-block mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Gym Plan Yet</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your first personalized gym plan tailored to your goals and preferences.
            </p>
            <Link
              href="/gym-plan/create"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition-colors"
            >
              Create Your Plan
            </Link>
          </div>
        )}
      </main>

      {/* System Message */}
      <SystemMessage message={systemMessage} />
    </div>
  );
}
