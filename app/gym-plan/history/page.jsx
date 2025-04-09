'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GymPlanService } from '@/lib/services/gymPlanService';
import SystemMessage from '@/app/components/ui/SystemMessage';

export default function GymPlanHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
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

  // Load all plans
  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const plansData = await gymPlanService.getAllPlans(user.uid);
      setPlans(plansData);
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Failed to load your gym plans. Please try again.');
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
          Your Gym Plan History
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
              onClick={loadPlans}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : plans.length > 0 ? (
          <div className="space-y-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-gradient-to-br from-[#1f2a40] to-[#1a2335] rounded-lg shadow-lg overflow-hidden border border-blue-500/20 transition-all duration-300 hover:shadow-blue-500/30 hover:scale-[1.01]"
              >
                <div className="bg-gradient-to-r from-[#2a3a5a] to-[#344467] p-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {plan.fitnessLevel.charAt(0).toUpperCase() + plan.fitnessLevel.slice(1)} Plan
                    </h2>
                    <p className="text-sm text-gray-300">
                      Created on {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${
                    plan.intensity === 'high'
                      ? 'bg-red-900/30 text-red-300'
                      : plan.intensity === 'moderate'
                      ? 'bg-yellow-900/30 text-yellow-300'
                      : 'bg-green-900/30 text-green-300'
                  }`}>
                    {plan.intensity.charAt(0).toUpperCase() + plan.intensity.slice(1)} Intensity
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {plan.goals.map((goal, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded-full text-xs"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-4">
                    <div className="bg-[#1a2335] p-2 rounded">
                      <span className="text-gray-400">Days/Week:</span>{' '}
                      <span className="text-white">{plan.daysPerWeek}</span>
                    </div>
                    <div className="bg-[#1a2335] p-2 rounded">
                      <span className="text-gray-400">Minutes/Session:</span>{' '}
                      <span className="text-white">{plan.minutesPerSession}</span>
                    </div>
                    <div className="bg-[#1a2335] p-2 rounded">
                      <span className="text-gray-400">Equipment:</span>{' '}
                      <span className="text-white">
                        {plan.equipmentAccess === 'gym'
                          ? 'Full Gym'
                          : plan.equipmentAccess === 'limited'
                          ? 'Limited'
                          : 'Bodyweight'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href={`/gym-plan/${plan.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition-colors"
                    >
                      View Plan
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-blue-600/20 rounded-full p-4 inline-block mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Gym Plans Yet</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              You haven't created any personalized gym plans yet. Create your first plan to get started.
            </p>
            <Link
              href="/gym-plan/create"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition-colors"
            >
              Create Your First Plan
            </Link>
          </div>
        )}
      </main>

      {/* System Message */}
      <SystemMessage message={systemMessage} />
    </div>
  );
}
