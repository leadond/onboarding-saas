// upload-image.js
// Simple Express server to upload an image and save it as:
// /Users/derrickleadon/Documents/onboarding-saas/components/kit-portal/logo.png
//
// Usage:
// 1. npm install express multer
// 2. node upload-image.js
// 3. Open http://localhost:3000 and POST an image using the form (field name: "image")

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const SAVE_DIR = '/Users/derrickleadon/Documents/onboarding-saas/components/kit-portal';
const SAVE_NAME = 'logo.png';
fs.mkdirSync(SAVE_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, SAVE_DIR),
    filename: (req, file, cb) => cb(null, SAVE_NAME) // overwrite existing logo.png
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'), false);
        cb(null, true);
    }
});

const app = express();

app.get('/', (req, res) => {
    res.send(`
        <form method="POST" action="/upload" enctype="multipart/form-data">
            <input type="file" name="image" accept="image/*" required />
            <button type="submit">Upload</button>
        </form>
    `);
});

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    res.send('Image uploaded and saved as logo.png');
});

app.use((err, req, res, next) => {
    res.status(400).send(err.message || 'Upload error');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Upload server running at http://localhost:${PORT}/`));