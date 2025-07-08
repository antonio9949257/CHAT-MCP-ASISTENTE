"use client";

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ author: 'user' | 'bot'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const newMessages = [...messages, { author: 'user' as const, content: prompt }];
    setMessages(newMessages);
    setPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: newMessages }),
      });

      const data = await response.json();
      setMessages([...newMessages, { author: 'bot' as const, content: data.response }]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages([...newMessages, { author: 'bot' as const, content: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-4 bg-white rounded-lg shadow-md">
        <div className="mb-4 h-96 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`chat ${msg.author === 'user' ? 'chat-end' : 'chat-start'}`}>
              <div className="chat-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat chat-start">
              <div className="chat-bubble">
                <span className="loading loading-dots loading-md"></span>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about a product (e.g., 'How much is laptop-01?')"
            className="input input-bordered w-full"
            disabled={isLoading}
          />
          <button type="submit" className="btn btn-primary ml-2" disabled={isLoading}>
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
