const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Załaduj zmienne środowiskowe
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Wskazuje na C:\projekty\Jtac_app

// Połączenie z MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('[SUCCESS] MongoDB połączony!'))
.catch(err => console.log('[ERROR] Błąd połączenia z MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/data', require('./routes/data'));

// Serwowanie plików HTML
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../register.html'));
});
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});
// Usuwamy '*' jako domyślną trasę, bo może powodować konflikty

// Uruchomienie serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SUCCESS] Serwer na porcie ${PORT}`);
});