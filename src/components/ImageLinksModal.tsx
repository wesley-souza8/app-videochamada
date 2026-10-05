import React, { useState } from 'react';
import { Participant } from '../types';
import { PRESET_IMAGE_OPTIONS, PresetImageOption } from '../data/presetImages';
import { X, Check, Image as ImageIcon, Link as LinkIcon, Sparkles, RefreshCw, Eye } from 'lucide-react';

interface ImageLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onUpdateParticipant: (id: string, updates: Partial<Participant>) => void;
  targetParticipantId?: string;
}

export const ImageLinksModal: React.FC<ImageLinksModalProps> = ({
  isOpen,
  onClose,
  participants,
  onUpdateParticipant,
  targetParticipantId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    targetParticipantId || participants[0]?.id || 'local'
  );

  if (!isOpen) return null;

  const currentParticipant = participants.find((p) => p.id === selectedId) || participants[0];

  const handleApplyPreset = (preset: PresetImageOption) => {
    if (!currentParticipant) return;
    onUpdateParticipant(currentParticipant.id, {
      directImageUrl: preset.url,
      feedMode: 'image',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#202024] border border-[#323238] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#323238] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00875f]/20 text-[#00b37e]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Links Diretos para as Imagens
              </h2>
              <p className="text-xs text-[#a8a8b3]">
                Defina URLs de imagens diretas (PNG, JPG, WebP) para cada tela da grade
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#a8a8b3] hover:text-white p-1 rounded-md hover:bg-[#323238] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection for 4 participants */}
        <div className="flex border-b border-[#323238] bg-[#18181b] overflow-x-auto">
          {participants.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`px-4 py-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                selectedId === p.id
                  ? 'border-[#00875f] text-[#00b37e] bg-[#202024]'
                  : 'border-transparent text-[#a8a8b3] hover:text-white hover:bg-[#202024]/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#00875f]" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {currentParticipant && (
            <>
              {/* Name & Mode Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a8a8b3] mb-1.5 uppercase tracking-wider">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={currentParticipant.name}
                    onChange={(e) =>
                      onUpdateParticipant(currentParticipant.id, { name: e.target.value })
                    }
                    className="w-full bg-[#121214] border border-[#323238] focus:border-[#00875f] rounded-md px-3 py-2 text-white text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a8a8b3] mb-1.5 uppercase tracking-wider">
                    Modo de Exibição
                  </label>
                  <select
                    value={currentParticipant.feedMode}
                    onChange={(e) =>
                      onUpdateParticipant(currentParticipant.id, {
                        feedMode: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#121214] border border-[#323238] focus:border-[#00875f] rounded-md px-3 py-2 text-white text-sm outline-none transition-colors"
                  >
                    <option value="image">Link Direto de Imagem (Foto / Avatar)</option>
                    <option value="camera">
                      {currentParticipant.isLocal ? 'Webcam Real / Câmera' : 'Vídeo Simulado'}
                    </option>
                    {!currentParticipant.isLocal && (
                      <option value="video_sample">Vídeo em Loop (WebRTC Stream)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Direct image link URL input */}
              <div>
                <label className="block text-xs font-semibold text-[#a8a8b3] mb-1.5 uppercase tracking-wider">
                  Link Direto da Imagem (URL)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7c7c8a]">
                      <LinkIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={currentParticipant.directImageUrl}
                      onChange={(e) =>
                        onUpdateParticipant(currentParticipant.id, {
                          directImageUrl: e.target.value,
                        })
                      }
                      placeholder="https://exemplo.com/minha-foto.jpg"
                      className="w-full pl-9 pr-3 py-2 bg-[#121214] border border-[#323238] focus:border-[#00875f] rounded-md text-white text-sm outline-none transition-colors font-mono text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Apply image mode
                      onUpdateParticipant(currentParticipant.id, { feedMode: 'image' });
                    }}
                    className="bg-[#00875f] hover:bg-[#015f43] text-white px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicar</span>
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-[#7c7c8a]">
                  Aceita links diretos do Unsplash, Imgur, servidores próprios, GitHub, SVG, WebP, PNG ou JPG.
                </p>
              </div>

              {/* Live Preview & Presets */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                {/* Image Preview */}
                <div className="md:col-span-5 bg-[#121214] border border-[#323238] rounded-lg p-3 flex flex-col items-center justify-center">
                  <span className="text-[11px] text-[#7c7c8a] mb-2 font-medium flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Pré-visualização da Tela
                  </span>
                  <div className="w-full aspect-video rounded-md overflow-hidden bg-black border border-[#323238] relative flex items-center justify-center">
                    <img
                      src={currentParticipant.directImageUrl}
                      alt={currentParticipant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://placehold.co/600x400/202024/00875f?text=Link+Invalido';
                      }}
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {currentParticipant.name}
                    </span>
                  </div>
                </div>

                {/* Preset Suggestions */}
                <div className="md:col-span-7 flex flex-col">
                  <span className="text-xs font-semibold text-[#a8a8b3] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00b37e]" />
                    Sugestões de Imagens Prontas
                  </span>
                  <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-48 pr-1">
                    {PRESET_IMAGE_OPTIONS.map((preset) => {
                      const isSelected = currentParticipant.directImageUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all group ${
                            isSelected
                              ? 'border-[#00875f] bg-[#00875f]/10'
                              : 'border-[#323238] hover:border-[#4d4d57] bg-[#18181b]'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-10 h-10 rounded object-cover shrink-0"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs text-white truncate font-medium group-hover:text-[#00b37e]">
                              {preset.name}
                            </p>
                            <p className="text-[10px] text-[#7c7c8a] truncate">
                              {preset.category}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#323238] bg-[#18181b] flex items-center justify-between">
          <span className="text-xs text-[#a8a8b3]">
            As alterações são refletidas instantaneamente na grade de vídeos.
          </span>
          <button
            onClick={onClose}
            className="bg-[#00875f] hover:bg-[#015f43] text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
