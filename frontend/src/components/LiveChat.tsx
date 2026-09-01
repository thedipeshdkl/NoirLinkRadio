import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: number;
  nickname: string;
  message: string;
  createdAt: string;
}

export function LiveChat() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const newSocket = io(apiUrl.replace('/api', ''), {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_chat');
    });

    newSocket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history);
      scrollToBottom();
    });

    newSocket.on('new_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;

    socket.emit('send_message', {
      nickname: user ? (user as any).name || 'Listener' : 'Guest',
      message: inputValue,
    });
    setInputValue('');
  };

  return (
    <Card className="flex flex-col h-[500px] border-border/50 shadow-xl bg-card">
      <CardHeader className="py-4 border-b">
        <CardTitle className="text-lg flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-primary" />
          Live Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No messages yet. Be the first to say hello!
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <div className="flex items-baseline space-x-2">
                  <span className="font-bold text-sm text-primary">{msg.nickname}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm mt-1 bg-secondary/30 p-2 rounded-md rounded-tl-none break-words">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 border-t bg-secondary/10">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
