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
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null); // Ref for the input field
    const formRef = useRef(null); // Ref for the form to position dropdown

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch all usernames once
    useEffect(() => {
        const fetchUsernames = async () => {
            // Assuming a 'users' collection where each doc has a 'username' field
            // Or a dedicated 'usernames' collection as in the original code
            const usersRef = collection(db, "users"); // Adjust if using a different collection like 'usernames'
            try {
                const querySnapshot = await getDocs(usersRef);
                // Extract username, filter out potential undefined/nulls and the current user
                const usernames = querySnapshot.docs
                    .map(doc => doc.data()?.username)
                    .filter(username => username && username !== currentUsername);
                setAllUsernames(usernames);
                console.log("Fetched usernames for mentions:", usernames);
            } catch (error) {
                console.error("Error fetching usernames for mentions:", error);
            }
        };
        if (currentUsername) { // Only fetch if we know the current username to exclude
             fetchUsernames();
        }
    }, [currentUsername]); // Refetch if username changes (unlikely but good practice)

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
        // Improved regex to handle mentions at the end of the string or followed by punctuation
        const mentionRegex = /@([a-zA-Z0-9_-]+)(\b|$)/g;
        // Use a Set for efficient lookup
        const knownUsernames = new Set(allUsernames);
        if (currentUsername) {
             knownUsernames.add(currentUsername); // Include self for highlighting check
        }


        // Split using a lookahead to keep the delimiter (@username)
        const parts = text.split(mentionRegex);

        return parts.map((part, index) => {
          // Matched usernames appear at indices 1, 4, 7, ...
          const isPotentialMention = index % 3 === 1;

          if (isPotentialMention && knownUsernames.has(part)) {
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
           // Handle the non-mention parts (indices 0, 3, 6, ...)
           // and potential non-username strings caught by regex group (indices 2, 5, 8, ...)
           else if (index % 3 === 0) {
               return part; // Regular text part
           } else {
                // This part contains the character AFTER the mention (like space or punctuation)
                // Or it could be the end-of-word/string boundary captured - often empty
                // If it's not empty, it might be a non-username string preceded by @
                const prefix = index > 1 && parts[index - 1] === undefined ? "@" : ""; // Check if previous was undefined mention
                return prefix + part;
           }
        });


      }, [allUsernames, currentUsername]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!user || !newMessage.trim() || !hunterName || !currentUsername) {
            console.warn("Cannot send message. Missing user, message, name, or username.", { user, newMessage, hunterName, currentUsername });
            return;
        }


        const messagesRef = collection(db, "messages");
        try {
            await addDoc(messagesRef, {
                text: newMessage.trim(),
                userId: user.uid,
                hunterName: hunterName || 'Hunter', // Fallback name
                username: currentUsername, // Should be available here
                timestamp: serverTimestamp()
            });
            setNewMessage("");
            setIsMentioning(false);
            setMentionSuggestions([]);
            setMentionQuery("");
        } catch (error) {
            console.error("Error sending message: ", error);
            // Optionally show user feedback here
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);

        if (mentionMatch && allUsernames.length > 0) {
            setIsMentioning(true);
            const query = mentionMatch[1].toLowerCase();
            setMentionQuery(query);

            // Filter suggestions (already excludes current user during fetch)
            const suggestions = allUsernames
                .filter(username => username.toLowerCase().startsWith(query))
                .slice(0, 5);

            setMentionSuggestions(suggestions);
        } else {
            setIsMentioning(false);
            setMentionSuggestions([]);
        }
    };

    const handleSelectMention = (username) => {
        const currentMessage = newMessage;
        // Use ref to get current cursor position accurately
        const cursorPos = inputRef.current.selectionStart;
        const textBeforeCursor = currentMessage.substring(0, cursorPos);
        const textAfterCursor = currentMessage.substring(cursorPos);

        // Replace the partial mention (@ Somet...) with the full username and a space
        const updatedTextBefore = textBeforeCursor.replace(/@([a-zA-Z0-9_-]*)$/, `@${username} `);

        setNewMessage(updatedTextBefore + textAfterCursor);
        setIsMentioning(false);
        setMentionSuggestions([]);

        // Refocus and set cursor position after the inserted mention
        inputRef.current.focus();
        const newCursorPos = updatedTextBefore.length;
        // Use setTimeout to ensure the state update has rendered
        setTimeout(() => inputRef.current.setSelectionRange(newCursorPos, newCursorPos), 0);
    };

    return (
        <div className="bg-[#1f2a40] rounded-lg shadow-lg flex flex-col h-[calc(100vh-200px)] max-h-[500px] md:col-span-3 lg:col-span-1 lg:row-span-2">
            <h3 className="text-lg font-semibold text-blue-300 p-3 border-b border-gray-700">Global Chat</h3>
            <div className="flex-grow overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {messages.map(msg => {
                    // Safe check for text and currentUsername before includes
                    const mentionsCurrentUser = msg.text && currentUsername && msg.text.includes(`@${currentUsername}`);
                    const isOwnMessage = msg.userId === user?.uid;

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${mentionsCurrentUser ? 'bg-yellow-900/30 rounded-md p-1 -m-1 ring-1 ring-yellow-600/50' : ''}`}
                        >
                            <div className={`p-2 rounded-lg max-w-[75%] shadow-md ${isOwnMessage ? 'bg-blue-700 text-white' : 'bg-gray-600 text-gray-200'}`}>
                                {!isOwnMessage && (
                                    <p className="text-xs font-semibold mb-0.5 opacity-80">
                                        {msg.hunterName || 'Hunter'}
                                        {/* Ensure msg.username exists before displaying */}
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
                        <div className="text-xs text-gray-400 px-3 py-1 border-b border-gray-700">Mention User</div>
                        <ul>
                            {mentionSuggestions.map((username) => (
                                <li
                                    key={username}
                                    onClick={() => handleSelectMention(username)}
                                    className="px-3 py-2 text-sm text-gray-200 hover:bg-blue-700 cursor-pointer"
                                >
                                    @{username}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* No Matches Found */}
                {isMentioning && mentionQuery && mentionSuggestions.length === 0 && allUsernames.length > 0 && (
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
                    placeholder={user ? "Enter message... (@username to mention)" : "Login to chat"}
                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                    autoComplete="off"
                    disabled={!user} // Disable if not logged in
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || !user} // Disable if no text or not logged in
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-medium rounded-md text-sm px-4 py-2 transition-colors disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatBox;