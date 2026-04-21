import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus, AlertCircle, Key, CheckCircle, ExternalLink, Loader } from 'lucide-react';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

const MODEL_PRIORITY = [
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-pro',
];

const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const VALID_ENV_KEY = ENV_KEY && !['your_gemini_api_key_here', 'your_new_gemini_api_key_here'].includes(ENV_KEY);
const LS_KEY = 'cult_pro_gemini_key';
const LS_MODEL = 'cult_pro_gemini_model';

function parseRetryDelay(msg = '') {
  const m = msg.match(/retry in ([\d.]+)s/i);
  return m ? Math.ceil(parseFloat(m[1])) + 1 : 60;
}

const NUTRITION_PROMPT = `You are a professional nutritionist API. Analyze user food inputs and return macros, or recommend a dish if asked.

Rules:
1. For specified portions (e.g., "200g chicken"), calculate exact macros.
2. For recommendations (e.g., "high protein dinner"), suggest a specific dish with realistic macros.
3. Return ONLY valid JSON — no markdown, no backticks, no extra text.

Schema:
{
  "mealName": "string",
  "macros": { "calories": number, "protein": number, "carbs": number, "fat": number },
  "healthTip": "string"
}`;

async function callWithAutoModelNutrition(apiKey, userQuery) {
  const cached = sessionStorage.getItem(LS_MODEL);
  const toTry = cached ? [cached, ...MODEL_PRIORITY.filter(m => m !== cached)] : MODEL_PRIORITY;

  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: `${NUTRITION_PROMPT}\n\nQuery: "${userQuery}"` }] }],
  });

  for (const model of toTry) {
    const res = await fetch(`${BASE}/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.status === 404) {
      if (cached === model) sessionStorage.removeItem(LS_MODEL);
      continue;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    sessionStorage.setItem(LS_MODEL, model);
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Attempt to extract and parse JSON from response
    try {
      let clean = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const start = clean.indexOf('{');
      const end = clean.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('No JSON object in response');
      clean = clean.substring(start, end + 1);
      const meal = JSON.parse(clean);
      // Validate required fields
      if (!meal.mealName || !meal.macros) throw new Error('Invalid meal schema in response');
      return { meal, model, rawText: null };
    } catch (_parseErr) {
      // AI returned plain text (e.g. a non-food query) — surface it as a text response
      return { meal: null, model, rawText: rawText || 'Sorry, I could not process that request.' };
    }
  }

  throw new Error('No compatible Gemini model found for your API key. Check your account at aistudio.google.com');
}

export default function AINutritionCoach({ onAddMeal }) {
  const [runtimeKey, setRuntimeKey] = useState(() =>
    VALID_ENV_KEY ? ENV_KEY : (localStorage.getItem(LS_KEY) || '')
  );
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [keyValid, setKeyValid] = useState(false);
  const [showKeySetup, setShowKeySetup] = useState(!runtimeKey);
  const [activeModel, setActiveModel] = useState(sessionStorage.getItem(LS_MODEL) || '');
  const [discovering, setDiscovering] = useState(false);

  const chatContainerRef = useRef(null);

  const [messages, setMessages] = useState([
    runtimeKey
      ? { id: 1, text: 'Welcome! I am your personal nutritionist companion. I can analyze your meals and generate highly accurate macronutrient profiles. What are you planning to eat today?', isBot: true }
      : { id: 1, text: null, isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const retryPayloadRef = useRef(null);

  useEffect(() => { if (!runtimeKey) setShowKeySetup(true); }, [runtimeKey]);

  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages, isTyping, retryCountdown]);

  useEffect(() => {
    if (retryCountdown <= 0) return;
    if (retryCountdown === 1 && retryPayloadRef.current) {
      const { userText } = retryPayloadRef.current;
      retryPayloadRef.current = null;
      setRetryCountdown(0);
      setIsTyping(true);
      callWithAutoModelNutrition(runtimeKey, userText)
        .then(({ meal, model, rawText }) => {
          if (model !== activeModel) setActiveModel(model);
          if (meal) {
            setMessages(prev => prev.filter(m => !m.isRetryCountdown).concat({
              id: Date.now(),
              text: `Here is a custom recommendation:\n\n**${meal.mealName}**\n🔥 ${meal.macros.calories} kcal | 🥩 ${meal.macros.protein}g P | 🍞 ${meal.macros.carbs}g C | 🥑 ${meal.macros.fat}g F\n\n💡 Tip: ${meal.healthTip}`,
              isBot: true,
              mealData: { name: meal.mealName, calories: meal.macros.calories, protein: meal.macros.protein, carbs: meal.macros.carbs, fats: meal.macros.fat },
            }));
          } else {
            setMessages(prev => prev.filter(m => !m.isRetryCountdown).concat({
              id: Date.now(), text: rawText, isBot: true,
            }));
          }
        })
        .catch(err => {
          setMessages(prev => prev.filter(m => !m.isRetryCountdown).concat({
            id: Date.now(), text: `Error: ${err.message}`, isBot: true, isError: true,
          }));
        })
        .finally(() => setIsTyping(false));
      return;
    }
    const t = setTimeout(() => {
      setRetryCountdown(c => c - 1);
      setMessages(prev => prev.map(m =>
        m.isRetryCountdown ? { ...m, text: `⏳ Rate limited — auto-retrying in ${retryCountdown - 1}s...` } : m
      ));
    }, 1000);
    return () => clearTimeout(t);
  }, [retryCountdown, runtimeKey]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) { setKeyError('Please paste your API key.'); return; }
    if (!trimmed.startsWith('AIza') || trimmed.length < 35) {
      setKeyError('Invalid format. Keys start with "AIza" and are 39+ characters.'); return;
    }
    localStorage.setItem(LS_KEY, trimmed);
    sessionStorage.removeItem(LS_MODEL);
    setActiveModel('');
    setRuntimeKey(trimmed);
    setKeyValid(true);
    setShowKeySetup(false);
    setKeyInput('');
    setMessages([{ id: Date.now(), text: 'Welcome! I am your personal nutritionist companion. I can analyze your meals and generate highly accurate macronutrient profiles. What are you planning to eat today?', isBot: true }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !runtimeKey || isTyping) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userText, isBot: false }]);
    setInput('');
    setIsTyping(true);

    try {
      const { meal, model, rawText } = await callWithAutoModelNutrition(runtimeKey, userText);
      if (model !== activeModel) setActiveModel(model);

      if (meal) {
        // Structured meal response
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: `Here is a custom recommendation:\n\n**${meal.mealName}**\n🔥 ${meal.macros.calories} kcal | 🥩 ${meal.macros.protein}g P | 🍞 ${meal.macros.carbs}g C | 🥑 ${meal.macros.fat}g F\n\n💡 Tip: ${meal.healthTip}`,
          isBot: true,
          mealData: { name: meal.mealName, calories: meal.macros.calories, protein: meal.macros.protein, carbs: meal.macros.carbs, fats: meal.macros.fat },
        }]);
      } else {
        // Plain-text fallback (non-food query or malformed JSON)
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: rawText,
          isBot: true,
        }]);
      }
    } catch (err) {
      console.error('Gemini Error:', err);
      const isAuthErr = err.message?.includes('API_KEY_INVALID') || err.message?.includes('403');
      const isQuota = err.message?.includes('quota') || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');
      if (isAuthErr) { setRuntimeKey(''); setShowKeySetup(true); localStorage.removeItem(LS_KEY); }
      if (isQuota) {
        const delay = parseRetryDelay(err.message);
        retryPayloadRef.current = { userText };
        setRetryCountdown(delay);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: `⏳ Rate limited — auto-retrying in ${delay}s...`,
          isBot: true, isError: true, isRetryCountdown: true,
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: isAuthErr ? '🔑 API key rejected. Please enter a valid key.' : `Error: ${err.message}`,
          isBot: true, isError: true,
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-2xl flex flex-col h-[550px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50">
      <div className="p-4 border-b border-gray-800 bg-[#252525] rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-orange-500" size={22} />
          <h3 className="text-xl font-bold text-white">AI Nutrition Coach</h3>
          {activeModel && (
            <span className="text-[10px] bg-orange-900/40 text-orange-300 border border-orange-700/40 px-2 py-0.5 rounded-full font-mono">
              {activeModel}
            </span>
          )}
        </div>
        {runtimeKey && (
          <button onClick={() => { setShowKeySetup(s => !s); setKeyInput(''); setKeyError(''); }}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
            <Key size={13} /> Change Key
          </button>
        )}
      </div>

      {showKeySetup && (
        <div className="m-4 mb-0 rounded-xl border border-orange-500/30 bg-orange-950/20 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Key className="text-orange-400 mt-0.5 shrink-0" size={16} />
            <div>
              <p className="text-sm font-semibold text-orange-200">Gemini API Key Required</p>
              <p className="text-xs text-gray-400 mt-0.5">Get a free key from Google AI Studio, then paste it below.</p>
            </div>
          </div>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 w-fit">
            <ExternalLink size={12} /> aistudio.google.com/app/apikey
          </a>
          <form onSubmit={handleSaveKey} className="flex gap-2">
            <input type="password" value={keyInput}
              onChange={e => { setKeyInput(e.target.value); setKeyError(''); setKeyValid(false); }}
              placeholder="Paste your AIza... key here"
              className="flex-1 bg-[#1a0f00] border border-orange-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
              Save
            </button>
          </form>
          {keyError && <p className="text-xs text-red-400">{keyError}</p>}
          {keyValid && <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Key saved!</p>}
        </div>
      )}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => !msg.text ? null : (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex items-start max-w-[85%] gap-2 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`p-2 rounded-full flex-shrink-0 ${msg.isBot ? (msg.isError ? 'bg-red-600/20 text-red-500' : 'bg-orange-600/20 text-orange-500') : 'bg-blue-600/20 text-blue-500'}`}>
                {msg.isBot ? (msg.isError ? <AlertCircle size={20} /> : <Bot size={20} />) : <User size={20} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap
                ${msg.isBot ? (msg.isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#2a2a2a] text-gray-200') : 'bg-blue-600 text-white'}
                ${msg.isBot ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                {msg.text}
                {msg.mealData && (
                  <button onClick={() => onAddMeal(msg.mealData)}
                    className="mt-3 flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-xs">
                    <Plus size={16} /> Add this to my log
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {(isTyping || discovering) && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-full bg-orange-600/20 text-orange-500">
                {discovering ? <Loader size={20} className="animate-spin" /> : <Bot size={20} />}
              </div>
              <div className="p-3 rounded-2xl bg-[#2a2a2a] rounded-tl-none flex items-center gap-2">
                {discovering
                  ? <span className="text-xs text-gray-400">Finding best model for your key...</span>
                  : [0, 0.2, 0.4].map((d, i) => (
                      <div key={i} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                    ))
                }
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-800 flex gap-2 bg-[#222] rounded-b-2xl">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder={runtimeKey && !showKeySetup ? 'E.g., High protein Indian dinner...' : 'Enter your API key above to start...'}
          disabled={!runtimeKey || isTyping || showKeySetup}
          className="flex-1 bg-[#2d2d2d] border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-40" />
        <button type="submit" disabled={!input.trim() || isTyping || !runtimeKey || showKeySetup}
          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
