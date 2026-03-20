import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import AppIcon from './AppIcon';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface AiLogisticsAssistantProps {
  onClose?: () => void;
  isFloating?: boolean;
}

export default function AiLogisticsAssistant({ onClose, isFloating = false }: AiLogisticsAssistantProps) {
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
        <article className={`flex flex-col h-[500px] border border-slate-200/60 shadow-xl overflow-hidden p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl dark:border-slate-800/60 relative group transition-all hover:shadow-2xl ${isFloating ? 'w-[380px] max-w-[calc(100vw-32px)]' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Header */}
            <div className="bg-slate-900 dark:bg-slate-950/80 p-4 flex items-center justify-between border-b border-slate-800/60 relative z-10">
                <div className="flex items-center gap-3 relative">
                    <div className="relative">
                        <div className="absolute inset-0 bg-teal-400/30 blur-lg rounded-full animate-pulse" />
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-800 flex items-center justify-center border border-teal-500/30 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-teal-400/10 animate-pulse" />
                            <AppIcon name="ai-extract" className="h-5 w-5 text-teal-400 relative z-10" strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                           <h3 className="text-white text-sm font-black tracking-[0.05em] uppercase">ExporTrack AI</h3>
                           <span className="px-1.5 py-0.5 rounded-md bg-teal-500/20 text-[8px] font-black text-teal-400 border border-teal-500/20 uppercase tracking-widest">v4.2</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
                            </span>
                            <p className="text-[9px] text-teal-400/90 font-bold uppercase tracking-widest">Neural Link Active</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 opacity-30 group-hover:opacity-60 transition-opacity">
                        <div className="flex gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-[bounce_2s_infinite]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-[bounce_2s_infinite_100ms]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-[bounce_2s_infinite_200ms]"></span>
                        </div>
                    </div>
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="ml-2 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                            title="Close Assistant"
                        >
                            <AppIcon name="x" className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-50/50 dark:bg-slate-950/20 relative z-10 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
            >
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex w-full animate-in fade-in slide-in-from-bottom-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                            <div 
                                className={`p-3 text-xs font-medium leading-relaxed shadow-sm relative ${
                                    msg.sender === 'user' 
                                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-2xl rounded-tr-sm' 
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl rounded-tl-sm'
                                }`}
                            >
                                {msg.text}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 px-1 px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start w-full animate-in fade-in">
                        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center justify-center">
                            <div className="flex gap-1.5">
                                <div className="h-1.5 w-1.5 bg-slate-300 dark:bg-slate-500 rounded-full animate-bounce"></div>
                                <div className="h-1.5 w-1.5 bg-slate-300 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="h-1.5 w-1.5 bg-slate-300 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative z-10">
                <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-transparent shadow-inner focus-within:border-teal-500/30 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about shipments, risks, or docs..."
                        className="flex-1 bg-transparent border-none rounded-xl py-2.5 pl-4 pr-12 text-xs font-semibold focus:ring-0 outline-none w-full text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim()}
                        className={`absolute right-1.5 h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                            input.trim() 
                            ? 'bg-teal-500 text-white shadow-sm hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 hover:scale-105' 
                            : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                        }`}
                    >
                        <AppIcon name="arrow-right" className="w-3.5 h-3.5" strokeWidth={3} />
                    </button>
                </div>
                <div className="flex justify-center mt-2.5">
                   <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <AppIcon name="ai-extract" className="h-2.5 w-2.5" />
                      Powered by Logistic-LLM v4
                   </p>
                </div>
            </form>
        </article>
    );
}
