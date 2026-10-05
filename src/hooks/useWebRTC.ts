import { useState, useRef, useCallback, useEffect } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { Participant } from '../types';

export const useWebRTC = (localStream: MediaStream | null, screenStream: MediaStream | null) => {
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [remoteParticipants, setRemoteParticipants] = useState<Participant[]>([]);
  const peerRef = useRef<Peer | null>(null);
  const callsRef = useRef<Record<string, MediaConnection>>({});
  const screenCallsRef = useRef<Record<string, MediaConnection>>({});

  const stopConnection = useCallback(() => {
    Object.values(callsRef.current).forEach((call) => call.close());
    Object.values(screenCallsRef.current).forEach((call) => call.close());
    callsRef.current = {};
    screenCallsRef.current = {};
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setRemoteStreams({});
    setRemoteParticipants([]);
  }, []);

  const startConnection = useCallback((roomName: string) => {
    stopConnection();

    let myIndex = 1;

    const connectAs = (index: number) => {
      if (index > 4) {
        alert("Sala cheia! Máximo de 4 pessoas.");
        return;
      }
      
      const myId = `${roomName}-user-${index}`;
      const peer = new Peer(myId);

      peer.on('open', (id) => {
        peerRef.current = peer;
        console.log(`Conectado ao servidor de sinalização como: ${id}`);
        
        for (let i = 1; i < index; i++) {
          const remoteId = `${roomName}-user-${i}`;
          callPeer(peer, remoteId);
        }
      });

      peer.on('error', (err: any) => {
        if (err.type === 'unavailable-id') {
          connectAs(index + 1);
        } else {
          console.error('PeerJS error:', err);
        }
      });

      peer.on('call', (call) => {
        const isScreen = call.metadata?.type === 'screen';
        
        if (!isScreen) {
          callsRef.current[call.peer] = call;
          const emptyStream = createEmptyStream();
          call.answer(localStream || emptyStream);

          // Se eu estiver compartilhando tela, ligo de volta com a tela
          if (screenStream && peerRef.current) {
             const sc = peerRef.current.call(call.peer, screenStream, { metadata: { type: 'screen' } });
             screenCallsRef.current[call.peer] = sc;
          }
        } else {
          // É uma chamada recebendo tela de alguém
          call.answer(); // Recebo apenas, não envio nada de volta nesta conexão
        }

        call.on('stream', (remoteStream) => {
          handleRemoteStream(isScreen ? `${call.peer}-screen` : call.peer, remoteStream, isScreen);
        });

        call.on('close', () => {
          removeRemotePeer(isScreen ? `${call.peer}-screen` : call.peer);
        });
      });
    };

    connectAs(myIndex);
  // Não podemos colocar screenStream nas deps, senão ele reconecta a malha inteira.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream, stopConnection]);

  // Efeito para ligar/desligar a chamada de tela dinamicamente sem reiniciar a malha
  useEffect(() => {
    if (!peerRef.current) return;
    
    if (screenStream) {
       // Ligue para todos os peers atuais enviando a tela
       Object.keys(callsRef.current).forEach(remoteId => {
          if (!screenCallsRef.current[remoteId]) {
             const sc = peerRef.current!.call(remoteId, screenStream, { metadata: { type: 'screen' } });
             screenCallsRef.current[remoteId] = sc;
          }
       });
    } else {
       // Desligue todas as chamadas de tela ativas
       Object.values(screenCallsRef.current).forEach(call => call.close());
       screenCallsRef.current = {};
    }
  }, [screenStream]);

  // Se o meu localStream mudar (ex: liguei a câmera), precisamos atualizar as tracks da chamada principal
  useEffect(() => {
    if (!localStream) return;
    Object.values(callsRef.current).forEach((call) => {
      if (call.peerConnection) {
        const senders = call.peerConnection.getSenders();
        localStream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track).catch(console.error);
          }
        });
        // Se o localStream perdeu a câmera (Desligou a câmera), interrompemos o envio de vídeo.
        if (localStream.getVideoTracks().length === 0) {
           const videoSender = senders.find((s) => s.track?.kind === 'video' || s.track === null);
           if (videoSender) videoSender.replaceTrack(null).catch(console.error);
        }
      }
    });
  }, [localStream]);

  const callPeer = (peer: Peer, remoteId: string) => {
    const emptyStream = createEmptyStream();
    const call = peer.call(remoteId, localStream || emptyStream);
    callsRef.current[remoteId] = call;

    call.on('stream', (remoteStream) => {
      handleRemoteStream(remoteId, remoteStream, false);
    });

    call.on('close', () => {
      removeRemotePeer(remoteId);
    });
    call.on('error', (err) => {
      console.warn('Call error:', err);
      removeRemotePeer(remoteId);
    });
  };

  const handleRemoteStream = (peerId: string, stream: MediaStream, isScreen: boolean = false) => {
    setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
    
    setRemoteParticipants((prev) => {
      if (prev.find((p) => p.id === peerId)) return prev;
      
      const baseName = peerId.includes('-screen') ? peerId.split('-user-')[1].split('-')[0] : peerId.split('-').pop();
      const name = isScreen ? `Tela do Participante ${baseName}` : `Participante ${baseName}`;

      return [...prev, {
        id: peerId,
        name,
        isLocal: false,
        isMicOn: true,
        isCameraOn: stream.getVideoTracks().length > 0,
        isSpeaking: false,
        isScreenSharing: isScreen,
        feedMode: 'camera',
        directImageUrl: '',
      }];
    });
  };

  const removeRemotePeer = (peerId: string) => {
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
    setRemoteParticipants((prev) => prev.filter((p) => p.id !== peerId));
    if (peerId.includes('-screen')) {
       const baseId = peerId.replace('-screen', '');
       delete screenCallsRef.current[baseId];
    } else {
       delete callsRef.current[peerId];
    }
  };

  // Helper para não quebrar o WebRTC se o usuário entrar sem câmera/mic
  const createEmptyStream = () => {
    // Audio Dummy
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    const audioTrack = (dst as any).stream.getAudioTracks()[0];
    audioTrack.enabled = false;

    // Video Dummy (Black Canvas 1x1)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx2d = canvas.getContext('2d');
    if (ctx2d) {
      ctx2d.fillRect(0, 0, 1, 1);
    }
    const canvasStream = canvas.captureStream(1);
    const videoTrack = canvasStream.getVideoTracks()[0];
    videoTrack.enabled = false;

    return new MediaStream([audioTrack, videoTrack]);
  };

  return { startConnection, stopConnection, remoteStreams, remoteParticipants };
};
