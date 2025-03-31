'use client'; // Needs to be a client component for hooks

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    updateDoc, 
    onSnapshot,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    limit,
    getDocs,
    setDoc
} from "@firebase/firestore";
import { auth, db } from '../lib/firebase/config';
import Link from 'next/link';

// Remove initialStats - data will come from Firestore
// const initialStats = { ... };

// --- Helper Components ---

const StatCard = ({ title, value, children, className = "", onClick }) => (
  <div 
    className={`bg-gradient-to-br from-[#1f2a40] to-[#1a2335] p-4 rounded-lg shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-blue-500/30 hover:scale-[1.02] ${className} ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <span className="text-sm uppercase text-gray-400 tracking-wider mb-1 font-semibold">{title}</span>
    {value !== undefined && <span className="text-4xl font-bold text-white">{value}</span>}
    {children}
  </div>
);

const ProgressBar = ({ value, max, label, color = "bg-blue-500" }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0; // Ensure percentage doesn't exceed 100
  return (
    <div className="w-full px-2">
      <div className="flex justify-between text-xs text-gray-300 mb-1">
        <span className="font-medium">{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const StatItem = ({ title, value, onIncrease, availablePoints }) => (
  <div className="bg-gradient-to-br from-[#1f2a40] to-[#1a2335] p-4 rounded-lg shadow-lg flex flex-col items-center transition-all duration-300 hover:shadow-blue-500/30 hover:scale-[1.02]">
    <span className="text-sm uppercase text-gray-400 tracking-wider mb-1 font-semibold">{title}</span>
    <div className="flex items-center gap-3 mt-1">
      <span className="text-4xl font-bold text-white">{value}</span>
      <button 
        onClick={onIncrease} 
        disabled={availablePoints <= 0}
        className={`bg-[#313f5b] hover:bg-[#4a5a7a] disabled:bg-gray-600 text-white font-bold py-1 px-3 rounded text-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-gray-600`}
        aria-label={`Increase ${title}`}
      >
        +
      </button>
    </div>
  </div>
);

// --- Workout Modal Component ---
const WorkoutModal = ({ isOpen, onClose, workouts }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1f2a40] to-[#101827] p-6 rounded-lg shadow-xl w-full max-w-md border border-blue-500/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-300">Workout Log</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <ul className="list-none space-y-2 max-h-60 overflow-y-auto pr-2">
            {workouts && workouts.length > 0 ? (
                workouts.map((workout, index) => (
                <li key={workout.id || index} className="text-gray-300 bg-[#1a2335] p-2 rounded shadow-sm">
                    {workout.name}
                    {/* TODO: Add buttons/forms for logging sets/reps/weight */}
                </li>
                ))
            ) : (
                <li className="text-gray-500">No workouts available.</li>
            )}
        </ul>
        {/* TODO: Add button to start/add new workout */} 
      </div>
    </div>
  );
};

// --- System Message Component ---
const SystemMessage = ({ message, onAccept, onDecline }) => {
    if (!message) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm border border-blue-400/50">
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

// --- Chat Component ---
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

    useEffect(() => {
        const fetchUsernames = async () => {
            const usernamesRef = collection(db, "usernames");
            try {
                const querySnapshot = await getDocs(usernamesRef);
                const usernames = [];
                querySnapshot.forEach((doc) => {
                    // Store just the username (which is the document ID)
                    usernames.push(doc.id);
                });
                setAllUsernames(usernames);
            } catch (error) {
                console.error("Error fetching usernames for mentions:", error);
            }
        };

        fetchUsernames();
    }, []); // No dependencies needed

    useEffect(() => {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"), limit(50));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages = [];
            querySnapshot.forEach((doc) => {
                fetchedMessages.push({ id: doc.id, ...doc.data() });
            });
            setMessages(fetchedMessages);
        });

        return () => unsubscribe();
    }, []);

    const renderMessageWithMentions = (text) => {
        if (!text) return "";
        // Regex to find @ followed by username characters (letters, numbers, _, -)
        const mentionRegex = /@([a-zA-Z0-9_-]+)/g; 
        const parts = text.split(mentionRegex);

        // Use the array of usernames directly
        const knownUsernames = new Set(allUsernames);

        return parts.map((part, index) => {
            // Even indices are regular text, odd indices are potential mentions
            if (index % 2 === 1 && knownUsernames.has(part)) {
                // It's a valid mention
                const isCurrentUserMentioned = part === currentUsername;
                return (
                    <span 
                        key={index} 
                        className={`font-semibold px-1 rounded ${isCurrentUserMentioned 
                            ? 'text-yellow-300 bg-yellow-800/60 ring-1 ring-yellow-500' 
                            : 'text-blue-400 bg-blue-900/50'}`}
                    >
                        @{part}
                    </span>
                );
            } else {
                return part;
            }
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!user || !newMessage.trim() || !hunterName) return;

        const messagesRef = collection(db, "messages");
        try {
            await addDoc(messagesRef, {
                text: newMessage.trim(),
                userId: user.uid,
                hunterName: hunterName,
                username: currentUsername, // Store username so messages can show who sent them
                timestamp: serverTimestamp()
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message: ", error);
        }
        // Reset mention state after sending
        setIsMentioning(false);
        setMentionSuggestions([]);
        setMentionQuery("");
    };

    // Handle input change for mention detection
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
            
            const suggestions = allUsernames
                .filter(username => username.toLowerCase().startsWith(query))
                .map(username => ({ username })) // Convert to object format for compatibility
                .slice(0, 5); // Limit suggestions
                
            setMentionSuggestions(suggestions);
        } else {
            setIsMentioning(false);
            setMentionSuggestions([]);
        }
    };

    // Handle selecting a mention suggestion
    const handleSelectMention = (username) => {
        const currentMessage = newMessage;
        const cursorPos = inputRef.current.selectionStart;
        const textBeforeCursor = currentMessage.substring(0, cursorPos);
        const textAfterCursor = currentMessage.substring(cursorPos);

        // Replace the partial mention query with the selected username + a space
        const updatedTextBefore = textBeforeCursor.replace(/@([a-zA-Z0-9_-]*)$/, `@${username} `);

        setNewMessage(updatedTextBefore + textAfterCursor);

        // Reset mention state and focus input
        setIsMentioning(false);
        setMentionSuggestions([]);
        inputRef.current.focus();

        // Optional: Move cursor after the inserted mention
        const newCursorPos = updatedTextBefore.length;
        setTimeout(() => inputRef.current.setSelectionRange(newCursorPos, newCursorPos), 0);
    };

    return (
        <div className="bg-[#1f2a40] rounded-lg shadow-lg flex flex-col h-[calc(100vh-200px)] max-h-[500px] md:col-span-3 lg:col-span-1 lg:row-span-2">
            <h3 className="text-lg font-semibold text-blue-300 p-3 border-b border-gray-700">Global Chat</h3>
            <div className="flex-grow overflow-y-auto p-3 space-y-3">
                {messages.map(msg => {
                    // Highlight the entire message div if user is mentioned
                    const mentionsCurrentUser = msg.text?.includes(`@${currentUsername}`);
                    return (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.userId === user.uid ? 'justify-end' : 'justify-start'} ${mentionsCurrentUser ? 'bg-yellow-900/30 rounded-md p-1 -m-1' : ''}`}
                        >
                            <div className={`p-2 rounded-lg max-w-[75%] ${msg.userId === user.uid ? 'bg-blue-700 text-white' : 'bg-gray-600 text-gray-200'}`}>
                                <p className="text-xs font-semibold mb-0.5 opacity-80">
                                    {msg.hunterName || 'Hunter'} 
                                    {msg.username && <span className="opacity-60 text-xxs ml-1">@{msg.username}</span>}
                                </p>
                                <p className="text-sm break-words">{renderMessageWithMentions(msg.text)}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
            <form ref={formRef} onSubmit={handleSendMessage} className="p-3 border-t border-gray-700 flex gap-2 relative"> { /* Added relative positioning */}
                {/* Mention Suggestions Popup (improved positioning) */}
                {isMentioning && mentionSuggestions.length > 0 && (
                    <div className="absolute bottom-[100%] left-3 right-3 mb-1 bg-gray-800 border border-blue-500 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                        <div className="text-xs text-gray-400 px-3 py-1 border-b border-gray-700">Select a user to mention</div>
                        <ul>
                            {mentionSuggestions.map((u) => (
                                <li 
                                    key={u.username} 
                                    onClick={() => handleSelectMention(u.username)}
                                    className="px-3 py-2 text-sm text-gray-200 hover:bg-blue-700 cursor-pointer"
                                >
                                    @{u.username}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Fallback: Show when we're mentioning but no suggestions */}
                {isMentioning && mentionSuggestions.length === 0 && allUsernames.length > 0 && (
                    <div className="absolute bottom-[100%] left-3 right-3 mb-1 bg-gray-800 border border-blue-500 rounded-md shadow-lg z-10">
                        <div className="text-xs text-gray-300 px-3 py-2">
                            No usernames match "{mentionQuery}". Keep typing...
                        </div>
                    </div>
                )}
                
                <input 
                    ref={inputRef} // Assign ref
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange} // Use dedicated handler
                    placeholder="Enter message... (@username to mention)" 
                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    autoComplete="off" // Disable browser autocomplete
                />
                <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-medium rounded-md text-sm px-4 py-2 transition-colors disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

// --- Main Home Component ---

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [systemMessage, setSystemMessage] = useState(null);
  const [currentQuest, setCurrentQuest] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    let unsubscribe = () => {};

    if (!authLoading && user) {
      setLocalLoading(true);
      const userDocRef = doc(db, "users", user.uid);

      unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          console.log("User data:", docSnap.data());
          setStats(docSnap.data());
        } else {
          console.error("User document not found!");
        }
        setLocalLoading(false);
      }, (error) => {
        console.error("Error fetching user document:", error);
        setLocalLoading(false);
      });
    }

    return () => unsubscribe();

  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && stats && !currentQuest) {
      const quests = [
        { id: 'd1', text: 'Daily Quest: Perform 50 Push-ups.', type: 'daily', rewardExp: 50 },
        { id: 'w1', text: 'Weekly Challenge: Deadlift your bodyweight.', type: 'weekly', rewardPoints: 1 },
        { id: 'd2', text: 'Daily Quest: Run 1 mile.', type: 'daily', rewardExp: 75 },
      ];
      const newQuest = quests[Math.floor(Math.random() * quests.length)];
      
      const timer = setTimeout(() => {
          setSystemMessage(`New ${newQuest.type} quest available: ${newQuest.text}`);
          setCurrentQuest(newQuest);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [user, stats, currentQuest]);

  const handleAcceptQuest = () => {
    console.log("Quest Accepted:", currentQuest);
    setSystemMessage(null);
  };

  const handleDeclineQuest = () => {
    console.log("Quest Declined:", currentQuest);
    setSystemMessage(null);
    setCurrentQuest(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleIncreaseStat = useCallback(async (statName) => {
    if (!user || !stats || stats.statPoints <= 0) {
        console.log("Cannot increase stat: No user, stats not loaded, or no points available.");
        return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const newStatValue = stats[statName] + 1;
    const newAvailablePoints = stats.statPoints - 1;

    try {
        await updateDoc(userDocRef, {
            [statName]: newStatValue,
            statPoints: newAvailablePoints,
        });
        console.log(`Stat ${statName} updated in Firestore.`);
    } catch (error) {
        console.error("Error updating stat:", error);
    }
  }, [user, stats]);

  if (authLoading || localLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#101827]">
        <p className="text-white text-xl">Loading System Interface...</p>
      </div>
    );
  }

  if (user && stats) {
    return (
      <>
        <div className="min-h-screen bg-[#101827] text-gray-100 font-[family-name:var(--font-geist-sans)] p-4 sm:p-8">
          <header className="flex justify-between items-center mb-6 sm:mb-10">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-300 tracking-wide">
                {stats.hunterName || 'Hunter'}'s Dashboard 
            </h1>
            <div className="flex items-center gap-3">
              <Link href="/leaderboard" className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Rankings
              </Link>
              <span className="text-sm text-gray-400 hidden sm:inline">|</span>
              <span className="text-sm text-gray-300 hidden sm:inline" title={user.email}>{user.email.split('@')[0]}</span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-semibold rounded-md text-sm px-3 py-1.5 transition-all shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="md:col-span-1 grid grid-rows-2 gap-4 sm:gap-6">
                    <StatCard title="Level" value={stats.level} />
                    <StatCard title="Status" className="justify-around py-6">
                        <ProgressBar label="HP" value={stats.hp} max={stats.maxHp} color="bg-red-500" />
                        <ProgressBar label="EXP" value={stats.exp} max={stats.maxExp} color="bg-yellow-500" />
                    </StatCard>
                </div>

                <div className="md:col-span-1 grid grid-rows-2 gap-4 sm:gap-6">
                    <StatItem 
                        title="Strength" 
                        value={stats.strength} 
                        onIncrease={() => handleIncreaseStat('strength')} 
                        availablePoints={stats.statPoints}
                    /> 
                    <StatCard title="Stat Points" value={stats.statPoints} />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="grid grid-cols-2 md:col-span-2 gap-4 sm:gap-6">
                         <StatItem 
                            title="Vitality" 
                            value={stats.vitality} 
                            onIncrease={() => handleIncreaseStat('vitality')} 
                            availablePoints={stats.statPoints}
                        />
                        <StatItem 
                            title="Agility" 
                            value={stats.agility} 
                            onIncrease={() => handleIncreaseStat('agility')}
                            availablePoints={stats.statPoints}
                        />
                    </div>
                    <div className="md:col-span-1">
                         <StatCard 
                            title="Workouts" 
                            className="items-start justify-start h-full"
                            onClick={() => setIsWorkoutModalOpen(true)}
                         >
                            <ul className="list-none text-left w-full mt-2 text-sm space-y-1">
                            {stats.workouts && stats.workouts.length > 0 ? (
                                stats.workouts.slice(0, 4).map((workout, index) => (
                                    <li key={workout.id || index} className="text-gray-300 truncate">- {workout.name}</li>
                                ))
                            ) : (
                                <li className="text-gray-500">No workouts assigned.</li>
                            )}
                            {stats.workouts && stats.workouts.length > 4 && (
                                <li className="text-gray-500 text-xs mt-1">... and more</li>
                            )}
                            </ul>
                        </StatCard>
                    </div>
                </div>
            </div>

            <ChatBox 
                user={user} 
                hunterName={stats.hunterName} 
                currentUsername={stats.username} // Pass current user's username
            /> 

          </main>
        </div>

        <WorkoutModal 
            isOpen={isWorkoutModalOpen} 
            onClose={() => setIsWorkoutModalOpen(false)} 
            workouts={stats.workouts || []} 
        />
        <SystemMessage 
            message={systemMessage} 
            onAccept={currentQuest ? handleAcceptQuest : undefined} 
            onDecline={currentQuest ? handleDeclineQuest : undefined} 
        />
      </>
    );
  }

  return null;
}

