# App Videochamada (WebRTC P2P)

Uma plataforma gratuita de videochamada baseada em malha (mesh) P2P, suportando até 4 pessoas simultâneas com funcionalidades de compartilhamento de tela inspiradas no layout do Discord.

## 🚀 Funcionalidades

- **WebRTC P2P Nativo**: A infraestrutura de vídeo roda diretamente do navegador de um usuário para o outro, mantendo o tráfego 100% livre de servidores de mídia centrais pagos.
- **Sinalização Gratuita**: Orquestrado pelo **PeerJS** utilizando seu servidor público de sinalização em nuvem para descoberta de peers.
- **Layout Dinâmico (Estilo Discord)**: A sala suporta múltiplas transmissões simultâneas da mesma pessoa (câmera + compartilhamento de tela separados) e se redimensiona automaticamente com base no número de transmissões ativas.
- **Segurança (Sala Privada)**: Acesso protegido por senha local via variáveis de ambiente seguras.
- **Fixar Vídeo (Pin)**: Clique rápido na interface para expandir qualquer fluxo de vídeo e visualizar detalhes.

## 🛠️ Stack Tecnológica

- **Frontend**: React 19, Vite, Tailwind CSS 4.
- **Rede P2P**: PeerJS (WebRTC abstraído).
- **Ícones**: Lucide React.

## 📦 Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env.local` na raiz do projeto com a senha da sala:
   ```env
   VITE_ROOM_PASSWORD=sua-senha-segura-aqui
   ```

3. Inicie o servidor local:
   ```bash
   npm run dev
   ```

4. Acesse em seu navegador: `http://localhost:3000`

## 🔒 Variáveis de Ambiente e Segurança

Para manter sua senha protegida ao publicar de forma estática (Ex: Cloudflare Pages, GitHub Pages), registre a variável `VITE_ROOM_PASSWORD` diretamente nas configurações de CI/CD (environment variables) da sua plataforma de hospedagem.
O arquivo de contexto da IA (`contexto.md`) e os arquivos `.env` locais já estão devidamente configurados no `.gitignore`.
