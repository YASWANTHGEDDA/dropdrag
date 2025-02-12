const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/uploadsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Define a schema for storing image metadata
const imageSchema = new mongoose.Schema({
  filePath: String,
  uploadedAt: { type: Date, default: Date.now }
});

const Image = mongoose.model('Image', imageSchema);

// Create uploads folder if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));

// Upload and save file path to MongoDB
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an image.' });
  }

  const newImage = new Image({ filePath: `/uploads/${req.file.filename}` });
  await newImage.save();

  res.status(200).json({ filePath: newImage.filePath, message: "Image uploaded successfully" });
});

// Fetch all uploaded images
app.get('/images', async (req, res) => {
  const images = await Image.find();
  res.json(images);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
