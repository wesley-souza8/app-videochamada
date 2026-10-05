export type ParticipantFeedMode = 'camera' | 'image' | 'video_sample';

export interface Participant {
  id: string;
  name: string;
  isLocal: boolean;
  isMicOn: boolean;
  isCameraOn: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  feedMode: ParticipantFeedMode;
  directImageUrl: string;
  videoSampleUrl?: string;
  statusText?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
