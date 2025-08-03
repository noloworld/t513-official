# T513 Rádio

Servidor de rádio para o T513, implementado em Node.js puro sem dependências externas.

## Características

- 🎵 Streaming contínuo de músicas MP3
- 👥 Suporte a múltiplos ouvintes simultâneos
- 🔄 Reprodução em loop da playlist
- 📊 API de status em tempo real
- 🌐 Compatível com HTML5 Audio
- 🚫 Sem dependências externas

## Como Usar

1. Coloque seus arquivos MP3 na pasta `public/musicas/`

2. Inicie o servidor:
   ```bash
   npm start
   ```

3. Acesse:
   - Player de exemplo: http://localhost:8000
   - Stream direto: http://localhost:8000/radio
   - Status da rádio: http://localhost:8000/status

## API

- `GET /radio` - Stream de áudio (audio/mpeg)
- `GET /status` - Informações em tempo real (JSON)
  ```json
  {
    "currentSong": "nome-da-musica.mp3",
    "listeners": 3,
    "isPlaying": true,
    "playlist": ["musica1.mp3", "musica2.mp3"]
  }
  ```

## Requisitos

- Node.js >= 14.0.0

## Licença

MIT