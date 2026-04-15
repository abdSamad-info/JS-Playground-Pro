import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { geminiService } from '@/services/geminiService';
import { Send, Bot, User, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant: React.FC = () => {
  const { files, setAIPanelVisible } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI coding assistant. How can I help you with your JavaScript project today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const context = files.map(f => `File: ${f.name}\nLanguage: ${f.language}\nContent:\n${f.content}`).join('\n\n---\n\n');
      const response = await geminiService.chat(userMessage, context);
      setMessages(prev => [...prev, { role: 'assistant', content: response || 'Sorry, I couldn\'t generate a response.' }]);
    } catch (error) {
      toast.error('Failed to get AI response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to connect to AI service. Please check your API key.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#252526] border-l border-[#454545]">
      <div className="h-[35px] border-b border-[#454545] flex items-center justify-between px-3 bg-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#888]">AI Assistant</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-[#858585] hover:text-white"
          onClick={() => setAIPanelVisible(false)}
        >
          <X size={14} />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "flex gap-3 max-w-[90%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-[#007acc]" : "bg-purple-600"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "p-3 rounded-lg text-[13px] leading-relaxed",
                msg.role === 'user' ? "bg-[#37373d] text-white" : "bg-[#2d2d2d] text-[#cccccc] border border-[#454545]"
              )}>
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 mr-auto">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-3 rounded-lg bg-[#2d2d2d] border border-[#454545] flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-purple-400" />
                <span className="text-[13px] text-[#888]">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#454545] bg-[#2d2d2d]">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI to help with code..."
            className="w-full bg-[#1e1e1e] border border-[#454545] rounded-md p-3 pr-10 text-[13px] text-white focus:outline-none focus:border-[#007acc] resize-none min-h-[80px]"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 h-7 w-7 bg-[#007acc] hover:bg-[#007acc]/90 text-white"
          >
            <Send size={14} />
          </Button>
        </div>
        <p className="text-[10px] text-[#858585] mt-2 text-center">
          Powered by Gemini 3.1 Pro
        </p>
      </div>
    </div>
  );
};
