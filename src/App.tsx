import React, { useState, useEffect, useRef } from 'react';
import { Participant, ConnectionStatus, ChatMessage } from './types';
import { Header } from './components/Header';
import { VideoCard } from './components/VideoCard';
import { ControlsBar } from './components/ControlsBar';
import { ImageLinksModal } from './components/ImageLinksModal';
import { HtmlSnippetModal } from './components/HtmlSnippetModal';
import { ChatDrawer } from './components/ChatDrawer';
import { PRESET_IMAGE_OPTIONS, PRESET_SAMPLE_VIDEOS } from './data/presetImages';

export default function App() {
  const [roomName, setRoomName] = useState('sala-reuniao-1');
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false); // default to direct image so preview is immediately beautiful!
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);

  // Modals state
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const [editingParticipantId, setEditingParticipantId] = useState<string | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSimulatingSpeaking, setIsSimulatingSpeaking] = useState(true);

  // Media Streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // 4 participants matching the 2x2 grid requested
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'local',
      name: 'Você (Local)',
      isLocal: true,
      isMicOn: true,
      isCameraOn: false, // Default to direct image as shown in prompt
      isSpeaking: false,
      isScreenSharing: false,
      feedMode: 'image',
      directImageUrl: PRESET_IMAGE_OPTIONS[0].url,
    },
    {
      id: 'remote-1',
      name: 'Amigo 1',
      isLocal: false,
      isMicOn: true,
      isCameraOn: false,
      isSpeaking: false,
      isScreenSharing: false,
      feedMode: 'image',
      directImageUrl: PRESET_IMAGE_OPTIONS[1].url,
      videoSampleUrl: PRESET_SAMPLE_VIDEOS.amigo1,
    },
    {
      id: 'remote-2',
      name: 'Amigo 2',
      isLocal: false,
      isMicOn: true,
      isCameraOn: false,
      isSpeaking: false,
      isScreenSharing: false,
      feedMode: 'image',
      directImageUrl: PRESET_IMAGE_OPTIONS[2].url,
      videoSampleUrl: PRESET_SAMPLE_VIDEOS.amigo2,
    },
    {
      id: 'remote-3',
      name: 'Amigo 3',
      isLocal: false,
      isMicOn: true,
      isCameraOn: false,
      isSpeaking: false,
      isScreenSharing: false,
      feedMode: 'image',
      directImageUrl: PRESET_IMAGE_OPTIONS[3].url,
      videoSampleUrl: PRESET_SAMPLE_VIDEOS.amigo3,
    },
  ]);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderId: 'system',
      senderName: 'Sistema',
      text: 'Conectado à sala de reunião WebRTC.',
      timestamp: 'Agora',
      isSystem: true,
    },
    {
      id: 'msg-2',
      senderId: 'remote-1',
      senderName: 'Amigo 1',
      text: 'Olá! Conseguiu adicionar os links diretos para as imagens?',
      timestamp: '10:52',
    },
    {
      id: 'msg-3',
      senderId: 'remote-2',
      senderName: 'Amigo 2',
      text: 'Sim! Fica ótimo usando tanto a tag <img> quanto poster no <video>!',
      timestamp: '10:53',
    },
  ]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Setup / toggle real user media when camera is turned on
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isMicOn,
        });
        setLocalStream(stream);
        setIsCameraOn(true);
        setParticipants((prev) =>
          prev.map((p) => (p.isLocal ? { ...p, isCameraOn: true, feedMode: 'camera' } : p))
        );
      }
    } catch (err) {
      console.warn('Câmera indisponível ou permissão não concedida, mantendo imagem direta:', err);
      // Graceful notification / stay in image mode
      setIsCameraOn(false);
      setParticipants((prev) =>
        prev.map((p) => (p.isLocal ? { ...p, isCameraOn: false, feedMode: 'image' } : p))
      );
    }
  };

  const stopCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setIsCameraOn(false);
    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, isCameraOn: false, feedMode: 'image' } : p))
    );
  };

  const handleToggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Toggle Mic
  const handleToggleMic = () => {
    const nextMicState = !isMicOn;
    setIsMicOn(nextMicState);

    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = nextMicState;
      });
    }

    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, isMicOn: nextMicState } : p))
    );
  };

  // Screen Share
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      setParticipants((prev) =>
        prev.map((p) => (p.isLocal ? { ...p, isScreenSharing: false } : p))
      );
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setScreenStream(stream);
          setIsScreenSharing(true);
          setParticipants((prev) =>
            prev.map((p) => (p.isLocal ? { ...p, isScreenSharing: true } : p))
          );

          // Stop screen share when browser stop sharing button is clicked
          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            setParticipants((prev) =>
              prev.map((p) => (p.isLocal ? { ...p, isScreenSharing: false } : p))
            );
          };
        } else {
          // Simulated screen share for environments without getDisplayMedia
          setIsScreenSharing(true);
          setParticipants((prev) =>
            prev.map((p) =>
              p.isLocal
                ? {
                    ...p,
                    isScreenSharing: true,
                    directImageUrl: PRESET_IMAGE_OPTIONS[5].url, // Dashboard screenshare preset
                    feedMode: 'image',
                  }
                : p
            )
          );
        }
      } catch (err) {
        console.warn('Screen share canceled or not permitted:', err);
      }
    }
  };

  // Connect / Disconnect room toggle
  const handleConnectToggle = () => {
    if (status === 'connected') {
      setStatus('disconnected');
      stopCamera();
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
    } else {
      setStatus('connecting');
      setTimeout(() => {
        setStatus('connected');
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            senderId: 'system',
            senderName: 'Sistema',
            text: `Você entrou na sala "${roomName || 'sala-reuniao-1'}"`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
          },
        ]);
      }, 600);
    }
  };

  // Simulate speaking activity among participants when active
  useEffect(() => {
    if (!isSimulatingSpeaking || status !== 'connected') {
      setParticipants((prev) => prev.map((p) => ({ ...p, isSpeaking: false })));
      return;
    }

    const interval = setInterval(() => {
      const luckyIndex = Math.floor(Math.random() * participants.length);
      setParticipants((prev) =>
        prev.map((p, idx) => ({
          ...p,
          isSpeaking: idx === luckyIndex && p.isMicOn,
        }))
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulatingSpeaking, status, participants.length]);

  // Update participant details (image link, name, feedMode)
  const handleUpdateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // Open edit modal for specific participant
  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipantId(participant.id);
    setIsImagesModalOpen(true);
  };

  // Send chat message
  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'local',
      senderName: 'Você',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Simulate reply from a friend after a delay
    setTimeout(() => {
      const friends = ['Amigo 1', 'Amigo 2', 'Amigo 3'];
      const randomFriend = friends[Math.floor(Math.random() * friends.length)];
      const replies = [
        'Perfeito! O link da imagem carregou super rápido.',
        'Conexão estável e visualização nítida!',
        'Excelente qualidade visual na grade de vídeos!',
        'Recebido aqui com sucesso!',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const friendMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'remote',
        senderName: randomFriend,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, friendMsg]);
      if (!isChatOpen) {
        setUnreadChatCount((c) => c + 1);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#121214] text-[#e1e1e6] font-sans">
      {/* Cabeçalho */}
      <Header
        roomName={roomName}
        setRoomName={setRoomName}
        status={status}
        onConnectToggle={handleConnectToggle}
        onOpenImagesModal={() => {
          setEditingParticipantId(undefined);
          setIsImagesModalOpen(true);
        }}
        onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
        isChatOpen={isChatOpen}
        setIsChatOpen={(val) => {
          setIsChatOpen(val);
          setUnreadChatCount(0);
        }}
        unreadChatCount={unreadChatCount}
      />

      {/* Grid de Vídeos / Imagens Diretas (Exatamente como solicitado) */}
      <main
        id="video-grid-container"
        className={`flex-1 grid gap-3 p-3 bg-[#121214] min-h-0 ${
          pinnedParticipantId
            ? 'grid-cols-1'
            : 'grid-cols-1 sm:grid-cols-2 grid-rows-2'
        }`}
      >
        {participants
          .filter((p) => (pinnedParticipantId ? p.id === pinnedParticipantId : true))
          .map((participant) => (
            <VideoCard
              key={participant.id}
              participant={participant}
              localStream={participant.isLocal ? (screenStream || localStream) : null}
              onEditParticipant={handleEditParticipant}
              onToggleMic={participant.isLocal ? handleToggleMic : undefined}
              onToggleCamera={participant.isLocal ? handleToggleCamera : undefined}
              isPinned={pinnedParticipantId === participant.id}
              onTogglePin={() =>
                setPinnedParticipantId(
                  pinnedParticipantId === participant.id ? null : participant.id
                )
              }
            />
          ))}
      </main>

      {/* Barra de Controles Inferior */}
      <ControlsBar
        isMicOn={isMicOn}
        onToggleMic={handleToggleMic}
        isCameraOn={isCameraOn}
        onToggleCamera={handleToggleCamera}
        isScreenSharing={isScreenSharing}
        onToggleScreenShare={handleToggleScreenShare}
        onOpenImagesModal={() => {
          setEditingParticipantId(undefined);
          setIsImagesModalOpen(true);
        }}
        onSimulateSpeakingToggle={() => setIsSimulatingSpeaking(!isSimulatingSpeaking)}
        isSimulatingSpeaking={isSimulatingSpeaking}
      />

      {/* Modal para Gerenciar Links Diretos de Imagens */}
      <ImageLinksModal
        isOpen={isImagesModalOpen}
        onClose={() => setIsImagesModalOpen(false)}
        participants={participants}
        onUpdateParticipant={handleUpdateParticipant}
        targetParticipantId={editingParticipantId}
      />

      {/* Modal explicativo com Código HTML Pronto e Links Diretos */}
      <HtmlSnippetModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
        participants={participants}
      />

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        roomName={roomName}
      />
    </div>
  );
}
