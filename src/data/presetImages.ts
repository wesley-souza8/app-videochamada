export interface PresetImageOption {
  id: string;
  name: string;
  url: string;
  category: 'avatar' | 'office' | 'screenshare';
}

export const PRESET_IMAGE_OPTIONS: PresetImageOption[] = [
  {
    id: 'local-avatar',
    name: 'Você (Padrão)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    category: 'avatar',
  },
  {
    id: 'amigo-1',
    name: 'Amigo 1 (Profissional)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    category: 'avatar',
  },
  {
    id: 'amigo-2',
    name: 'Amiga 2 (Reunião)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    category: 'avatar',
  },
  {
    id: 'amigo-3',
    name: 'Amigo 3 (Home Office)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    category: 'avatar',
  },
  {
    id: 'office-1',
    name: 'Sala de Conferência Moderna',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    category: 'office',
  },
  {
    id: 'screenshare-code',
    name: 'Código & Dashboard',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    category: 'screenshare',
  },
  {
    id: 'screenshare-design',
    name: 'Design UI/UX Mockup',
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    category: 'screenshare',
  },
  {
    id: 'avatar-tech',
    name: 'Desenvolvedor com Headset',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80',
    category: 'avatar',
  },
];

// High quality looping videos for realistic peer simulation (Creative Commons / Public Domain webm/mp4 clips)
export const PRESET_SAMPLE_VIDEOS = {
  amigo1: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  amigo2: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  amigo3: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
};
