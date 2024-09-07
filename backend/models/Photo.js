const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  title: String,
  description: String,
  filename: String,
  uploadDate: { type: Date, default: Date.now },
  user: String, // We'll replace this with a proper user reference later
});

module.exports = mongoose.model('Photo', PhotoSchema);
