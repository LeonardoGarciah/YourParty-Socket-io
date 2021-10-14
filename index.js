const app = require('express')();

const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(http);
const path = require('path');
const express = require('express');
const SocketAntiSpam = require('socket-anti-spam');

var nome;
var roomA;
var users = [];
var banidos = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/javascript', express.static(path.join(__dirname, 'javascript')));
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req, res) => {

    if (Object.keys(req.query).length === 0 || req.query.room.length === 0) {
        res.redirect('/enter');
    }
    res.render('index');

});

app.get('/enter', (req, res) => {

    res.render('enter');

});




const socketAntiSpam = new SocketAntiSpam({
    banTime: 0.1, // Ban time in minutes
    kickThreshold: 10, // User gets kicked after this many spam score
    kickTimesBeforeBan: 2, // User gets banned after this many kicks
    banning: true, // Uses temp IP banning after kickTimesBeforeBan
    io: io, // Bind the socket.io variable
})

// Call functions with created reference 'socketAntiSpam'
socketAntiSpam.event.on('ban', dat => {
    let data = {
        msg: nome + ' foi banido!',
        nome: 'Bot',
        room: roomA
    };
    banidos.push(nome);
    io.to(data.room).emit('news message', data);
    io.to(socket.id).emit('Banido', true);
})

socketAntiSpam.event.on('kick', (socket, dat) => {
    let data = {
        msg: nome + ' levou um kick!',
        nome: 'Bot',
        room: roomA
    };
    io.to(socket.id).emit('kickado', true);
    io.to(data.room).emit('news message', data);
})

io.on('connection', (socket) => {


    socket.emit('insertUser', "");

    socket.on('pause', (room) => {
        socket.to(room).emit('pauseA', true);
    });
    socket.on('play', (room) => {
        socket.to(room).emit('playA', true);
    });
    socket.on('stop', (room) => {
        socket.to(room).emit('stopA', true);
    });
    socket.on('entrar', (data) => {
        roomA = data;
        socket.join(data);
        console.log("Entrou na sala " + data);
    });
    socket.on('sync', (data) => {
        socket.to(data.room).emit('syncA', data.tempo);
    });

    socket.on('change', (data) => {
        socket.broadcast.emit('changeA', data);
    });

    socket.on('new message', (data) => {
        data.msg = data.msg.trim();
        if (data.msg.length <= 200 && data.msg.length != 0) {
            io.to(data.room).emit('news message', data);
        }
    });
    socket.on('new user', (data) => {
        var nomeS = data.nome;
        nome = data.nome;
        var parar = false;
        if (nomeS != "" && nomeS != null && banidos.indexOf(nome) == -1) {
            for (let c = 0; c < users.length; c++) {
                if (users[c].nome == nomeS) {
                    parar = true;
                    break;
                }
            }
            if (parar == false) {
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

    socket.on('disconnect', () => {
        users.splice(users.indexOf(nome), 1);
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