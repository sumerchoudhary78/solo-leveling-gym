// src/components/dashboard/ChatBox.jsx
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase/config'; // Adjust path as needed
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    limit,
    onSnapshot,
    getDocs
} from "@firebase/firestore";

const ChatBox = ({ user, hunterName, currentUsername }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [allUsernames, setAllUsernames] = useState([]); // Array of usernames for mentions
    const [mentionSuggestions, setMentionSuggestions] = useState([]);
    const [isMentioning, setIsMentioning] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null); // Ref for the input field
    const formRef = useRef(null); // Ref for the form to position dropdown

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch all usernames once
    useEffect(() => {
        const fetchUsernames = async () => {
            const usersRef = collection(db, "users");
            try {
                const querySnapshot = await getDocs(usersRef);
                const usernames = querySnapshot.docs
                    .map(doc => doc.data()?.username)
                    .filter(username => username && username !== currentUsername);
                setAllUsernames(usernames);
                console.log("Fetched usernames for mentions:", usernames);
            } catch (error) {
                console.error("Error fetching usernames for mentions:", error);
            }
        };
        if (currentUsername) {
             fetchUsernames();
        }
    }, [currentUsername]);

    // Listen for new messages
    useEffect(() => {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"), limit(50));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages = [];
            querySnapshot.forEach((doc) => {
                fetchedMessages.push({ id: doc.id, ...doc.data() });
            });
            setMessages(fetchedMessages);
        }, (error) => {
            console.error("Error fetching messages:", error);
        });

        return () => unsubscribe();
    }, []);

    const renderMessageWithMentions = useCallback((text) => {
        if (!text) return "";
        const mentionRegex = /@([a-zA-Z0-9_-]+)(\b|$)/g;
        const knownUsernames = new Set(allUsernames);
        if (currentUsername) {
             knownUsernames.add(currentUsername);
        }
        // Add 'gemini' as a special username for AI
        knownUsernames.add('gemini');

        const parts = text.split(mentionRegex);

        return parts.map((part, index) => {
          const isPotentialMention = index % 3 === 1;

          if (isPotentialMention) {
            if (part === 'gemini') {
              // Special styling for Gemini AI mentions
              return (
                <span
                  key={index}
                  className="font-semibold px-1 rounded text-green-400 bg-green-900/50 ring-1 ring-green-500"
                >
                  @{part}
                </span>
              );
            } else if (knownUsernames.has(part)) {
              const isCurrentUserMentioned = part === currentUsername;
              return (
                <span
                  key={index}
                  className={`font-semibold px-1 rounded ${
                    isCurrentUserMentioned
                      ? 'text-yellow-300 bg-yellow-800/60 ring-1 ring-yellow-500'
                      : 'text-blue-400 bg-blue-900/50'
                  }`}
                >
                  @{part}
                </span>
              );
            }
          }
          
          if (index % 3 === 0) {
              return part; // Regular text part
          } else {
              const prefix = index > 1 && parts[index - 1] === undefined ? "@" : "";
              return prefix + part;
          }
        });
    }, [allUsernames, currentUsername]);

    // Function to extract queries for Gemini AI
    const extractGeminiQuery = (text) => {
        // This regex matches @gemini followed by text until the end of string or next @ mention
        const geminiRegex = /@gemini\s+([^@]+)(?=@|$)/;
        const match = text.match(geminiRegex);
        return match ? match[1].trim() : null;
    };

    // Function to query Gemini AI via our API endpoint
    const queryGeminiAI = async (query, username) => {
        try {
            // Call our API endpoint including the username
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, username }),
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error("Error querying Gemini AI:", error);
            return "I'm having trouble processing your request. Please try again later.";
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!user || !newMessage.trim() || !hunterName || !currentUsername) {
            console.warn("Cannot send message. Missing user, message, name, or username.", { user, newMessage, hunterName, currentUsername });
            return;
        }

        const messageText = newMessage.trim();
        const messagesRef = collection(db, "messages");
        
        try {
            // Send the user's message
            await addDoc(messagesRef, {
                text: messageText,
                userId: user.uid,
                hunterName: hunterName || 'Hunter',
                username: currentUsername,
                timestamp: serverTimestamp()
            });
            
            // Check if the message contains a @gemini mention with query
            if (messageText.includes('@gemini')) {
                const query = extractGeminiQuery(messageText);
                if (query) {
                    setIsLoading(true);
                    // Add a "typing" message
                    const typingDocRef = await addDoc(messagesRef, {
                        text: "Gemini is thinking...",
                        userId: 'gemini-ai-system',
                        hunterName: 'Gemini AI',
                        username: 'gemini',
                        isTyping: true,
                        timestamp: serverTimestamp()
                    });
                    
                    // Get response from Gemini AI via our API
                    // Pass the current username so Gemini can tag the user back
                    const aiResponse = await queryGeminiAI(query, currentUsername);
                    
                    // Send the actual AI response
                    await addDoc(messagesRef, {
                        text: aiResponse,
                        userId: 'gemini-ai-system',
                        hunterName: 'Gemini AI',
                        username: 'gemini',
                        timestamp: serverTimestamp()
                    });
                    
                    setIsLoading(false);
                }
            }
            
            setNewMessage("");
            setIsMentioning(false);
            setMentionSuggestions([]);
            setMentionQuery("");
        } catch (error) {
            console.error("Error sending message: ", error);
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);

        if (mentionMatch) {
            setIsMentioning(true);
            const query = mentionMatch[1].toLowerCase();
            setMentionQuery(query);

            // Include Gemini AI as a suggestion option
            let suggestions = [];
            
            // Always include Gemini if the query is empty or matches 'gemini'
            if (query === '' || 'gemini'.startsWith(query)) {
                suggestions.push('gemini');
            }
            
            // Add matching user mentions
            if (allUsernames.length > 0) {
                const userSuggestions = allUsernames
                    .filter(username => username.toLowerCase().startsWith(query))
                    .slice(0, 4); // Limit to 4 user suggestions
                
                suggestions = [...suggestions, ...userSuggestions];
            }
            
            setMentionSuggestions(suggestions);
        } else {
            setIsMentioning(false);
            setMentionSuggestions([]);
        }
    };

    const handleSelectMention = (username) => {
        const currentMessage = newMessage;
        const cursorPos = inputRef.current.selectionStart;
        const textBeforeCursor = currentMessage.substring(0, cursorPos);
        const textAfterCursor = currentMessage.substring(cursorPos);

        // Replace the partial mention with the full username and a space
        const updatedTextBefore = textBeforeCursor.replace(/@([a-zA-Z0-9_-]*)$/, `@${username} `);
        setNewMessage(updatedTextBefore + textAfterCursor);
        
        setIsMentioning(false);
        setMentionSuggestions([]);

        // Refocus and set cursor position after the inserted mention
        inputRef.current.focus();
        const newCursorPos = updatedTextBefore.length;
        setTimeout(() => inputRef.current.setSelectionRange(newCursorPos, newCursorPos), 0);
    };

    return (
        <div className="bg-[#1f2a40] rounded-lg shadow-lg flex flex-col h-[calc(100vh-200px)] max-h-[500px] md:col-span-3 lg:col-span-1 lg:row-span-2">
            <h3 className="text-lg font-semibold text-blue-300 p-3 border-b border-gray-700">Global Chat</h3>
            <div className="flex-grow overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {messages.map(msg => {
                    const mentionsCurrentUser = msg.text && currentUsername && msg.text.includes(`@${currentUsername}`);
                    const isOwnMessage = msg.userId === user?.uid;
                    const isGeminiMessage = msg.userId === 'gemini-ai-system';
                    const isTypingMessage = msg.isTyping === true;

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${mentionsCurrentUser ? 'bg-yellow-900/30 rounded-md p-1 -m-1 ring-1 ring-yellow-600/50' : ''}`}
                        >
                            <div className={`p-2 rounded-lg max-w-[75%] shadow-md ${
                                isGeminiMessage 
                                    ? 'bg-green-800 text-white' 
                                    : isOwnMessage 
                                        ? 'bg-blue-700 text-white' 
                                        : 'bg-gray-600 text-gray-200'
                            } ${isTypingMessage ? 'opacity-60' : ''}`}>
                                {(!isOwnMessage || isGeminiMessage) && (
                                    <p className="text-xs font-semibold mb-0.5 opacity-80">
                                        {msg.hunterName || 'Hunter'}
                                        {msg.username && <span className="opacity-60 text-xxs ml-1">@{msg.username}</span>}
                                    </p>
                                )}
                                <div className="text-sm break-words">{renderMessageWithMentions(msg.text)}</div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form ref={formRef} onSubmit={handleSendMessage} className="p-3 border-t border-gray-700 flex gap-2 relative">
                {/* Mention Suggestions Popup */}
                {isMentioning && mentionSuggestions.length > 0 && (
                    <div className="absolute bottom-[100%] left-3 right-3 mb-1 bg-gray-800 border border-blue-500 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        <div className="text-xs text-gray-400 px-3 py-1 border-b border-gray-700">Mention User or AI</div>
                        <ul>
                            {mentionSuggestions.map((username) => (
                                <li
                                    key={username}
                                    onClick={() => handleSelectMention(username)}
                                    className={`px-3 py-2 text-sm ${
                                        username === 'gemini' 
                                            ? 'text-green-300 hover:bg-green-800' 
                                            : 'text-gray-200 hover:bg-blue-700'
                                    } cursor-pointer flex items-center`}
                                >
                                    {username === 'gemini' && (
                                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                        </svg>
                                    )}
                                    @{username}
                                    {username === 'gemini' && <span className="ml-1 text-xs opacity-70">(AI assistant)</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* No Matches Found */}
                {isMentioning && mentionQuery && mentionSuggestions.length === 0 && (
                    <div className="absolute bottom-[100%] left-3 right-3 mb-1 bg-gray-800 border border-blue-500 rounded-md shadow-lg z-10">
                        <div className="text-xs text-gray-300 px-3 py-2">
                            No users match "@{mentionQuery}".
                        </div>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder={user ? "Enter message... (@username or @gemini to chat with AI)" : "Login to chat"}
                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                    autoComplete="off"
                    disabled={!user || isLoading}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || !user || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-medium rounded-md text-sm px-4 py-2 transition-colors disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Wait
                        </span>
                    ) : "Send"}
                </button>
            </form>
        </div>
    );
};

export default ChatBox;