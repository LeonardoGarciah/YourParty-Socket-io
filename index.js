// Requirimento de modulos

const app = require('express')();

const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const io = require('socket.io')(http);
const SocketAntiSpam = require('socket-anti-spam');

//Variaveis globais
var name;
var roomA;
var users = [];
var banned = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/javascript', express.static(path.join(__dirname, 'javascript')));
app.set('views', path.join(__dirname, '/views'));

// Rota inicial
app.get('/', (req, res) => {

    if (Object.keys(req.query).length === 0 || req.query.room.length === 0) {
        res.redirect('/enter');
    }
    res.render('index');

});

// Rota de entrada na sala
app.get('/enter', (req, res) => {

    res.render('enter');

});



// Verificação de spam socket-io
const socketAntiSpam = new SocketAntiSpam({
    banTime: 0.1,
    kickThreshold: 10,
    kickTimesBeforeBan: 2,
    banning: true,
    io: io,
})

// Verificação de spam socket-io - Ban
socketAntiSpam.event.on('ban', dat => {
    let data = {
        msg: name + ' foi banido!',
        name: 'Bot',
        room: roomA
    };
    banned.push(name);
    io.to(data.room).emit('news message', data);
    io.to(socket.id).emit('Banido', true);
})

// Verificação de spam socket-io - Kick
socketAntiSpam.event.on('kick', (socket, dat) => {
    let data = {
        msg: name + ' levou um kick!',
        name: 'Bot',
        room: roomA
    };
    io.to(socket.id).emit('kickado', true);
    io.to(data.room).emit('news message', data);
})

// Comunicação socket-io
io.on('connection', (socket) => {

    // Inserior usuario
    socket.emit('insertUser', "");

    // Pausar video
    socket.on('pause', (room) => {
        socket.to(room).emit('pauseA', true);
    });

    // Play video
    socket.on('play', (room) => {
        socket.to(room).emit('playA', true);
    });

    // Reiniciar video
    socket.on('stop', (room) => {
        socket.to(room).emit('stopA', true);
    });

    // Entrar na sala
    socket.on('entrar', (data) => {
        roomA = data;
        socket.join(data);
        console.log("Entrou na sala " + data);
    });

    // Enviar posição atual do video
    socket.on('sync', (data) => {
        socket.to(data.room).emit('syncA', data.tempo);
    });

    // Trocar video  
    socket.on('change', (data) => {
        socket.broadcast.emit('changeA', data);
    });

    // Enviar nova mensagem
    socket.on('new message', (data) => {
        data.msg = data.msg.trim();
        if (data.msg.length <= 200 && data.msg.length != 0) {
            io.to(data.room).emit('news message', data);
        }
    });
    // Novo usuario
    socket.on('new user', (data) => {
        var nameS = data.name;
        name = data.name;
        var stop = false;
        if (nameS != "" && nameS != null && banned.indexOf(name) == -1) {
            for (let c = 0; c < users.length; c++) {
                if (users[c].name == nameS) {
                    stop = true;
                    break;
                }
            }
            if (stop == false) {
                users.push(data);
                var result = [];
                for (var c = 0; c < users.length; c++) {

                    if (users[c].room == data.room) {
                        result.push(users[c]);
                    }
                }
                io.to(data.room).emit('allUsers', result);
            } else {

                socket.emit('insertUser', "");
            }
        } else {
            socket.emit('insertUser', "");
        }
    });
    // Validação de desconexão
    socket.on('disconnect', () => {
        users.splice(users.indexOf(name), 1);
        var result = [];
        for (var c = 0; c < users.length; c++) {

            if (users[c].room == roomA) {
                result.push(users[c]);
            }
        }
        io.to(roomA).emit('allUsers', result);
        console.log("Desconectou-se");
    });
})

http.listen(process.env.PORT || 3000, () => {

    console.log('Rodando na porta *:3000');

});