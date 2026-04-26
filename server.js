const express = require('express');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

const app = express();

// Настройка Cloudinary (данные берутся из настроек хостинга)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'share_files',
        resource_type: 'auto' 
    },
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

// Маршрут для загрузки
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('Файл не выбран');
    res.json({ url: req.file.path, name: req.file.originalname });
});

// Маршрут для получения списка (берем последние 30 файлов)
app.get('/files', async (req, res) => {
    try {
        const result = await cloudinary.api.resources({ 
            type: 'upload', 
            prefix: 'share_files/',
            max_results: 30 
        });
        const files = result.resources.map(file => ({
            name: file.public_id.replace('share_files/', ''),
            url: file.secure_url
        }));
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Работаем на порту ${PORT}`));