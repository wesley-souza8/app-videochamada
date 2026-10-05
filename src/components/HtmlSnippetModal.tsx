import React, { useState } from 'react';
import { X, Copy, Check, Code2, ExternalLink } from 'lucide-react';
import { Participant } from '../types';

interface HtmlSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
}

export const HtmlSnippetModal: React.FC<HtmlSnippetModalProps> = ({
  isOpen,
  onClose,
  participants,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const localP = participants[0] || { name: 'Você (Local)', directImageUrl: '' };
  const p1 = participants[1] || { name: 'Amigo 1', directImageUrl: '' };
  const p2 = participants[2] || { name: 'Amigo 2', directImageUrl: '' };
  const p3 = participants[3] || { name: 'Amigo 3', directImageUrl: '' };

  const snippetTagImg = `<!-- Opção 1: Usando tag <img> com link direto dentro de cada .video-card -->
<main id="video-grid-container">
  <!-- Vídeo / Imagem Local -->
  <div class="video-card" id="card-local-video">
    <img src="${localP.directImageUrl}" alt="${localP.name}" style="width: 100%; height: 100%; object-fit: cover;" />
    <span class="video-label" id="label-local">${localP.name}</span>
  </div>

  <!-- Vídeo / Imagem Remoto 1 -->
  <div class="video-card" id="card-remote-video-1">
    <img src="${p1.directImageUrl}" alt="${p1.name}" style="width: 100%; height: 100%; object-fit: cover;" />
    <span class="video-label" id="label-remote-1">${p1.name}</span>
  </div>

  <!-- Vídeo / Imagem Remoto 2 -->
  <div class="video-card" id="card-remote-video-2">
    <img src="${p2.directImageUrl}" alt="${p2.name}" style="width: 100%; height: 100%; object-fit: cover;" />
    <span class="video-label" id="label-remote-2">${p2.name}</span>
  </div>

  <!-- Vídeo / Imagem Remoto 3 -->
  <div class="video-card" id="card-remote-video-3">
    <img src="${p3.directImageUrl}" alt="${p3.name}" style="width: 100%; height: 100%; object-fit: cover;" />
    <span class="video-label" id="label-remote-3">${p3.name}</span>
  </div>
</main>`;

  const snippetVideoPoster = `<!-- Opção 2: Usando o atributo poster="" na tag <video> com link direto -->
<!-- A imagem aparece como capa/avatar quando a câmera estiver desligada -->
<div class="video-card" id="card-remote-video-1">
  <video 
    id="remote-video-1" 
    autoplay 
    playsinline 
    poster="${p1.directImageUrl}">
  </video>
  <span class="video-label" id="label-remote-1">${p1.name}</span>
</div>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#202024] border border-[#323238] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#323238] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00875f]/20 text-[#00b37e]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Como usar links diretos de imagens no HTML
              </h2>
              <p className="text-xs text-[#a8a8b3]">
                Sim! É totalmente possível e você pode copiar o código pronto abaixo
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#e1e1e6]">
          {/* Explanation banner */}
          <div className="bg-[#192b23] border border-[#00875f]/40 p-4 rounded-lg flex items-start gap-3">
            <div className="p-1 rounded bg-[#00875f] text-white shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <strong className="text-[#00b37e] block text-sm mb-1 font-semibold">
                Resposta: Sim, é 100% possível!
              </strong>
              Você pode colocar links diretos de imagens de duas formas no seu HTML:
              <ul className="list-disc list-inside mt-1.5 space-y-1 text-[#e1e1e6]">
                <li>
                  <strong className="text-white">Opção 1 (Tag &lt;img&gt;):</strong> Substituir a tag{' '}
                  <code className="bg-black/50 px-1 py-0.5 rounded text-[#00b37e]">&lt;video&gt;</code> por{' '}
                  <code className="bg-black/50 px-1 py-0.5 rounded text-[#00b37e]">&lt;img src="URL_DIRETA"&gt;</code>{' '}
                  quando não houver câmera ou para avatares fixos.
                </li>
                <li>
                  <strong className="text-white">Opção 2 (Atributo poster):</strong> Adicionar o atributo{' '}
                  <code className="bg-black/50 px-1 py-0.5 rounded text-[#00b37e]">poster="URL_DIRETA"</code>{' '}
                  na própria tag <code className="bg-black/50 px-1 py-0.5 rounded text-[#00b37e]">&lt;video&gt;</code>.
                </li>
              </ul>
            </div>
          </div>

          {/* Code Box 1 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-[#a8a8b3] uppercase tracking-wider">
                Exemplo 1: Grade HTML com Tags &lt;img&gt; e Links Atuais
              </span>
              <button
                onClick={() => copyToClipboard(snippetTagImg, 'img')}
                className="flex items-center gap-1.5 text-xs text-[#00b37e] hover:text-[#015f43] bg-[#29292e] px-2.5 py-1 rounded border border-[#323238] transition-colors"
              >
                {copiedType === 'img' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#121214] border border-[#323238] rounded-lg p-3.5 overflow-x-auto text-xs text-[#79c0ff] font-mono leading-relaxed">
              {snippetTagImg}
            </pre>
          </div>

          {/* Code Box 2 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-[#a8a8b3] uppercase tracking-wider">
                Exemplo 2: Usando o atributo poster="" no &lt;video&gt;
              </span>
              <button
                onClick={() => copyToClipboard(snippetVideoPoster, 'poster')}
                className="flex items-center gap-1.5 text-xs text-[#00b37e] hover:text-[#015f43] bg-[#29292e] px-2.5 py-1 rounded border border-[#323238] transition-colors"
              >
                {copiedType === 'poster' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#121214] border border-[#323238] rounded-lg p-3.5 overflow-x-auto text-xs text-[#79c0ff] font-mono leading-relaxed">
              {snippetVideoPoster}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#323238] bg-[#18181b] flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-[#00875f] hover:bg-[#015f43] text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
