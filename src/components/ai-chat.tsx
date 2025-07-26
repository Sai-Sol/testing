"use client";

import { useState } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { chat } from '@/ai/flows/chat-flow';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

type Message = {
    role: 'user' | 'model';
    content: string;
};

export function AiChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // We only need to send the current user message to the flow
            const response = await chat(input);
            const modelMessage: Message = { role: 'model', content: response };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Bot className="h-5 w-5" />
                    <span className="sr-only">Open AI Chat</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 font-headline text-2xl">
                        <Bot className="text-primary" /> QuantumAI Chat
                    </SheetTitle>
                    <SheetDescription>
                        Your AI assistant for all things quantum. Ask me anything!
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        <div className="flex flex-col gap-4 py-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'model' && (
                                         <Avatar className="w-8 h-8 border-2 border-primary/50">
                                            <AvatarFallback className="bg-primary/20"><Bot size={18} className="text-primary"/></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                    {msg.role === 'user' && user && (
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback>{user.email.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border-2 border-primary/50">
                                       <AvatarFallback className="bg-primary/20"><Bot size={18} className="text-primary"/></AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-lg px-4 py-2 bg-muted">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                <div className="flex items-center gap-2 p-2 border-t">
                    <Input 
                        placeholder="Type your message..." 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
