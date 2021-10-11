var dark = document.getElementById("dark");
dark.addEventListener("click", () => {
        var body = document.getElementById('body');
        var mensagens = document.getElementById('mensagens');
        var chat = document.getElementById('chat-bottom');
        body.classList.toggle("black");
        mensagens.classList.toggle("black");


        chat.classList.toggle("black");
    })
    // global variable for the player
var player;
var videoDuration = 0;
var videoTime = 0;

// this function gets called when API is ready to use
function onYouTubePlayerAPIReady() {
    // create the global player from the specific iframe (#video)
    player = new YT.Player('video', {
        events: {
            // call this function when player is ready to use
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

// Inject YouTube API script
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var nome;
socket.on('allUsers', (data) => {
    var users = data;
    var ocultar = document.getElementById('ocultar');
    var usersLista = document.getElementById('users');
    ocultar.addEventListener('click', () => {
        usersLista.classList.toggle('minimizar');
    })
    var lis = document.querySelectorAll('.users li');
    for (var v = 0; v < lis.length; v++) {
        usersLista.removeChild(lis[v]);
    }
    for (var c = 0; c < users.length; c++) {
        var item = document.createElement('li');


        item.textContent = users[c].nome;

        usersLista.appendChild(item);
        mensagens.scrollTo(0, document.body.scrollHeight);
    }
});


socket.on('insertUser', () => {
    nome = prompt("Qual seu nome?");
    socket.emit('new user', {
        nome: nome,
        room: room
    });
})




var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    var msg = input.value;
    if (input.value != "") {
        input.value = "";
        socket.emit('new message', {
            msg: msg,
            nome: nome,
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
            nome: nome,
            room: room
        });
    }
}
socket.on('news message', (data) => {
    var mensagens = document.getElementById('mensagens');
    var item = document.createElement('li');
    item.textContent = data.nome + ' disse: ' + data.msg;
    mensagens.appendChild(item);
    mensagens.scrollTo(0, document.body.scrollHeight);
})