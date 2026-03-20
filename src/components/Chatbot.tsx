import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2, Bot, User, Calendar, Info, RotateCcw } from 'lucide-react';

const MAX_INPUT_LENGTH = 500;

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hi! I'm Sparkle, your Broom & Box assistant. How can I help you with your cleaning needs today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: "Hi! I'm Sparkle, your Broom & Box assistant. How can I help you with your cleaning needs today?",
      timestamp: new Date()
    }]);
    setInput('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get response');

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.text || "I'm sorry, I'm having a bit of trouble connecting. Could you try that again?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error("Chatbot Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: error.message?.includes('not configured')
          ? "Sparkle is currently offline (API key missing). Please contact us directly at (214) 433-2703! 📞"
          : "Oops! Something went wrong on my end. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">Sparkle Assistant</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] opacity-80">Online & Ready to Help</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-white border border-gray-100 text-primary shadow-sm'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white border border-gray-100 text-ink rounded-tl-none shadow-sm'
                      }`}>
                      {msg.text}
                      <div className={`text-[9px] mt-1 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 text-primary shadow-sm flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-white border-t border-gray-50">
              <button
                onClick={() => setInput("How much for a house cleaning?")}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-surface border border-gray-100 text-[11px] font-medium text-ink-muted hover:border-primary hover:text-primary transition-all flex items-center gap-1.5"
              >
                <Info className="w-3 h-3" />
                Pricing?
              </button>
              <button
                onClick={() => setInput("I want to book an appointment")}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-surface border border-gray-100 text-[11px] font-medium text-ink-muted hover:border-primary hover:text-primary transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3 h-3" />
                Book Now
              </button>
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                  placeholder="Type your message..."
                  maxLength={MAX_INPUT_LENGTH}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {input.length > 400 && (
                <div className={`text-[10px] mt-1 text-right ${input.length >= MAX_INPUT_LENGTH ? 'text-red-500' : 'text-slate-400'}`}>
                  {input.length}/{MAX_INPUT_LENGTH}
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageSquare className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-4 px-3 py-1.5 bg-ink text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            Questions? Chat with Sparkle!
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-ink rotate-45" />
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
