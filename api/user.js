// Check JWT, Mongo, and port

const express = require('express');
const argon2 = require('argon2');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const JWT_SECRET = 'SECRET_KEY_HERE';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('MONGODB_CONNECTION_STRING_HERE');

const user = new mongoose.Schema({
    username: String,
    email: String,
    hashedPassword: String
});

const User = mongoose.model('User', user);

// Create
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    // Check for existing user
    const existingUser = await User.findOne({ 
        $or: [{ username }, { email }] 
    });
    if (existingUser) {
        return res.status(409).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await argon2.hash(password);

    const userBody = { username, email, hashedPassword };
    const newUser = await User.create(userBody);
    
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({
        token,
        user: { id: newUser._id, username: newUser.username, email: newUser.email }
    });
});

// Read
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await User.findOne({ username });
    
    if (user && await argon2.verify(user.hashedPassword, password)) {
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } else {
        res.status(401).json({ error: 'invalid login' });
    }
});

// Update
app.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    
    const { username, email, password } = req.body;
    if (!username && !email && !password) return res.status(400).json({ error: 'No fields to update' });

    const updateInfo = {};
    if (username) updateInfo.username = username;
    if (email) updateInfo.email = email;
    if (password) updateInfo.hashedPassword = await argon2.hash(password);

    const result = await User.findByIdAndUpdate(id, updateInfo, { new: true });
    if (!result) return res.status(404).json({ error: 'User not found' });
    
    res.json({ id: result._id, username: result.username, email: result.email });
});

// Delete
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    const result = await User.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'User not found' });
    
    res.json({ message: 'User deleted successfully', id: result._id });
});

// TODO: Check port number
app.listen(5000, () => {
    console.log('Server is running');
});
