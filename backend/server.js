const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const chalk = require('chalk');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Funkcja logowania z timestampem i kolorem
const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    const color = type === 'error' ? chalk.red : type === 'success' ? chalk.green : chalk.blue;
    console.log(`${color(`[${timestamp}] [${type.toUpperCase()}]`)} ${message}`);
};

log('Dotenv załadowany', 'info');
log(`MONGO_URI? ${process.env.MONGO_URI ? 'TAK' : 'NIE'}`, 'info');
log(`JWT_SECRET? ${process.env.JWT_SECRET ? 'TAK' : 'NIE'}`, 'info');

log('Łączenie z MongoDB...', 'info');
mongoose.connect(process.env.MONGO_URI)
    .then(() => log('MongoDB połączony!', 'success'))
    .catch(err => log(`BŁĄD DB: ${err.message}`, 'error'));

log('Ładowanie routes/auth...', 'info');
app.use('/api/auth', require('./routes/auth'));
log('Routes/auth OK', 'success');

log('Ładowanie routes/admin...', 'info');
app.use('/api/admin', require('./routes/admin'));
log('Routes/admin OK', 'success');

app.use(express.static('../')); // Serwuje pliki z folderu nadrzędnego względem backend
log('Frontend serwowany', 'info');

io.on('connection', (socket) => {
    log('Użytkownik połączony', 'info');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => log('Odłączony', 'info'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => log(`Serwer na porcie ${PORT}`, 'success'));