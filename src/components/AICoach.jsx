import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const rawKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const apiKey = rawKey === 'your_gemini_api_key_here' ? '' : rawKey;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default function AICoach() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: apiKey 
        ? "Hello! I am your Elite AI Personal Trainer. Ask me anything about workout programming, exercise form, recovery, or gym etiquette." 
        : "⚠️ API Key Missing. Please add your Gemini API key to the .env file (VITE_GEMINI_API_KEY) and restart the server to use the AI Coach.", 
      isBot: true,
      isError: !apiKey
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  // Keep track of the chat instance for history context
  const chatRef = useRef(null);

  useEffect(() => {
    // Initialize the chat session once
    if (genAI && !chatRef.current) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      chatRef.current = model.startChat({
        systemInstruction: {
          role: "system",
          parts: [{ text: "You are an elite, highly knowledgeable personal trainer and fitness expert. Your job is to answer user questions about working out, gym equipment, programming, muscle groups, and recovery. Provide detailed, actionable, and medically safe advice. Use bullet points for readability when appropriate. Do not talk about nutrition; refer them to the Nutrition Coach for that. Always be motivating and professional." }]
        }
      });
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;

    const userText = input.trim();
    const userMessage = { id: Date.now(), text: userText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      if (!chatRef.current) throw new Error("Chat engine not initialized");
      
      const result = await chatRef.current.sendMessage(userText);
      const responseText = result.response.text();
      
      const botResponse = {
        id: Date.now() + 1,
        text: responseText,
        isBot: true
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.error("Gemini API Error:", err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Error: ${err.message}. Please check your API key or try again.`,
        isBot: true,
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-2xl flex flex-col h-[500px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50">
      <div className="p-4 border-b border-gray-800 bg-[#252525] rounded-t-2xl flex items-center gap-2">
        <Bot className="text-blue-500" />
        <h3 className="text-xl font-bold text-white">AI Coach</h3>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex items-start max-w-[85%] gap-2 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`p-2 rounded-full flex-shrink-0 ${msg.isBot ? (msg.isError ? 'bg-red-600/20 text-red-500' : 'bg-blue-600/20 text-blue-500') : 'bg-purple-600/20 text-purple-500'}`}>
                {msg.isBot ? (msg.isError ? <AlertCircle size={20} /> : <Bot size={20} />) : <User size={20} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.isBot ? (msg.isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#2a2a2a] text-gray-200') : 'bg-blue-600 text-white'} ${msg.isBot ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-full bg-blue-600/20 text-blue-500">
                <Bot size={20} />
              </div>
              <div className="p-3 rounded-2xl bg-[#2a2a2a] text-gray-400 rounded-tl-none flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-800 flex gap-2 bg-[#222] rounded-b-2xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={apiKey ? "Ask for fitness advice..." : "API Key Required..."}
          disabled={!apiKey || isTyping}
          className="flex-1 bg-[#2d2d2d] border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isTyping || !apiKey}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
