const app = require('express')();

const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(http);
const path = require('path');
const express = require('express');

var users = [];

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


io.on('connection', (socket) => {
    var nome;
    var roomA;

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
        if (data.msg.length <= 200) {
            io.to(data.room).emit('news message', data);
        } else {
            data.msg = "Mensangem bloqueada";
            io.to(data.room).emit('news message', data);
        }
    });
    socket.on('new user', (data) => {
        var nomeS = data.nome;
        var parar = false;
        if (nomeS != "" && nomeS != null) {
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

http.listen(process.env.PORT, () => {

    console.log('Rodando na porta *:3000');

});