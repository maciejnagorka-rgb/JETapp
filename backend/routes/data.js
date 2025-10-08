const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');

// Schemat dla danych (np. notatki, tracker)
const dataSchema = new mongoose.Schema({
  type: { type: String, required: true },
  content: { type: Object, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now }
});
const Data = mongoose.model('Data', dataSchema);

// Dodaj notatkę
router.post('/', auth, async (req, res) => {
  try {
    const { type, content } = req.body;
    if (!type || !content) {
      return res.status(400).json({ message: 'Typ i treść są wymagane' });
    }
    const newData = new Data({ type, content, ownerId: req.user.userId });
    await newData.save();
    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pobierz dane użytkownika
router.get('/mydata', auth, async (req, res) => {
  try {
    const data = await Data.find({ ownerId: req.user.userId });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Usuń notatkę
router.delete('/:id', auth, async (req, res) => {
  try {
    const data = await Data.findOne({ _id: req.params.id, ownerId: req.user.userId });
    if (!data) return res.status(404).json({ message: 'Notatka nie znaleziona lub brak uprawnień' });
    await Data.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Notatka usunięta' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;