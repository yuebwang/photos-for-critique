const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  filename: String,
  title: String,
  description: String,
  feedback: [{
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;