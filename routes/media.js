const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');

const router = express.Router();
const JWT_SECRET = process.env.jwt_secret_key;

const upload = multer({ storage: multer.memoryStorage() });

let gfsBucket;
mongoose.connection.once('open', () => {
    gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'mediaBucket'
    });
});

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Auth token required' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

let User;
try {
    User = mongoose.model('User');
} catch (error) {
    console.error('User model not found. Ensure user.js is required before media.js');
}

router.get('/file/:id', async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        const files = await gfsBucket.find({ _id: fileId }).toArray();
        
        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.set('Content-Type', files[0].contentType);
        res.set('Content-Disposition', `inline; filename="${files[0].filename}"`);

        const downloadStream = gfsBucket.openDownloadStream(fileId);
        downloadStream.pipe(res);
    } catch (err) {
        res.status(400).json({ error: 'Invalid file ID or server error' });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ media: user.media });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

const uploadToGridFS = (file) => {
    return new Promise((resolve, reject) => {
        if (!gfsBucket) return reject(new Error('GridFS not initialized'));
        
        const uploadStream = gfsBucket.openUploadStream(file.originalname, {
            contentType: file.mimetype
        });
        
        uploadStream.end(file.buffer);
        
        uploadStream.on('finish', () => resolve(`/api/media/file/${uploadStream.id}`));
        uploadStream.on('error', reject);
    });
};

const deleteFromGridFS = async (fileUrl) => {
    if (!gfsBucket || !fileUrl) return;
    try {
        const fileIdString = fileUrl.split('/').pop();
        if (fileIdString) {
            const fileId = new mongoose.Types.ObjectId(fileIdString);
            await gfsBucket.delete(fileId);
        }
    } catch (err) {
        console.error('Failed to delete file from GridFS:', err.message);
    }
};

router.post('/', authenticate, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
    try {
        let photoUrl = '';
        let audioUrl = '';
        const text = req.body.text || '';

        if (req.files && req.files['photo']) {
            photoUrl = await uploadToGridFS(req.files['photo'][0]);
        }
        
        if (req.files && req.files['audio']) {
            audioUrl = await uploadToGridFS(req.files['audio'][0]);
        }
        
        const newMediaItem = {
            id: crypto.randomUUID(),
            photo: photoUrl,
            audio: audioUrl,
            text: text,
            createdAt: new Date()
        };

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.media.push(newMediaItem);
        await user.save();

        const newToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            message: 'Media added to user', 
            mediaItem: newMediaItem,
            token: newToken
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

router.patch('/:id', authenticate, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const mediaId = req.params.id;
        const mediaIndex = user.media.findIndex(item => item.id === mediaId);

        if (mediaIndex === -1) {
            return res.status(404).json({ error: 'Media item not found' });
        }

        if (req.body.text !== undefined) {
            user.media[mediaIndex].text = req.body.text;
        }

        if (req.files && req.files['photo']) {
            if (user.media[mediaIndex].photo) await deleteFromGridFS(user.media[mediaIndex].photo);
            user.media[mediaIndex].photo = await uploadToGridFS(req.files['photo'][0]);
        }
        
        if (req.files && req.files['audio']) {
            if (user.media[mediaIndex].audio) await deleteFromGridFS(user.media[mediaIndex].audio);
            user.media[mediaIndex].audio = await uploadToGridFS(req.files['audio'][0]);
        }

        user.markModified('media');
        await user.save();

        const newToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            message: 'Media updated', 
            mediaItem: user.media[mediaIndex],
            token: newToken
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const mediaId = req.params.id;
        const mediaIndex = user.media.findIndex(item => item.id === mediaId);
        
        if (mediaIndex === -1) {
            return res.status(404).json({ error: 'Media item not found' });
        }

        const mediaItem = user.media[mediaIndex];
        
        if (mediaItem.photo) await deleteFromGridFS(mediaItem.photo);
        if (mediaItem.audio) await deleteFromGridFS(mediaItem.audio);
        
        user.media.splice(mediaIndex, 1);

        user.markModified('media');
        await user.save();

        res.json({ message: 'Media record removed from user' });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

module.exports = router;