import React, { useRef, useEffect } from 'react';
import { Participant } from '../types';
import { Mic, MicOff, Video, VideoOff, Maximize2, Minimize2, Edit3, Image as ImageIcon, Volume2, VolumeX, Monitor } from 'lucide-react';

interface VideoCardProps {
  participant: Participant;
  mediaStream: MediaStream | null;
  onEditParticipant: (participant: Participant) => void;
  onToggleMic?: () => void;
  onToggleCamera?: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  participant,
  mediaStream,
  onEditParticipant,
  onToggleMic,
  onToggleCamera,
  isPinned,
  onTogglePin,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMutedByMe, setIsMutedByMe] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Bind stream to video element when available
  useEffect(() => {
    if (!videoRef.current) return;

    if (mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((err) => {
        console.warn('Video play warning:', err);
      });
    } else if (!participant.isLocal && participant.videoSampleUrl && participant.feedMode === 'video_sample') {
      videoRef.current.src = participant.videoSampleUrl;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }
  }, [participant.isLocal, mediaStream, participant.videoSampleUrl, participant.feedMode]);

  // If camera is OFF or feedMode is 'image', or if stream is unavailable and feedMode is 'camera'
  const showDirectImage =
    participant.feedMode === 'image' ||
    !participant.isCameraOn ||
    (!mediaStream && participant.feedMode === 'camera');

  const cardId = participant.isLocal
    ? 'card-local-video'
    : `card-${participant.id}-video`;

  const videoId = participant.isLocal
    ? 'local-video'
    : participant.id === 'remote-1'
    ? 'remote-video-1'
    : participant.id === 'remote-2'
    ? 'remote-video-2'
    : 'remote-video-3';

  const labelId = participant.isLocal
    ? 'label-local'
    : participant.id === 'remote-1'
    ? 'label-remote-1'
    : participant.id === 'remote-2'
    ? 'label-remote-2'
    : 'label-remote-3';

  return (
    <div
      id={cardId}
      className={`video-card relative bg-[#202024] border rounded-lg overflow-hidden flex items-center justify-center group transition-all duration-300 ${
        participant.isSpeaking
          ? 'border-[#00875f] ring-2 ring-[#00875f]/50 shadow-[0_0_15px_rgba(0,135,95,0.25)]'
          : 'border-[#323238] hover:border-[#4d4d57]'
      } ${isPinned ? 'col-span-2 row-span-2' : ''}`}
    >
      {/* Visual Content: Direct Image vs Video */}
      {showDirectImage ? (
        <div className="w-full h-full relative bg-[#121214] flex items-center justify-center overflow-hidden">
          {!imageError ? (
            <img
              id={videoId}
              src={participant.directImageUrl}
              alt={participant.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            // Fallback if user's direct image URL has network/CORS error
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#18181b]">
              <div className="w-24 h-24 rounded-full bg-[#29292e] border border-[#323238] flex items-center justify-center text-3xl font-bold text-[#00b37e] mb-3">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs text-[#a8a8b3]">Imagem não carregou</p>
              <button
                onClick={() => onEditParticipant(participant)}
                className="mt-2 text-[11px] text-[#00b37e] hover:underline cursor-pointer"
              >
                Trocar link da imagem
              </button>
            </div>
          )}

          {/* Badge when direct image is used */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] text-[#a8a8b3] flex items-center gap-1.5 border border-white/10 pointer-events-none">
            <ImageIcon className="w-3 h-3 text-[#00b37e]" />
            <span>Link Direto de Imagem</span>
          </div>
        </div>
      ) : (
        <video
          id={videoId}
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal || isMutedByMe}
          className={`w-full h-full object-cover bg-black ${participant.isLocal ? 'scale-x-[-1]' : ''}`}
        />
      )}

      {/* Screen Sharing Indicator */}
      {participant.isScreenSharing && (
        <div className="absolute top-3 right-3 bg-[#00875f]/90 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 shadow-md">
          <Monitor className="w-3.5 h-3.5" />
          <span>Tela Compartilhada</span>
        </div>
      )}

      {/* Floating Hover Controls on Top Right */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-md border border-white/10 shadow-lg z-10">
        <button
          type="button"
          onClick={() => onEditParticipant(participant)}
          title="Editar nome ou link de imagem direta"
          className="p-1.5 hover:bg-white/10 text-white rounded transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        {!participant.isLocal && (
          <button
            type="button"
            onClick={() => setIsMutedByMe(!isMutedByMe)}
            title={isMutedByMe ? 'Desmutar áudio' : 'Mutar áudio'}
            className="p-1.5 hover:bg-white/10 text-white rounded transition-colors"
          >
            {isMutedByMe ? (
              <VolumeX className="w-3.5 h-3.5 text-[#f75a68]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {participant.isLocal && onToggleCamera && (
          <button
            type="button"
            onClick={onToggleCamera}
            title={participant.isCameraOn ? 'Desligar Câmera (Usar Imagem)' : 'Ligar Câmera'}
            className="p-1.5 hover:bg-white/10 text-white rounded transition-colors"
          >
            {participant.isCameraOn ? (
              <Video className="w-3.5 h-3.5 text-[#00b37e]" />
            ) : (
              <VideoOff className="w-3.5 h-3.5 text-[#f75a68]" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onTogglePin}
          title={isPinned ? 'Restaurar grade 2x2' : 'Fixar / Expandir'}
          className="p-1.5 hover:bg-white/10 text-white rounded transition-colors"
        >
          {isPinned ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Bottom-left label matching exact CSS of requested mock */}
      <span
        id={labelId}
        className="video-label absolute bottom-2 left-2 bg-[rgba(0,0,0,0.7)] text-[#e1e1e6] px-2 py-1 rounded text-xs font-medium pointer-events-none flex items-center gap-2 border border-white/5 backdrop-blur-sm"
      >
        <span>{participant.name}</span>

        {/* Audio Wave / Speaking Indicator */}
        {participant.isSpeaking && participant.isMicOn && (
          <span className="flex items-center gap-0.5 h-3 px-1">
            <span className="w-0.5 h-2 bg-[#00b37e] rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-0.5 h-3 bg-[#00b37e] rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-0.5 h-1.5 bg-[#00b37e] rounded-full animate-bounce [animation-delay:300ms]" />
          </span>
        )}

        {/* Mic status icon */}
        {!participant.isMicOn && (
          <span title="Microfone desligado" className="flex items-center">
            <MicOff className="w-3 h-3 text-[#f75a68]" />
          </span>
        )}
      </span>
    </div>
  );
};
