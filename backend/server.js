const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const Photo = require('./models/Photo');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// TODO: Set up MongoDB connection
mongoose.connect('mongodb+srv://yuebooscar:Bu7UoHfq6QS9xu2p@cluster09022024.wgyoc.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    const newPhoto = new Photo({
      title: req.body.title,
      description: req.body.description,
      filename: req.file.filename,
      user: 'anonymous', // We'll update this when we add authentication
    });
    await newPhoto.save();
    res.json({ message: 'Photo uploaded successfully', photo: newPhoto });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photo', error: error.message });
  }
});

app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ uploadDate: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving photos', error: error.message });
  }
});

app.listen(5001, () => {
  console.log(`Server is running on port: ${port}`);
});