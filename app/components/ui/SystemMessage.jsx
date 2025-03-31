// src/components/ui/SystemMessage.jsx
'use client';

import React from 'react';

const SystemMessage = ({ message, onAccept, onDecline }) => {
    // Using a state to handle fade-out animation if desired
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        if (message) {
            setIsVisible(true);
            // Optional: Auto-hide after some time if no buttons
            // const timer = setTimeout(() => {
            //     if (!onAccept && !onDecline) setIsVisible(false);
            // }, 5000);
            // return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [message, onAccept, onDecline]);

    if (!isVisible && !message) return null; // Don't render if not visible and no message

    return (
        <div className={`fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm border border-blue-400/50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <p className="font-semibold text-blue-200 mb-1">System Alert:</p>
            <p className="mb-3 text-sm">{message}</p>
            {onAccept && onDecline && (
                <div className="flex justify-end gap-2">
                    <button onClick={onDecline} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors">Decline</button>
                    <button onClick={onAccept} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors">Accept</button>
                </div>
            )}
        </div>
    );
};

export default SystemMessage;