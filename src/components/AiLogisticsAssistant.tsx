import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import AppIcon from './AppIcon';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function AiLogisticsAssistant() {
  const { state: { shipments } } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your ExporTrack-AI Operations Assistant. How can I help you with your shipments today?",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // AI Logic
    setTimeout(() => {
      const responseText = generateAiResponse(input.toLowerCase(), shipments);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAiResponse = (query: string, shipments: any[]): string => {
    if (query.includes('missing') || query.includes('document')) {
      const missingCount = shipments.reduce((acc, s) => acc + s.documents.filter((d: any) => d.status === 'Missing').length, 0);
      return `I've analyzed all shipments. There are currently ${missingCount} documents marked as 'Missing'. The most critical ones are in shipment ${shipments[0]?.id}.`;
    }
    
    if (query.includes('risk') || query.includes('delay')) {
      const highRisk = shipments.filter(s => s.delayed).length;
      return `Currently, ${highRisk} shipments are showing high delay risks. We should focus on ${shipments.find(s => s.delayed)?.id || 'the active queue'} due to congestion reports.`;
    }

    if (query.includes('shipment') || query.includes('status')) {
      const active = shipments.filter(s => s.status !== 'Delivered').length;
      return `You have ${active} active shipments. ${shipments[0]?.id} is currently ${shipments[0]?.status}.`;
    }

    if (query.includes('progress') || query.includes('verification')) {
      const verified = shipments.reduce((acc, s) => acc + s.documents.filter((d: any) => d.status === 'Verified').length, 0);
      const total = shipments.reduce((acc, s) => acc + s.documents.length, 0);
      const pct = Math.round((verified / (total || 1)) * 100);
      return `Global verification progress is at ${pct}%. We completed ${verified} document checks out of ${total} total files uploaded.`;
    }

    return "I can help you with shipment tracking, document compliance, and risk assessments. Could you be more specific? For example: 'Which shipments are at risk?'";
  };

  return (
    <article className="card-panel flex flex-col h-[500px] border-none shadow-2xl overflow-hidden p-0 bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-950 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
            <AppIcon name="ai-extract" className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-widest">Ops Intelligence</h3>
            <p className="text-[10px] text-teal-400 font-black animate-pulse uppercase">AI Engine Online</p>
          </div>
        </div>
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/40"></span>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-50/50 dark:bg-slate-950/20"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-navy-700 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
              }`}
            >
              {msg.text}
              <p className={`text-[8px] mt-1.5 opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700">
              <div className="flex gap-1">
                <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about shipments, risks, or docs..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 text-xs focus:ring-2 focus:ring-teal-500/50 outline-none transition-all dark:text-slate-100"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1.5 h-8 w-8 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-[9px] text-slate-400 mt-2 text-center font-bold uppercase tracking-tight">Powered by Logistic-LLM v4</p>
      </form>
    </article>
  );
}
