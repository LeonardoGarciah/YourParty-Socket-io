//Darkmode
var dark = document.getElementById("dark");
var alternate = 0;
dark.addEventListener("click", () => {
    var body = document.getElementById('body');
    var mensagens = document.getElementById('mensagens');
    var chat = document.getElementById('chat-bottom');
    var users = document.getElementById('users');
    var video = document.getElementById('video');
    var inputs = document.querySelectorAll('input[type=text]');
    var logo = document.getElementById("logo");
    if (alternate == 1) {
        logo.src = "../public/img/party2.png";
        alternate = 0;
    } else if (alternate == 0) {
        alternate = 1;
        logo.src = "../public/img/party_.png";
    }
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].classList.toggle("blackInput");
    }
    body.classList.toggle("black");
    users.classList.toggle("black");
    mensagens.classList.toggle("black");
    video.classList.toggle('black');


    chat.classList.toggle("black");
})

// variável global para o jogador
var player;
var videoDuration = 0;
var videoTime = 0;

// esta função é chamada quando a API está pronta para uso
function onYouTubePlayerAPIReady() {
    // crie o player global a partir do iframe específico (#video)
    player = new YT.Player('video', {
        events: {
            // chame esta função quando o jogador estiver pronto para usar
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    videoDuration = parseInt(player.getDuration());
    interval = setInterval(discoverTime, 1000);

}

function discoverTime() {
    var fireAt = 15;
    if (player && player.getCurrentTime) {
        videoTime = parseInt(player.getCurrentTime());
    }
    if (videoTime > videoDuration) {
        clearInterval(interval);
    }

}

// Injetar script de API do YouTube
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var name;
var ocultar = document.getElementById('ocultar');
var usersLista = document.getElementById('users');
ocultar.addEventListener('click', () => {
    usersLista.classList.toggle('minimizar');
})

// Lista de usuarios na sala
socket.on('allUsers', (data) => {
    var users = data;
    var lis = document.querySelectorAll('.users li');
    for (var v = 0; v < lis.length; v++) {
        usersLista.removeChild(lis[v]);
    }
    for (var c = 0; c < users.length; c++) {
        var item = document.createElement('li');


        item.textContent = users[c].name;

        usersLista.appendChild(item);
        mensagens.scrollTo(0, document.body.scrollHeight);
    }
});


// Kick por spam de request
socket.on('kickado', () => {
    alert("Você foi kickado");
    window.location.href = '/enter';
})

// Ban por pontuação por kick
socket.on('Banido', () => {
    alert("Você foi Banido");
    window.location.href = '/enter';
})

// Solicitação de nome
socket.on('insertUser', () => {
    name = prompt("Qual seu nome?");
    socket.emit('new user', {
        name: name,
        room: room
    });
})

// Enviar mensagem no chat
var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    var msg = input.value;
    if (input.value != "") {
        input.value = "";
        socket.emit('new message', {
            msg: msg,
            name: name,
            room: room
        });
    }
})

function getMsg() {

    var msg = input.value;
    if (input.value != "") {
        input.value = "";
        socket.emit('new message', {
            msg: msg,
            name: name,
            room: room
        });
    }
}

// Exibir mensagem no chat
socket.on('news message', (data) => {
    var mensagens = document.getElementById('mensagens');
    var item = document.createElement('li');
    item.textContent = data.name + ' disse: ' + data.msg;
    mensagens.appendChild(item);
    $('.mensagens').scrollTop($('.mensagens')[0].scrollHeight);
})