var socket = io();
var room = window.location.href.split('=')[1];
// Entrar na sala
socket.emit('entrar', room);

// Pausar video para todos
function Prepause() {
    player.pauseVideo();
    socket.emit('pause', room);
};

// Dar play para todos
function Preplay() {
    player.playVideo();
    socket.emit('play', room);
};

// Resetar video para todos
function Prestop() {
    player.stopVideo();
    socket.emit('stop', room);
};

// Controle de video
socket.on('pauseA', () => {
    player.pauseVideo();
})
socket.on('playA', () => {
    player.playVideo();
})
socket.on('stopA', () => {
    player.stopVideo();
})
socket.on('syncA', (data) => {
    player.seekTo(data);
})

// Mudar video
socket.on('changeA', (data) => {
    video.src = data;
})

function changeLink() {
    var video = document.getElementById('video');
    var final = "?enablejsapi=1&html5=1"
    var linkYt = document.getElementById('linkYt');
    var linkYtS = linkYt.value;
    if (linkYtS.indexOf("www.youtube.com") != -1 || linkYtS.indexOf("youtu.be") != -1) {
        if (linkYtS.indexOf("www.youtube.com") != -1) {
            linkYtS = linkYtS.replace('https://www.youtube.com/watch?v=', "https://www.youtube.com/embed/")
        } else if (linkYtS.indexOf("youtu.be") != -1) {
            linkYtS = linkYtS.replace('youtu.be/', "www.youtube.com/embed/")
        }
        linkYtS = linkYtS.concat(final);
        video.src = linkYtS;
        socket.emit('change', linkYtS);
    }
}

// Enviar posição atual para todos
function posAtual() {
    socket.emit('sync', {
        tempo: player.getCurrentTime(),
        room: room
    });

}