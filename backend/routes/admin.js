const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const router = express.Router();

const adminAuth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Brak tokenu' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.isAdmin) return res.status(403).json({ error: 'Nie admin' });
  req.user = decoded;
  next();
};

router.put('/edit-file/:filename', adminAuth, (req, res) => {
  const { filename } = req.params;
  const content = req.body.content;
  fs.writeFileSync(`../${filename}`, content);
  res.json({ message: `Plik ${filename} zaktualizowany` });
});

router.get('/files', adminAuth, (req, res) => {
  const files = fs.readdirSync('..').filter(f => f.endsWith('.html'));
  res.json(files);
});

module.exports = router;