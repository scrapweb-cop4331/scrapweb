const express = require('express');
const argon2 = require('argon2');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const EMAIL = process.env.SMTP_USER;
const EMAIL_PASSWORD = process.env.SMTP_PASS
const MONGOURI = process.env.MONGODB_URI;

const app = express();
app.use(cors());
app.use(express.json());

const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD
    }
});

mongoose.connect(MONGOURI);

const user = new mongoose.Schema({
    first_name: String,
    last_name: String,
    username: String,
    email: String,
    hashedPassword: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

const User = mongoose.model('User', user);

// Create
app.post('/api/register', async (req, res) => {
    const { first_name, last_name, username, email, password } = req.body;
    if (!first_name || !last_name || !username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const existingUser = await User.findOne({ 
        $or: [{ username }, { email }] 
    });
    if (existingUser) {
        return res.status(409).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await argon2.hash(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const userBody = { first_name, last_name, username, email, hashedPassword, verificationToken };
    const newUser = await User.create(userBody);
    
    const verificationLink = `http://localhost:5000/api/verify-email?token=${verificationToken}`;
    
    if (mailTransporter) {
        await mailTransporter.sendMail({
            from: EMAIL,
            to: newUser.email,
            subject: 'Verify your email address',
            text: `Please verify your email by clicking: ${verificationLink}`,
            html: `<a href="${verificationLink}">Click here to verify your email</a>`
        });
        
        console.log(`Verification email sent to: ${newUser.email}`);
    }

    res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
        user: { id: newUser._id, first_name: newUser.first_name, last_name: newUser.last_name, username: newUser.username, email: newUser.email }
    });
});

// Verify Email
app.get('/api/verify-email', async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ error: 'Token is required' });

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email successfully verified! You can now log in.' });
});

// Read
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await User.findOne({ username });
    
    if (user && await argon2.verify(user.hashedPassword, password)) {
        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email before logging in.' });
        }
        
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: { id: user._id, first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email }
        });
    } else {
        res.status(401).json({ error: 'invalid login' });
    }
});

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: 'A reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const resetLink = `http://localhost:5000/api/reset-password?token=${resetToken}`;
    
    if (mailTransporter) {
        await mailTransporter.sendMail({
            from: process.env.SMTP_USER || '"Your App" <no-reply@yourapp.com>',
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click this link to reset it: ${resetLink}`,
            html: `<p>You requested a password reset.</p><a href="${resetLink}">Click here to reset your password</a>`
        });
        
        console.log(`Reset email sent to: ${user.email}`);
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

    const user = await User.findOne({ 
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    user.hashedPassword = await argon2.hash(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been successfully reset. You can now log in.' });
});

// Update
app.patch('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    
    const { first_name, last_name, username, email, password } = req.body;
    if (!first_name && !last_name && !username && !email && !password) return res.status(400).json({ error: 'No fields to update' });

    const updateInfo = {};
    if (first_name) updateInfo.first_name = first_name;
    if (last_name) updateInfo.last_name = last_name;
    if (username) updateInfo.username = username;
    if (email) updateInfo.email = email;
    if (password) updateInfo.hashedPassword = await argon2.hash(password);

    const result = await User.findByIdAndUpdate(id, updateInfo, { new: true });
    if (!result) return res.status(404).json({ error: 'User not found' });
    
    res.json({ id: result._id, first_name: result.first_name, last_name: result.last_name, username: result.username, email: result.email });
});

// Delete
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    const result = await User.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'User not found' });
    
    res.json({ message: 'User deleted successfully', id: result._id });
});

app.listen(5000, () => {
    console.log('Server is running');
});
