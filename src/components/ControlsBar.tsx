import React from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Image, Settings, Sparkles } from 'lucide-react';

interface ControlsBarProps {
  isMicOn: boolean;
  onToggleMic: () => void;
  isCameraOn: boolean;
  onToggleCamera: () => void;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
  onOpenImagesModal: () => void;
  onSimulateSpeakingToggle: () => void;
  isSimulatingSpeaking: boolean;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isMicOn,
  onToggleMic,
  isCameraOn,
  onToggleCamera,
  isScreenSharing,
  onToggleScreenShare,
  onOpenImagesModal,
  onSimulateSpeakingToggle,
  isSimulatingSpeaking,
}) => {
  return (
    <footer id="controls-bar" className="bg-[#202024] border-t border-[#323238] px-5 py-3 flex justify-center items-center gap-3 sm:gap-4 flex-wrap z-20 shrink-0">
      {/* Botão Microfone - exact id and class requested */}
      <button
        type="button"
        id="btn-toggle-mic"
        onClick={onToggleMic}
        className={`control-btn bg-[#323238] text-[#e1e1e6] border rounded-md px-4 py-2.5 text-sm font-medium cursor-pointer inline-flex items-center gap-2 transition-all duration-200 select-none ${
          !isMicOn
            ? 'border-[#f75a68]/70 bg-[#2e1d21] text-[#f75a68] hover:bg-[#3a2228]'
            : 'border-[#4d4d57] hover:bg-[#3e3e46] hover:border-[#7c7c8a]'
        }`}
      >
        {isMicOn ? (
          <Mic className="w-4 h-4 text-[#00b37e]" />
        ) : (
          <MicOff className="w-4 h-4 text-[#f75a68]" />
        )}
        <span>{isMicOn ? 'Desligar Microfone' : 'Ligar Microfone'}</span>
      </button>

      {/* Botão Câmera / Imagem Direta */}
      <button
        type="button"
        id="btn-toggle-camera"
        onClick={onToggleCamera}
        className={`control-btn bg-[#323238] text-[#e1e1e6] border rounded-md px-4 py-2.5 text-sm font-medium cursor-pointer inline-flex items-center gap-2 transition-all duration-200 select-none ${
          !isCameraOn
            ? 'border-[#00875f]/50 bg-[#192b23] text-[#00b37e] hover:bg-[#20362c]'
            : 'border-[#4d4d57] hover:bg-[#3e3e46] hover:border-[#7c7c8a]'
        }`}
        title={isCameraOn ? 'Desligar câmera e mostrar imagem' : 'Ligar câmera'}
      >
        {isCameraOn ? (
          <Video className="w-4 h-4 text-[#00b37e]" />
        ) : (
          <VideoOff className="w-4 h-4 text-[#a8a8b3]" />
        )}
        <span>{isCameraOn ? 'Câmera Ligada' : 'Usando Imagem'}</span>
      </button>

      {/* Botão Compartilhar Tela - exact id and class requested */}
      <button
        type="button"
        id="btn-share-screen"
        onClick={onToggleScreenShare}
        className={`control-btn bg-[#323238] text-[#e1e1e6] border rounded-md px-4 py-2.5 text-sm font-medium cursor-pointer inline-flex items-center gap-2 transition-all duration-200 select-none ${
          isScreenSharing
            ? 'border-[#00875f] bg-[#00875f]/20 text-[#00b37e]'
            : 'border-[#4d4d57] hover:bg-[#3e3e46] hover:border-[#7c7c8a]'
        }`}
      >
        {isScreenSharing ? (
          <MonitorOff className="w-4 h-4 text-[#00b37e]" />
        ) : (
          <Monitor className="w-4 h-4 text-[#a8a8b3]" />
        )}
        <span>{isScreenSharing ? 'Parar Compartilhamento' : 'Compartilhar Tela'}</span>
      </button>

      {/* Botão Gerenciar Links Diretos de Imagem */}
      <button
        type="button"
        onClick={onOpenImagesModal}
        className="control-btn bg-[#323238] text-[#e1e1e6] border border-[#4d4d57] hover:border-[#7c7c8a] hover:bg-[#3e3e46] rounded-md px-4 py-2.5 text-sm font-medium cursor-pointer inline-flex items-center gap-2 transition-all duration-200 select-none"
        title="Personalizar URLs de imagens para os 4 participantes"
      >
        <Image className="w-4 h-4 text-[#00b37e]" />
        <span className="hidden sm:inline">Links das Imagens</span>
        <span className="sm:hidden">Imagens</span>
      </button>

      {/* Botão Simular Voz / Animação */}
      <button
        type="button"
        onClick={onSimulateSpeakingToggle}
        className={`control-btn hidden lg:inline-flex bg-[#323238] text-[#e1e1e6] border rounded-md px-3 py-2.5 text-xs font-medium cursor-pointer items-center gap-1.5 transition-all duration-200 ${
          isSimulatingSpeaking
            ? 'border-[#00875f] text-[#00b37e] bg-[#00875f]/10'
            : 'border-[#4d4d57] hover:bg-[#3e3e46] text-[#a8a8b3]'
        }`}
        title="Simular atividade de voz dos participantes"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{isSimulatingSpeaking ? 'Voz Ativa' : 'Simular Falas'}</span>
      </button>
    </footer>
  );
};
