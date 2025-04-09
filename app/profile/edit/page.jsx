'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';
import StorageUpload from './StorageUpload';

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    hunterName: '',
    bio: '',
    favoriteWorkout: '',
    goal: ''
  });

  // Fetch user profile data
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile(userData);
          setFormData({
            hunterName: userData.hunterName || '',
            bio: userData.bio || '',
            favoriteWorkout: userData.favoriteWorkout || '',
            goal: userData.goal || ''
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, router]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...formData,
        lastUpdated: new Date().toISOString()
      });

      setSuccess(true);
      setLoading(false);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#101827] text-gray-100 font-[family-name:var(--font-geist-sans)] p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101827] text-gray-100 font-[family-name:var(--font-geist-sans)] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-400">Edit Hunter Profile</h1>
          <Link href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors">
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
            Profile updated successfully!
          </div>
        )}

        <div className="space-y-6">
          {/* Avatar Upload Section */}
          <StorageUpload
            userId={user.uid}
          />

          {/* Profile Details Form */}
          <div className="mt-6">
            <form onSubmit={handleSubmit} className="bg-[#1f2a40] p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-blue-300 mb-4">Hunter Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="hunterName" className="block text-sm font-medium text-gray-300 mb-2">
                    Hunter Name
                  </label>
                  <input
                    type="text"
                    id="hunterName"
                    name="hunterName"
                    value={formData.hunterName}
                    onChange={handleChange}
                    className="w-full bg-[#141e33] border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your hunter name"
                  />
                </div>

                <div>
                  <label htmlFor="favoriteWorkout" className="block text-sm font-medium text-gray-300 mb-2">
                    Favorite Workout
                  </label>
                  <input
                    type="text"
                    id="favoriteWorkout"
                    name="favoriteWorkout"
                    value={formData.favoriteWorkout}
                    onChange={handleChange}
                    className="w-full bg-[#141e33] border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Strength Training, Running, etc."
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="goal" className="block text-sm font-medium text-gray-300 mb-2">
                  Fitness Goal
                </label>
                <input
                  type="text"
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full bg-[#141e33] border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Gain muscle, Lose weight, Improve endurance, etc."
                />
              </div>

              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                  Hunter Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-[#141e33] border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell other hunters about yourself..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                  }`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Stats Display */}
          <div className="md:col-span-2">
            <div className="bg-[#1f2a40] p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-blue-300 mb-4">Hunter Stats</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#141e33] p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Level</div>
                  <div className="text-2xl font-bold text-blue-400">{profile?.level || 1}</div>
                </div>

                <div className="bg-[#141e33] p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Rank</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {profile?.level >= 50 ? 'Special Authority' :
                     profile?.level >= 40 ? 'National Level' :
                     profile?.level >= 30 ? 'S' :
                     profile?.level >= 25 ? 'A' :
                     profile?.level >= 20 ? 'B' :
                     profile?.level >= 15 ? 'C' :
                     profile?.level >= 10 ? 'D' : 'E'}
                  </div>
                </div>

                <div className="bg-[#141e33] p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Missions Completed</div>
                  <div className="text-2xl font-bold text-green-400">{profile?.huntsCompleted || 0}</div>
                </div>

                <div className="bg-[#141e33] p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Element</div>
                  <div className="text-2xl font-bold text-orange-400">
                    {profile?.level >= 50 ? 'Cosmic Energy' :
                     profile?.level >= 40 ? 'Lightning' :
                     profile?.level >= 30 ? 'Fire' :
                     profile?.level >= 25 ? 'Wind' :
                     profile?.level >= 20 ? 'Earth' :
                     profile?.level >= 15 ? 'Water' :
                     profile?.level >= 10 ? 'Ice' : 'Shadow'}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-400">
                <p>Note: Stats are earned through completing workouts and missions. They cannot be directly edited.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
