import React, { useState, useEffect, useRef } from 'react';
import { Participant, ConnectionStatus, ChatMessage } from './types';
import { Header } from './components/Header';
import { VideoCard } from './components/VideoCard';
import { ControlsBar } from './components/ControlsBar';
import { ImageLinksModal } from './components/ImageLinksModal';
import { HtmlSnippetModal } from './components/HtmlSnippetModal';
import { ChatDrawer } from './components/ChatDrawer';
import { useWebRTC } from './hooks/useWebRTC';
import { PRESET_IMAGE_OPTIONS, PRESET_SAMPLE_VIDEOS } from './data/presetImages';

export default function App() {
  const [roomName, setRoomName] = useState('sala-reuniao-1');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
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

  // Iniciando apenas com o usuário local, sem imagens de mentira
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'local',
      name: 'Você (Local)',
      isLocal: true,
      isMicOn: true,
      isCameraOn: false,
      isSpeaking: false,
      isScreenSharing: false,
      feedMode: 'image',
      directImageUrl: '',
    }
  ]);

  const localParticipant = participants.find((p) => p.id === 'local') || participants[0];

  // WebRTC Mesh Real
  const { startConnection, stopConnection, remoteStreams, remoteParticipants } = useWebRTC(localParticipant, localStream, screenStream);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderId: 'system',
      senderName: 'Sistema',
      text: 'Bem-vindo! Clique em "Conectar" para iniciar.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    }
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
      localStream.getVideoTracks().forEach((track) => {
        track.stop();
        localStream.removeTrack(track);
      });
      // Cria uma nova referência contendo apenas as faixas de áudio que sobraram
      const newStream = new MediaStream(localStream.getAudioTracks());
      setLocalStream(newStream);
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
  const handleToggleMic = async () => {
    const nextMicState = !isMicOn;
    setIsMicOn(nextMicState);

    // Se já temos um stream, apenas mutamos/desmutamos a faixa existente
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = nextMicState;
      });
    } else if (nextMicState) {
      // Se não temos stream (câmera desligada) e o usuário quer ligar o mic:
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(audioStream);
      } catch (err) {
        console.warn('Microfone indisponível:', err);
        setIsMicOn(false); // Reverte caso negue permissão
        return;
      }
    }

    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, isMicOn: nextMicState } : p))
    );
  };

  // Screen Share (Estilo Discord - Cria um novo card para a tela)
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      setParticipants((prev) => prev.filter((p) => p.id !== 'local-screen'));
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          setScreenStream(stream);
          setIsScreenSharing(true);
          
          const screenParticipant: Participant = {
            id: 'local-screen',
            name: 'Sua Tela',
            isLocal: true,
            isMicOn: false,
            isCameraOn: true,
            isSpeaking: false,
            isScreenSharing: true,
            feedMode: 'camera', // Tratado como camera para usar o srcObject do VideoCard
            directImageUrl: '',
          };
          setParticipants((prev) => [...prev, screenParticipant]);

          // Stop screen share when browser stop sharing button is clicked
          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            setParticipants((prev) => prev.filter((p) => p.id !== 'local-screen'));
          };
        } else {
          // Simulated screen share
          setIsScreenSharing(true);
          const screenParticipant: Participant = {
            id: 'local-screen',
            name: 'Sua Tela',
            isLocal: true,
            isMicOn: false,
            isCameraOn: false,
            isSpeaking: false,
            isScreenSharing: true,
            feedMode: 'camera',
            directImageUrl: '',
          };
          setParticipants((prev) => [...prev, screenParticipant]);
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
      stopConnection(); // Derruba malha PeerJS
      stopCamera();
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      setParticipants(prev => prev.filter(p => p.isLocal));
    } else {
      const pass = prompt('Digite a senha da sala para entrar:');
      if (!pass) return;

      setStatus('connecting');
      
      // CyberSecurity Fix: Geração de Hash (SHA-256) combinando Nome da Sala + Senha.
      // Assim, a senha nunca é exposta no código nem enviada ao servidor de sinalização.
      // Quem digitar a senha errada apenas cairá numa hash (sala) paralela vazia.
      crypto.subtle.digest('SHA-256', new TextEncoder().encode(roomName + pass))
        .then(hashBuffer => {
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const secureRoomHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
          
          // Inicia captura de áudio se o mic estiver ligado
          if (isMicOn && !localStream) {
            navigator.mediaDevices.getUserMedia({ audio: true })
              .then(stream => {
                setLocalStream(stream);
                startConnection(secureRoomHash);
              })
              .catch(err => {
                console.warn('Microfone não acessível:', err);
                startConnection(secureRoomHash);
              });
          } else {
            // Inicia Conexão Real com a sala criptografada
            startConnection(secureRoomHash);
          }

          setStatus('connected');
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              senderId: 'system',
              senderName: 'Sistema',
              text: `Você entrou na sala "${roomName || 'sala-reuniao-1'}" de forma segura. (Hash: ${secureRoomHash})`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSystem: true,
            },
          ]);
        });
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

  const allParticipants = [...participants, ...remoteParticipants];

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

      {/* Grid de Vídeos / Imagens Diretas */}
      <main
        id="video-grid-container"
        className={`flex-1 grid gap-3 p-3 bg-[#121214] min-h-0 ${
          pinnedParticipantId
            ? 'grid-cols-1'
            : allParticipants.length > 4 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr' 
              : 'grid-cols-1 sm:grid-cols-2 auto-rows-fr'
        }`}
      >
        {allParticipants
          .filter((p) => (pinnedParticipantId ? p.id === pinnedParticipantId : true))
          .map((participant) => (
            <VideoCard
              key={participant.id}
              participant={participant}
              mediaStream={
                participant.id === 'local-screen'
                  ? screenStream
                  : participant.id === 'local'
                  ? localStream
                  : remoteStreams[participant.id] || null
              }
              onEditParticipant={handleEditParticipant}
              onToggleMic={participant.id === 'local' ? handleToggleMic : undefined}
              onToggleCamera={participant.id === 'local' ? handleToggleCamera : undefined}
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
        participants={allParticipants}
        onUpdateParticipant={handleUpdateParticipant}
        targetParticipantId={editingParticipantId}
      />

      {/* Modal explicativo com Código HTML Pronto e Links Diretos */}
      <HtmlSnippetModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
        participants={allParticipants}
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
