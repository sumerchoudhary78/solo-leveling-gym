// src/components/profile/AvatarUploadComponent.jsx
'use client';

import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/config';
import dynamic from 'next/dynamic';

// Dynamically import the PlayerAvatarFrame to avoid SSR issues
const PlayerAvatarFrame = dynamic(
  () => import('../three/PlayerAvatarFrame'),
  { ssr: false }
);

const AvatarUploadComponent = ({ userId, currentLevel, currentAvatarUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Reset states
    setError(null);
    setUploadSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current.files[0]) {
      setError('Please select an image first');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const file = fileInputRef.current.files[0];
      const storageRef = ref(storage, `avatars/${userId}/${Date.now()}-${file.name}`);

      // Upload to Firebase Storage
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // Update user document in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        avatarUrl: downloadUrl,
        lastUpdated: new Date().toISOString()
      });

      setUploadSuccess(true);
      setIsUploading(false);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#1f2a40] p-6 rounded-lg shadow-lg border-2 border-blue-500/50 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-xl"></div>

      <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Hunter Avatar
      </h2>

      <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-6">
        {/* Avatar Preview with Frame */}
        <div className="mb-6 md:mb-0 flex flex-col items-center">
          <div className="relative group">
            {previewUrl ? (
              <div className="transform transition-transform duration-300 group-hover:scale-105">
                <PlayerAvatarFrame
                  rank={currentLevel}
                  size={150}
                  imageUrl={previewUrl}
                />
              </div>
            ) : (
              <div className="w-[150px] h-[150px] rounded-full bg-gray-700 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-600 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            {/* Upload overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-full opacity-0 group-hover:opacity-100">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="flex items-center justify-center px-4 py-2 bg-blue-600 rounded-md shadow-lg text-sm font-medium text-white hover:bg-blue-500 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                Choose Photo
              </label>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-400">Your hunter avatar with rank frame</p>
          {previewUrl && (
            <p className="mt-1 text-xs text-blue-400 animate-pulse">
              New image selected - Click Upload to save
            </p>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Photo
              </label>
              <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                Step 1 of 2
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Select an Image</h4>
                  <p className="text-xs text-gray-400">Click on the avatar or the button below</p>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="avatar-upload-alt"
              />
              <label
                htmlFor="avatar-upload-alt"
                className="flex items-center justify-center w-full px-4 py-2 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Browse Files
              </label>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Upload Your Photo</h4>
                  <p className="text-xs text-gray-400">Click the button below to save your photo</p>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={isUploading || !previewUrl}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center ${
                  isUploading || !previewUrl
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
                }`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    Upload Avatar
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-2 p-3 bg-red-900/30 border border-red-500 rounded-md">
              <p className="text-sm text-red-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-2 p-3 bg-green-900/30 border border-green-500 rounded-md">
              <p className="text-sm text-green-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Avatar updated successfully!
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-900/30 rounded-md">
            <h3 className="text-sm font-medium text-blue-300 mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Avatar Guidelines
            </h3>
            <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
              <li>Images should be square format (1:1 ratio)</li>
              <li>Maximum file size: 5MB</li>
              <li>Supported formats: JPG, PNG, GIF</li>
              <li>Inappropriate content will be removed</li>
              <li>Your rank frame will be added automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadComponent;