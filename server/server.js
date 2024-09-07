const express = require('express');
const mongoose = require('mongoose');
const Photo = require('./models/Photo'); // Add this line
const multer = require('multer');
const cors = require('cors');
const path = require('path');
// const expressJson = require('express-json'); // Added import

console.log('Server starting...');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Added middleware

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a new route to get all photos
app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Error fetching photos', error: error.toString() });
  }
});

mongoose.connect('mongodb+srv://yuebooscar:Bu7UoHfq6QS9xu2p@cluster09022024.wgyoc.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.get('/api/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

// Make the route handler async
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    const newPhoto = new Photo({
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      filename: req.file.filename,
      user: 'anonymous', // We'll update this when we add authentication
    });
    await newPhoto.save();
    console.log('Sending upload response:', newPhoto);
    res.status(201).json(newPhoto); // Send the photo object directly
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Error uploading photo', error: error.message });
  }
});

app.post('/api/photos/:id/feedback', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  console.log('Received feedback request:', id, { text });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid photo ID' });
  }

  try {
    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const newFeedback = { text, createdAt: new Date() };
    photo.feedback.push(newFeedback);
    await photo.save();

    console.log('Updated photo:', photo);
    res.status(201).json(photo);
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Photo upload route
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newPhoto = new Photo({
      filename: req.file.filename,
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
    });

    await newPhoto.save();
    console.log('New photo saved:', newPhoto);
    res.status(201).json(newPhoto);
  } catch (error) {
    console.error('Error saving photo:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/photos/:id', async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
