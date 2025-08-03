const http = require('http');
const fs = require('fs');
const path = require('path');

// Armazena os listeners ativos
const listeners = new Set();

// Estado global da rádio
let currentSong = null;
let currentStream = null;
let isPlaying = false;

// Configurações
const MUSIC_DIR = path.join(__dirname, '../public/musicas');
const PORT = process.env.PORT || 8000;

// Cache de músicas
let playlist = [];

// Função para carregar a lista de músicas
function loadPlaylist() {
    try {
        const files = fs.readdirSync(MUSIC_DIR);
        playlist = files.filter(file => file.endsWith('.mp3'));
        console.log('Playlist carregada:', playlist);
    } catch (err) {
        console.error('Erro ao carregar playlist:', err);
        playlist = [];
    }
}

// Função para iniciar a próxima música
function playNextSong() {
    if (playlist.length === 0 || !isPlaying) return;

    // Se não há música atual, começa do início
    if (!currentSong) {
        currentSong = playlist[0];
    } else {
        // Encontra o índice da música atual e pega a próxima
        const currentIndex = playlist.indexOf(currentSong);
        const nextIndex = (currentIndex + 1) % playlist.length;
        currentSong = playlist[nextIndex];
    }

    // Abre o stream da nova música
    const songPath = path.join(MUSIC_DIR, currentSong);
    currentStream = fs.createReadStream(songPath);

    console.log('Tocando agora:', currentSong);

    // Envia os dados para todos os ouvintes
    currentStream.on('data', (chunk) => {
        listeners.forEach(listener => {
            try {
                listener.write(chunk);
            } catch (err) {
                // Se houver erro ao enviar, remove o listener
                listeners.delete(listener);
            }
        });
    });

    // Quando a música acabar, toca a próxima
    currentStream.on('end', () => {
        playNextSong();
    });

    // Em caso de erro no stream
    currentStream.on('error', (err) => {
        console.error('Erro ao tocar música:', err);
        playNextSong();
    });
}

// Cria o servidor HTTP
const server = http.createServer((req, res) => {
    // Adiciona headers CORS para permitir requisições do frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Se for uma requisição OPTIONS (preflight), retorna 200 OK
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Rota principal da rádio
    if (url.pathname === '/radio') {
        // Headers necessários para streaming de áudio
        res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Adiciona o cliente à lista de ouvintes
        listeners.add(res);

        // Remove o ouvinte quando a conexão for fechada
        req.on('close', () => {
            listeners.delete(res);
            console.log('Ouvinte desconectado. Total:', listeners.size);
        });

        console.log('Novo ouvinte conectado. Total:', listeners.size);
    }
    // Rota de status
    else if (url.pathname === '/status') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        res.end(JSON.stringify({
            currentSong,
            listeners: listeners.size,
            isPlaying,
            playlist
        }));
    }
    // Página de exemplo com player
    else if (url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>T513 Rádio</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        text-align: center;
                        background: #1a1a1a;
                        color: #fff;
                    }
                    #player {
                        margin: 20px 0;
                        width: 100%;
                        border-radius: 8px;
                    }
                    #now-playing {
                        margin: 10px 0;
                        font-style: italic;
                        color: #aaa;
                    }
                    .stats {
                        background: #333;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .stats p {
                        margin: 5px 0;
                    }
                    h1 {
                        color: #4CAF50;
                    }
                </style>
            </head>
            <body>
                <h1>🎵 T513 Rádio</h1>
                <audio id="player" controls>
                    <source src="/radio" type="audio/mpeg">
                    Seu navegador não suporta o elemento de áudio.
                </audio>
                <div class="stats">
                    <div id="now-playing">Carregando...</div>
                    <p id="listeners">Ouvintes: 0</p>
                </div>
                <script>
                    // Atualiza informações da música atual
                    function updateStatus() {
                        fetch('/status')
                            .then(res => res.json())
                            .then(data => {
                                document.getElementById('now-playing').textContent = 
                                    'Tocando: ' + (data.currentSong || 'Nada tocando');
                                document.getElementById('listeners').textContent =
                                    'Ouvintes: ' + data.listeners;
                            })
                            .catch(console.error);
                    }
                    
                    // Atualiza a cada 5 segundos
                    setInterval(updateStatus, 5000);
                    updateStatus();

                    // Reconecta automaticamente em caso de erro
                    const audio = document.getElementById('player');
                    audio.onerror = () => {
                        console.log('Erro no player, tentando reconectar...');
                        setTimeout(() => {
                            audio.load();
                            audio.play().catch(console.error);
                        }, 2000);
                    };
                </script>
            </body>
            </html>
        `);
    }
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Inicia o servidor
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║           T513 Rádio Server            ║
╠════════════════════════════════════════╣
║                                        ║
║  🎵 Servidor rodando na porta ${PORT}      ║
║  📁 Músicas em: ${MUSIC_DIR}           ║
║                                        ║
║  URLs:                                 ║
║  - Player: http://localhost:${PORT}         ║
║  - Stream: http://localhost:${PORT}/radio   ║
║  - Status: http://localhost:${PORT}/status  ║
║                                        ║
╚════════════════════════════════════════╝
    `);
    
    // Carrega a playlist inicial
    loadPlaylist();
    
    // Inicia a transmissão
    isPlaying = true;
    playNextSong();

    // Monitora a pasta de músicas para mudanças
    fs.watch(MUSIC_DIR, (eventType, filename) => {
        if (filename && filename.endsWith('.mp3')) {
            console.log('Detectada mudança nas músicas, recarregando playlist...');
            loadPlaylist();
        }
    });
});