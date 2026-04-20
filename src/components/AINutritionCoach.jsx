import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus, AlertCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API (Will throw error if key is invalid, we handle it gracefully below)
const rawKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const apiKey = rawKey === 'your_gemini_api_key_here' ? '' : rawKey;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default function AINutritionCoach({ onAddMeal }) {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: apiKey 
        ? "Welcome! I am your personal nutritionist companion. I can analyze your meals and generate highly accurate macronutrient profiles. What are you planning to eat today?" 
        : "⚠️ API Key Missing. Please add your Gemini API key to the .env file (VITE_GEMINI_API_KEY) and restart the server to use the AI Coach.", 
      isBot: true,
      isError: !apiKey
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateMealWithGemini = async (query) => {
    try {
      if (!genAI) throw new Error("API Key is missing or invalid");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `
        You are a professional nutritionist API. Your task is to analyze user food inputs, accurately calculate macros based on the specified portions/weights, or recommend a specific, balanced dish if the user asks for recommendations. 
        Query: "${query}"
        
        Rules:
        1. If the user specifies portions (e.g., "200g chicken", "2 cups of rice"), calculate the exact macros for those specific amounts.
        2. If the user asks for a recommendation (e.g., "high protein dinner"), invent a delicious, specific dish and estimate realistic portion sizes and macros for it.
        3. You MUST return ONLY valid JSON. Do not include any conversational text, backticks, or markdown.
        
        Schema:
        {
          "mealName": "string (Include the portion size or dish name, e.g., '200g Grilled Chicken & 1 cup Rice' or 'Spicy Tuna Bowl')",
          "macros": {
            "calories": "number",
            "protein": "number",
            "carbs": "number",
            "fat": "number"
          },
          "healthTip": "string (short advice based on the user's goal or food choice)"
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean up response in case Gemini includes markdown formatting like ```json ... ```
      let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      // Sometimes Gemini outputs text before or after the JSON. Try to extract just the object.
      const startIndex = cleanJson.indexOf('{');
      const endIndex = cleanJson.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        cleanJson = cleanJson.substring(startIndex, endIndex + 1);
      }

      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;

    const userText = input.trim();
    const userMessage = { id: Date.now(), text: userText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const suggestedMeal = await generateMealWithGemini(userText);
      
      const botResponse = {
        id: Date.now() + 1,
        text: `Here is a custom recommendation based on your request:\n\n**${suggestedMeal.mealName}**\n🔥 ${suggestedMeal.macros.calories} kcal | 🥩 ${suggestedMeal.macros.protein}g P | 🍞 ${suggestedMeal.macros.carbs}g C | 🥑 ${suggestedMeal.macros.fat}g F\n\n💡 *Tip: ${suggestedMeal.healthTip}*`,
        isBot: true,
        mealData: {
          name: suggestedMeal.mealName,
          calories: suggestedMeal.macros.calories,
          protein: suggestedMeal.macros.protein,
          carbs: suggestedMeal.macros.carbs,
          fats: suggestedMeal.macros.fat
        }
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Error: ${err.message}. Please check your API key or try a different request.`,
        isBot: true,
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-2xl flex flex-col h-[550px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50">
      <div className="p-4 border-b border-gray-800 bg-[#252525] rounded-t-2xl flex items-center gap-2">
        <Bot className="text-orange-500" />
        <h3 className="text-xl font-bold text-white">AI Nutrition Coach</h3>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex items-start max-w-[85%] gap-2 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`p-2 rounded-full flex-shrink-0 ${msg.isBot ? (msg.isError ? 'bg-red-600/20 text-red-500' : 'bg-orange-600/20 text-orange-500') : 'bg-blue-600/20 text-blue-500'}`}>
                {msg.isBot ? (msg.isError ? <AlertCircle size={20} /> : <Bot size={20} />) : <User size={20} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.isBot ? (msg.isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#2a2a2a] text-gray-200') : 'bg-blue-600 text-white'} ${msg.isBot ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
                {msg.mealData && (
                  <button
                    onClick={() => onAddMeal(msg.mealData)}
                    className="mt-3 flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-xs"
                  >
                    <Plus size={16} /> Add this to my log
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-full bg-orange-600/20 text-orange-500">
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
          placeholder={apiKey ? "E.g., High protein Indian dinner..." : "API Key Required..."}
          disabled={!apiKey || isTyping}
          className="flex-1 bg-[#2d2d2d] border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isTyping || !apiKey}
          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
