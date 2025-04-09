'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Use uploadBytesResumable
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/config';
import Image from 'next/image';

const StorageUpload = ({ userId }) => {
  const [selectedFile, setSelectedFile] = useState(null); // Store the actual File object
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // Fetch current avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return; // Ensure userId is present
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().avatarUrl) {
          setCurrentAvatar(userDoc.data().avatarUrl);
          setPreviewUrl(null); // Clear any stale preview if current avatar exists
          setSelectedFile(null); // Clear any stale file selection
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Could not fetch current avatar.'); // User-friendly error
      }
    };

    fetchUserProfile();
  }, [userId]); // Only refetch when userId changes

  // Function to handle file processing (validation, preview, state update)
  const handleFile = useCallback((file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Use JPG, PNG, GIF, or WEBP.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB limit.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Clear previous errors/success
    setError(null);
    setSuccess(false);
    setSelectedFile(file); // Store the actual File object

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
    };
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      setError("Failed to read file for preview.");
      setSelectedFile(null);
      setPreviewUrl(null);
    };
    reader.readAsDataURL(file);
  }, []); // useCallback to memoize the function


  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
      // Reset file input value to allow selecting the same file again
      e.target.value = null;
    }
  };

  // Handle drag and drop events using useCallback for handleDrop
   const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dropAreaRef.current?.classList.remove('border-purple-500', 'bg-purple-900/20'); // Ensure unhighlight

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]); // Depend on the memoized handleFile

  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const highlight = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('border-purple-500', 'bg-purple-900/20');
    };

    const unhighlight = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('border-purple-500', 'bg-purple-900/20');
    };

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Use named functions for adding/removing listeners
    const handleDragEnter = (e) => { preventDefaults(e); highlight(e); };
    const handleDragOver = (e) => { preventDefaults(e); highlight(e); };
    const handleDragLeave = (e) => { preventDefaults(e); unhighlight(e); };
    // handleDrop is already defined using useCallback

    dropArea.addEventListener('dragenter', handleDragEnter, false);
    dropArea.addEventListener('dragover', handleDragOver, false);
    dropArea.addEventListener('dragleave', handleDragLeave, false);
    dropArea.addEventListener('drop', handleDrop, false); // Use the memoized handleDrop

    return () => {
      dropArea.removeEventListener('dragenter', handleDragEnter, false);
      dropArea.removeEventListener('dragover', handleDragOver, false);
      dropArea.removeEventListener('dragleave', handleDragLeave, false);
      dropArea.removeEventListener('drop', handleDrop, false);
    };
  }, [handleDrop]); // Depend on the memoized handleDrop

  // Handle the actual upload process
  const handleUpload = async () => {
     // Use selectedFile state now
    if (!selectedFile || isUploading || !userId) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileExtension = selectedFile.name.split('.').pop();
      const filename = `avatar-${userId}-${timestamp}.${fileExtension}`;
      const storagePath = `avatars/${userId}/${filename}`;

      // Reference to the storage location
      const storageRef = ref(storage, storagePath);

      // Create metadata for the file
      const metadata = {
        contentType: selectedFile.type,
        customMetadata: {
          'uploadedBy': userId,
          'uploadedAt': new Date().toISOString()
        }
      };

      console.log('Uploading to path:', storagePath);
      console.log('File type:', selectedFile.type);
      console.log('File size:', selectedFile.size);

      // Use uploadBytesResumable for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, selectedFile, metadata);

      // Register observers for 'state_changed', error, and completion
      uploadTask.on('state_changed',
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (uploadError) => {
          // Handle unsuccessful uploads
          console.error('Upload Error:', uploadError);
          console.error('Error Code:', uploadError.code);
          console.error('Error Message:', uploadError.message);
          console.error('Error ServerResponse:', uploadError.serverResponse);

          // Handle specific Firebase storage error codes
          let errorMessage = 'Upload failed';

          switch(uploadError.code) {
            case 'storage/unauthorized':
              errorMessage = 'You do not have permission to upload to this location';
              break;
            case 'storage/canceled':
              errorMessage = 'Upload was canceled';
              break;
            case 'storage/unknown':
              errorMessage = 'An unknown error occurred during upload';
              break;
            case 'storage/retry-limit-exceeded':
              errorMessage = 'Upload failed after multiple attempts. Please check your connection';
              break;
            case 'storage/invalid-checksum':
              errorMessage = 'File integrity check failed. Please try again with a different file';
              break;
            case 'storage/server-file-wrong-size':
              errorMessage = 'File size mismatch. Please try again';
              break;
            default:
              errorMessage = `Upload failed: ${uploadError.message || 'Unknown error'}`;
          }

          setError(errorMessage);
          setIsUploading(false);
          setUploadProgress(0);
          setSelectedFile(null); // Clear selection on error
          setPreviewUrl(null);
        },
        async () => {
          // Handle successful uploads on complete
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('File available at', downloadUrl);

            // Update user document in Firestore
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
              avatarUrl: downloadUrl,
              avatarStoragePath: storagePath, // Store the path for potential future use (e.g., deletion)
              avatarUploadMethod: 'firebase_storage',
              lastUpdated: new Date().toISOString()
            });

            console.log('User profile updated with storage image URL');

            // Update UI state
            setSuccess(true);
            setCurrentAvatar(downloadUrl); // Update the displayed avatar immediately
            setSelectedFile(null); // Clear selection after successful upload
            setPreviewUrl(null); // Clear preview
            setIsUploading(false);
            setUploadProgress(0);


            // Reset success message after 3 seconds
            setTimeout(() => {
              setSuccess(false);
            }, 3000);

          } catch (updateError) {
              console.error('Error updating Firestore or getting URL:', updateError);
              setError(`Upload succeeded, but failed to update profile: ${updateError.message}`);
              setIsUploading(false);
              setUploadProgress(0);
          }
        }
      );

    } catch (err) {
      // Catch synchronous errors during setup (less likely now)
      console.error('Error setting up upload:', err);
      setError(`Upload failed: ${err.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
    // No finally block needed here as completion/error is handled by the observer
  };

  // Determine which image source to display
  const displayImageUrl = previewUrl || currentAvatar;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 relative overflow-hidden">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Profile Photo
      </h2>

      <div className="flex flex-col items-center space-y-4">
        {/* Preview area */}
        <div className="relative group">
          <div
            ref={dropAreaRef}
            className={`w-[150px] h-[150px] rounded-full border-2 border-dashed ${isUploading ? 'border-gray-600' : 'border-gray-600 hover:border-blue-500'} flex items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer`}
            onClick={() => !isUploading && fileInputRef.current?.click()} // Prevent click during upload
          >
            {displayImageUrl ? (
              <div className="w-full h-full relative">
                <Image
                  src={displayImageUrl}
                  alt={previewUrl ? "Preview" : "Current Avatar"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes, adjust as needed
                  className="object-cover"
                  priority={!previewUrl} // Prioritize loading current avatar
                />
              </div>
            ) : (
              <div className="text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400">Drag & drop or click</p>
              </div>
            )}

            {/* Overlay only shown when not uploading */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full">
                <div className="text-white text-center p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm">{previewUrl ? "Change" : "Upload"} image</p>
                </div>
              </div>
            )}
          </div>

          {/* Rank indicator */}
          <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            HUNTER
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp" // Be more specific
          className="hidden"
          disabled={isUploading} // Disable during upload
        />

        {/* Upload button and Progress bar */}
        {/* Show button only if a file is selected and ready for upload */}
        {selectedFile && !isUploading && (
          <div className="w-full max-w-xs">
             <button
              onClick={handleUpload}
              className="w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
               </svg>
               Upload Photo
             </button>
          </div>
        )}

        {/* Show progress bar and status only during upload */}
        {isUploading && (
          <div className="w-full max-w-xs text-center">
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-150 ease-linear"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-300">Uploading... {uploadProgress}%</p>
          </div>
        )}


        {/* Error and success messages */}
        {error && (
          <div className="w-full max-w-xs p-3 bg-red-900/30 border border-red-500 rounded-md">
            <p className="text-sm text-red-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="w-full max-w-xs p-3 bg-green-900/30 border border-green-500 rounded-md">
            <p className="text-sm text-green-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Profile photo uploaded successfully!
            </p>
          </div>
        )}

        {/* Guidelines */}
        <div className="w-full max-w-xs p-3 bg-gray-700 rounded-md">
          <h3 className="text-sm font-medium text-blue-300 mb-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Upload Guidelines
          </h3>
          <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1">
            <li>Maximum file size: 10MB</li>
            <li>Supported formats: JPG, PNG, GIF</li>
            <li>Square images work best</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StorageUpload;