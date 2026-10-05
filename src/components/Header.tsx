import React from 'react';
import { ConnectionStatus } from '../types';
import { Image as ImageIcon, Code2, MessageSquare, Copy, Check, Users } from 'lucide-react';

interface HeaderProps {
  roomName: string;
  setRoomName: (val: string) => void;
  status: ConnectionStatus;
  onConnectToggle: () => void;
  onOpenImagesModal: () => void;
  onOpenHtmlModal: () => void;
  isChatOpen: boolean;
  setIsChatOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  unreadChatCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  roomName,
  setRoomName,
  status,
  onConnectToggle,
  onOpenImagesModal,
  onOpenHtmlModal,
  isChatOpen,
  setIsChatOpen,
  unreadChatCount,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return `Status: Conectado (${roomName || 'sala-reuniao-1'})`;
      case 'connecting':
        return 'Status: Conectando...';
      case 'disconnected':
      default:
        return 'Status: Desconectado';
    }
  };

  const isConnected = status === 'connected';

  return (
    <header className="bg-[#202024] px-5 py-3 flex items-center justify-between border-b border-[#323238] gap-4 z-20 shrink-0">
      <div className="room-form flex items-center gap-2.5 flex-wrap">
        <label htmlFor="room-name" className="text-sm text-[#a8a8b3] font-medium whitespace-nowrap">
          Nome da Sala:
        </label>
        <div className="relative">
          <input
            type="text"
            id="room-name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConnectToggle();
            }}
            placeholder="Ex: sala-reuniao-1"
            autoComplete="off"
            disabled={status === 'connecting'}
            className="bg-[#121214] border border-[#323238] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#00875f] transition-colors w-48 sm:w-60"
          />
        </div>
        <button
          type="button"
          id="btn-connect"
          onClick={onConnectToggle}
          disabled={status === 'connecting'}
          className={`text-white border-none rounded px-4 py-2 text-sm font-semibold cursor-pointer transition-colors duration-200 flex items-center gap-1.5 ${
            isConnected
              ? 'bg-[#c53030] hover:bg-[#9b2c2c]'
              : 'bg-[#00875f] hover:bg-[#015f43]'
          }`}
        >
          {status === 'connecting' ? (
            'Conectando...'
          ) : isConnected ? (
            'Desconectar'
          ) : (
            'Conectar'
          )}
        </button>

        {/* Quick action buttons */}
        <button
          type="button"
          onClick={onOpenImagesModal}
          title="Adicionar ou alterar links diretos de imagens"
          className="bg-[#29292e] hover:bg-[#323238] border border-[#323238] hover:border-[#4d4d57] text-[#e1e1e6] rounded px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <ImageIcon className="w-4 h-4 text-[#00b37e]" />
          <span>Links de Imagens</span>
        </button>

        <button
          type="button"
          onClick={onOpenHtmlModal}
          title="Ver como adicionar links de imagens diretamente no HTML"
          className="bg-[#29292e] hover:bg-[#323238] border border-[#323238] hover:border-[#4d4d57] text-[#e1e1e6] rounded px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <Code2 className="w-4 h-4 text-[#79c0ff]" />
          <span className="hidden sm:inline">Exemplo HTML</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Connection status display matching requested UI */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected
                ? 'bg-[#00875f] shadow-[0_0_8px_#00875f]'
                : status === 'connecting'
                ? 'bg-[#e0a800] animate-ping'
                : 'bg-[#7c7c8a]'
            }`}
          />
          <span
            className={`connection-status text-[13px] ${
              isConnected ? 'text-[#00b37e] font-medium' : 'text-[#7c7c8a]'
            }`}
            id="connection-status"
          >
            {getStatusText()}
          </span>
        </div>

        {/* Copy room link */}
        <button
          onClick={handleCopyLink}
          title="Copiar link da sala"
          className="hidden md:flex items-center gap-1 text-xs bg-[#29292e] hover:bg-[#323238] text-[#a8a8b3] hover:text-white px-2.5 py-1.5 rounded border border-[#323238] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#00b37e]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
        </button>

        {/* Toggle Chat */}
        <button
          onClick={() => setIsChatOpen((prev) => !prev)}
          className={`relative p-2 rounded border border-[#323238] transition-colors ${
            isChatOpen ? 'bg-[#00875f] text-white' : 'bg-[#29292e] hover:bg-[#323238] text-[#e1e1e6]'
          }`}
          title="Bate-papo da reunião"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadChatCount > 0 && !isChatOpen && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#f75a68] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadChatCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
