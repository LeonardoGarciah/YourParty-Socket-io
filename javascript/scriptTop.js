var socket = io();
var room = window.location.href.split('=')[1];
socket.emit('entrar', room);
console.log(room);

function Prepause() {
    player.pauseVideo();
    socket.emit('pause', room);
};

function Preplay() {
    player.playVideo();
    socket.emit('play', room);
};

function Prestop() {
    player.stopVideo();
    socket.emit('stop', room);
};

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

socket.on('changeA', (data) => {
    video.src = data;
})

function changeLink() {
    var video = document.getElementById('video');
    var final = "?enablejsapi=1&html5=1"
    var linkYt = document.getElementById('linkYt');
    var linkYtS = linkYt.value;
    if (linkYtS.indexOf("www.youtube.com") != -1) {
        linkYtS = linkYtS.replace('https://www.youtube.com/watch?v=', "https://www.youtube.com/embed/")
        linkYtS = linkYtS.concat(final);
        video.src = linkYtS;
        socket.emit('change', linkYtS);
    }
}

function posAtual() {
    socket.emit('sync', {
        tempo: player.getCurrentTime(),
        room: room
    });

}