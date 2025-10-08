const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const router = express.Router();

// Rejestracja z kodem aktywacyjnym (bez emaila)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, activationCode } = req.body;
    console.log('Rejestracja - dane:', { username, password, role, activationCode }); // Debug
    if (!username || !password) {
      return res.status(400).json({ message: 'Nazwa i hasło są wymagane' });
    }
    if (activationCode !== '#formoza_pany') {
      return res.status(401).json({ message: 'Nieprawidłowy kod aktywacyjny' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik już istnieje' });
    }
    const user = new User({ username, password, role: role || 'user' });
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(500).json({ message: error.message });
  }
});

// Logowanie
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Logowanie - dane:', { username, password }); // Debug
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Nieprawidłowy login lub hasło' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;