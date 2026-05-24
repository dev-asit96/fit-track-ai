import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Bot, User, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AICoach = () => {
  const { settings, workouts, meals, progress } = useData();
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hi! I'm your FitTrack AI Coach. Ask me anything about your diet, workouts, or fat-loss progress!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const apiKeyToUse = (settings?.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '').trim();
    if (!input.trim() || !apiKeyToUse) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKeyToUse);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const contextStr = `User Goal: ${settings?.goal || 'Fat Loss'}, Target Weight: ${settings?.weightTarget || 70}kg, Current Weight: ${progress.length > 0 ? progress[progress.length-1].weight : 'unknown'}kg. Recent workouts: ${workouts.slice(-3).map(w => w.name).join(', ') || 'none yet'}. Be concise, motivational, and act as a professional fitness coach.`;

      const prompt = `System Context: ${contextStr}\n\nUser Question: ${userMessage}`;
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const hasApiKey = Boolean(settings?.apiKey || import.meta.env.VITE_GEMINI_API_KEY);

  if (!hasApiKey) {
    return (
      <div className="space-y-6 pb-12 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Bot className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold">AI Coach Setup</h1>
        <p className="text-textMuted max-w-md">
          To enable your personal AI coach, please add your Google Gemini API key in the settings.
        </p>
        <a href="/settings" className="btn-primary mt-4 inline-block">Go to Settings</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-6rem)] pb-16 md:pb-0">
      <header className="mb-4 shrink-0 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-secondary to-accent rounded-xl flex items-center justify-center shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">FitTrack Coach</h1>
          <p className="text-xs text-accent flex items-center gap-1"><Sparkles className="w-3 h-3" /> Powered by Gemini AI</p>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-sm' 
                : 'bg-surfaceHighlight border border-white/5 rounded-tl-sm text-text'
            }`}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className="mb-2 last:mb-0 leading-relaxed">{line}</p>
              ))}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surfaceHighlight rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
              <span className="text-textMuted text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="shrink-0 relative">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask for workout advice, meal ideas..." 
          className="w-full bg-surface border border-white/10 rounded-2xl py-4 pl-4 pr-16 focus:outline-none focus:border-secondary shadow-lg transition-colors"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isTyping}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-secondary hover:bg-secondary/80 disabled:bg-surfaceHighlight disabled:text-textMuted rounded-xl flex items-center justify-center text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AICoach;
