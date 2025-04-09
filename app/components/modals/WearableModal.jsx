"use client";

import { useState, useEffect } from 'react';
import { SUPPORTED_WEARABLES, ACTIVITY_TYPES } from '../../../lib/wearables/config';

const WearableModal = ({ isOpen, onClose, wearableIntegration, onConnect, onDisconnect, onUpdateSettings }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (wearableIntegration) {
      // Ensure we have valid settings object
      const validSettings = wearableIntegration.settings || {};
      setSettings(validSettings);

      // Set the platform if available
      if (wearableIntegration.platform) {
        setSelectedPlatform(wearableIntegration.platform);
      }

      // Reset error when integration changes
      setError(null);
    }
  }, [wearableIntegration]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    if (!selectedPlatform) {
      setError('Please select a wearable device');
      return;
    }

    if (!onConnect || typeof onConnect !== 'function') {
      setError('Connection functionality is not available');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const result = await onConnect(selectedPlatform);

      if (!result) {
        throw new Error('No response from connection attempt');
      }

      if (!result.success) {
        setError(result.message || result.error || 'Failed to connect to device');
      }
    } catch (err) {
      console.error('Error connecting to wearable device:', err);
      setError(err.message || 'An error occurred while connecting');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!onDisconnect || typeof onDisconnect !== 'function') {
      setError('Disconnect functionality is not available');
      return;
    }

    try {
      const result = await onDisconnect();

      if (!result || !result.success) {
        setError((result && result.message) || 'Failed to disconnect from device');
      }
    } catch (err) {
      console.error('Error disconnecting from wearable device:', err);
      setError(err.message || 'An error occurred while disconnecting');
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!onUpdateSettings || typeof onUpdateSettings !== 'function') {
      setError('Settings update functionality is not available');
      return;
    }

    try {
      const result = await onUpdateSettings(settings);

      if (!result || !result.success) {
        setError((result && result.message) || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Error updating wearable settings:', err);
      setError(err.message || 'An error occurred while saving settings');
    }
  };

  const isConnected = wearableIntegration?.isConnected;
  const connectedPlatformName = isConnected && wearableIntegration.platform ?
    SUPPORTED_WEARABLES[wearableIntegration.platform].name : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1f2a40] to-[#101827] p-6 rounded-lg shadow-xl w-full max-w-md border border-purple-500/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-300">Wearable Device Connection</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {isConnected ? (
          <div className="mb-6">
            <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-2 rounded mb-4">
              Connected to {connectedPlatformName}
            </div>

            <h3 className="text-lg font-semibold text-purple-200 mb-3">Tracking Settings</h3>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Track Heart Rate</label>
                <input
                  type="checkbox"
                  checked={settings.trackHeartRate}
                  onChange={(e) => handleSettingChange('trackHeartRate', e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-300">Track Calories</label>
                <input
                  type="checkbox"
                  checked={settings.trackCalories}
                  onChange={(e) => handleSettingChange('trackCalories', e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-300">Track Steps</label>
                <input
                  type="checkbox"
                  checked={settings.trackSteps}
                  onChange={(e) => handleSettingChange('trackSteps', e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-300">Track Distance</label>
                <input
                  type="checkbox"
                  checked={settings.trackDistance}
                  onChange={(e) => handleSettingChange('trackDistance', e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-300">Auto-Detect Activity</label>
                <input
                  type="checkbox"
                  checked={settings.autoDetectActivity}
                  onChange={(e) => handleSettingChange('autoDetectActivity', e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-300">Sync Frequency</label>
                <select
                  value={settings.syncFrequency}
                  onChange={(e) => handleSettingChange('syncFrequency', e.target.value)}
                  className="bg-[#1a2335] text-gray-200 rounded px-2 py-1 border border-gray-700"
                >
                  <option value="realtime">Real-time</option>
                  <option value="end_of_workout">End of Workout</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded text-white font-medium transition-colors"
              >
                Save Settings
              </button>

              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-white font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-300 mb-4">
              Connect your smartwatch or fitness tracker to track your workouts and earn experience points automatically.
            </p>

            <div className="mb-4">
              <label className="block text-gray-200 mb-2">Select Device Type</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full bg-[#1a2335] text-gray-200 rounded px-3 py-2 border border-gray-700"
              >
                <option value="">-- Select Device --</option>
                {Object.entries(SUPPORTED_WEARABLES).map(([key, platform]) => (
                  <option key={key} value={key}>
                    {platform.name} {platform.requiresApp ? '(Requires App)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleConnect}
              disabled={isConnecting || !selectedPlatform}
              className={`w-full px-4 py-2 rounded text-white font-medium transition-colors ${
                isConnecting || !selectedPlatform
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-purple-700 hover:bg-purple-600'
              }`}
            >
              {isConnecting ? 'Connecting...' : 'Connect Device'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WearableModal;
