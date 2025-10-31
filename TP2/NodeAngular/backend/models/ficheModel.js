const mongoose = require('mongoose');

const ficheSchema = new mongoose.Schema({
  filename: String,
  path: String,
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fiche', ficheSchema);
