// src/components/profile/AvatarUploadComponent.jsx
'use client';

import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/config';
import PlayerAvatarFrame from '@/components/three/PlayerAvatarFrame';

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
    <div className="bg-[#1f2a40] p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-blue-300 mb-4">Hunter Avatar</h2>
      
      <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-6">
        {/* Avatar Preview with Frame */}
        <div className="mb-6 md:mb-0 flex flex-col items-center">
          <div className="relative">
            {previewUrl ? (
              <PlayerAvatarFrame 
                rank={currentLevel} 
                size={150}
                imageUrl={previewUrl} 
              />
            ) : (
              <div className="w-[150px] h-[150px] rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                No Avatar
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-400">Your hunter avatar with rank frame</p>
        </div>
        
        {/* Upload Controls */}
        <div className="flex-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Image
            </label>
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
              className="flex items-center justify-center px-4 py-2 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
            >
              Choose File
            </label>
            {previewUrl && (
              <p className="mt-1 text-xs text-gray-400">
                New image selected
              </p>
            )}
          </div>
          
          <button
            onClick={handleUpload}
            disabled={isUploading || !previewUrl}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
              isUploading || !previewUrl
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload Avatar'}
          </button>
          
          {error && (
            <p className="mt-2 text-sm text-red-400">
              {error}
            </p>
          )}
          
          {uploadSuccess && (
            <p className="mt-2 text-sm text-green-400">
              Avatar updated successfully!
            </p>
          )}
          
          <div className="mt-4 p-3 bg-blue-900/30 rounded-md">
            <h3 className="text-sm font-medium text-blue-300 mb-1">Avatar Guidelines</h3>
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