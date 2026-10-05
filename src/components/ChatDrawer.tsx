import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { X, Send, User } from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  roomName: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  roomName,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#202024] border-l border-[#323238] z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#323238] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Chat da Reunião</h3>
          <p className="text-[11px] text-[#a8a8b3] truncate max-w-[200px]">
            Sala: {roomName || 'sala-reuniao-1'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[#a8a8b3] hover:text-white p-1 rounded hover:bg-[#323238] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isLocal = msg.senderId === 'local';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isLocal ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[11px] text-[#a8a8b3]">
                <span className="font-semibold text-white/90">{msg.senderName}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              <div
                className={`px-3 py-2 rounded-lg text-xs leading-relaxed max-w-[85%] break-words ${
                  isLocal
                    ? 'bg-[#00875f] text-white rounded-tr-none'
                    : 'bg-[#29292e] text-[#e1e1e6] border border-[#323238] rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#323238] bg-[#18181b] flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enviar mensagem para todos..."
          className="flex-1 bg-[#121214] border border-[#323238] focus:border-[#00875f] rounded-md px-3 py-2 text-white text-xs outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-[#00875f] hover:bg-[#015f43] disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
