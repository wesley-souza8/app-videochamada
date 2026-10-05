import { useState, useRef, useCallback, useEffect } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { Participant } from '../types';

export const useWebRTC = (localStream: MediaStream | null) => {
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [remoteParticipants, setRemoteParticipants] = useState<Participant[]>([]);
  const peerRef = useRef<Peer | null>(null);
  const callsRef = useRef<Record<string, MediaConnection>>({});

  const stopConnection = useCallback(() => {
    Object.values(callsRef.current).forEach((call) => call.close());
    callsRef.current = {};
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setRemoteStreams({});
    setRemoteParticipants([]);
  }, []);

  const startConnection = useCallback((roomName: string) => {
    stopConnection();

    // Lógica de Descoberta P2P Simples sem Backend
    // O usuário tentará assumir um índice de 1 a 4.
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
        
        // Se eu sou o 3, eu ligo pro 1 e pro 2.
        for (let i = 1; i < index; i++) {
          const remoteId = `${roomName}-user-${i}`;
          callPeer(peer, remoteId);
        }
      });

      peer.on('error', (err: any) => {
        if (err.type === 'unavailable-id') {
          // ID em uso, sou o próximo!
          connectAs(index + 1);
        } else {
          console.error('PeerJS error:', err);
        }
      });

      // Atender ligações de quem entrar depois de mim
      peer.on('call', (call) => {
        callsRef.current[call.peer] = call;
        const emptyStream = createEmptyAudioStream();
        call.answer(localStream || emptyStream);

        call.on('stream', (remoteStream) => {
          handleRemoteStream(call.peer, remoteStream);
        });

        call.on('close', () => {
          removeRemotePeer(call.peer);
        });
      });
    };

    connectAs(myIndex);
  }, [localStream, stopConnection]);

  // Se o meu localStream mudar (ex: liguei a câmera), precisamos atualizar as chamadas ativas!
  // No PeerJS, substituir a track de uma chamada ativa requer usar RTCRtpSender.replaceTrack.
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
      }
    });
  }, [localStream]);

  const callPeer = (peer: Peer, remoteId: string) => {
    const emptyStream = createEmptyAudioStream();
    const call = peer.call(remoteId, localStream || emptyStream);
    callsRef.current[remoteId] = call;

    call.on('stream', (remoteStream) => {
      handleRemoteStream(remoteId, remoteStream);
    });

    call.on('close', () => {
      removeRemotePeer(remoteId);
    });
    call.on('error', (err) => {
      console.warn('Call error:', err);
      removeRemotePeer(remoteId);
    });
  };

  const handleRemoteStream = (peerId: string, stream: MediaStream) => {
    setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
    
    // Add participant se não existir
    setRemoteParticipants((prev) => {
      if (prev.find((p) => p.id === peerId)) return prev;
      
      return [...prev, {
        id: peerId,
        name: `Participante ${peerId.split('-').pop()}`,
        isLocal: false,
        isMicOn: true,
        isCameraOn: stream.getVideoTracks().length > 0,
        isSpeaking: false,
        isScreenSharing: false,
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
    delete callsRef.current[peerId];
  };

  // Helper para não quebrar o WebRTC se o usuário entrar sem câmera/mic
  const createEmptyAudioStream = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    const track = (dst as any).stream.getAudioTracks()[0];
    track.enabled = false;
    return new MediaStream([track]);
  };

  return { startConnection, stopConnection, remoteStreams, remoteParticipants };
};
