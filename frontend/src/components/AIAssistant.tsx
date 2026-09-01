import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendAIChatMessage } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi! I am the NoirLink AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: sendAIChatMessage,
    onSuccess: (data) => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data?.response || 'I am not sure how to answer that.' }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' }]);
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    mutation.mutate(userMsg.content);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 p-4 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[70vh] bg-card border shadow-2xl rounded-2xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between sticky top-0 bg-card rounded-t-2xl">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            NoirLink Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-75" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-150" />
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t bg-card rounded-b-2xl">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              placeholder="Ask me anything..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              className="rounded-full"
            />
            <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!input.trim() || mutation.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
