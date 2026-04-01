const express = require('express');
const argon2 = require('argon2');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = process.env.jwt_secret_key;
const EMAIL = process.env.smtp_user;
const EMAIL_PASSWORD = process.env.smtp_pass;
const MONGO_CONNECTION_STRING = process.env.mongo_connection_string;
const PORT = process.env.port || 5000;
const SERVER_HOST = process.env.server_host || 'localhost';

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

mongoose.connect(MONGO_CONNECTION_STRING);

const user = new mongoose.Schema({
    first_name: String,
    last_name: String,
    username: String,
    email: String,
    password: String,
    media: [],
    is_verified: { type: Boolean, default: false },
    verification_token: String,
    reset_password_token: String,
    reset_password_expires: Date
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

    const hashed_password = await argon2.hash(password);
    const verification_token = crypto.randomBytes(32).toString('hex');

    const userBody = { first_name, last_name, username, email, password: hashed_password, verification_token };
    const newUser = await User.create(userBody);
    
    const verificationLink = `http://${SERVER_HOST}:${PORT}/api/verify-email?token=${verification_token}`;
    
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

    const renderHtml = (title, message, isError) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%; border-top: 5px solid ${isError ? '#ef4444' : '#10b981'}; }
            h1 { color: #111827; margin-bottom: 16px; font-size: 24px; }
            p { color: #4b5563; margin-bottom: 30px; line-height: 1.5; font-size: 16px; }
            .btn { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background-color 0.2s; }
            .btn:hover { background-color: #2563eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${title}</h1>
            <p>${message}</p>
        </div>
    </body>
    </html>
    `;

    if (!token) {
        return res.status(400).send(renderHtml('Verification Failed', 'A token is required to verify your email address.', true));
    }

    const user = await User.findOne({ verification_token: token });

    if (!user) {
        return res.status(400).send(renderHtml('Verification Failed', 'Your verification link is invalid or has already been used.', true));
    }

    user.is_verified = true;
    user.verification_token = undefined;
    await user.save();

    res.send(renderHtml('Email Verified', 'Your email has been successfully verified! You can now access all features of your account.', false));
});

// Read
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await User.findOne({ username });
    
    if (user && await argon2.verify(user.password, password)) {
        if (!user.is_verified) {
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
    user.reset_password_token = resetToken;
    user.reset_password_expires = Date.now() + 3600000;
    await user.save();

    const resetLink = `http://${SERVER_HOST}:${PORT}/api/reset-password?token=${resetToken}`;
    
    if (mailTransporter) {
        await mailTransporter.sendMail({
            from: EMAIL || '"Your App" <no-reply@yourapp.com>',
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click this link to reset it: ${resetLink}`,
            html: `<p>You requested a password reset.</p><a href="${resetLink}">Click here to reset your password</a>`
        });
        
        console.log(`Reset email sent to: ${user.email}`);
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// Reset Password Page
app.get('/api/reset-password', async (req, res) => {
    const { token } = req.query;

    const renderError = (message) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password Failed</title>
        <style>
            body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%; border-top: 5px solid #ef4444; }
            h1 { color: #111827; margin-bottom: 16px; font-size: 24px; }
            p { color: #4b5563; margin-bottom: 30px; line-height: 1.5; font-size: 16px; }
            .btn { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background-color 0.2s; }
            .btn:hover { background-color: #2563eb; }
            .icon { font-size: 48px; margin-bottom: 16px; color: #ef4444; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">❌</div>
            <h1>Reset Failed</h1>
            <p>${message}</p>

        </div>
    </body>
    </html>
    `;

    if (!token) {
        return res.status(400).send(renderError('A token is required to reset your password.'));
    }

    const user = await User.findOne({ 
        reset_password_token: token,
        reset_password_expires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).send(renderError('Your password reset link is invalid or has expired. Please request a new one.'));
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 100%; max-width: 400px; border-top: 5px solid #3b82f6; }
            h1 { color: #111827; margin-bottom: 24px; font-size: 24px; text-align: center; }
            .form-group { margin-bottom: 20px; text-align: left; }
            label { display: block; margin-bottom: 8px; color: #374151; font-weight: 500; font-size: 14px; }
            input[type="password"] { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-size: 16px; transition: border-color 0.2s; }
            input[type="password"]:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
            button { width: 100%; background-color: #3b82f6; color: white; padding: 14px; border: none; border-radius: 6px; font-weight: 600; font-size: 16px; cursor: pointer; transition: background-color 0.2s; margin-top: 10px; }
            button:hover { background-color: #2563eb; }
            button:disabled { background-color: #9ca3af; cursor: not-allowed; }
            #message { margin-top: 20px; text-align: center; font-size: 14px; padding: 10px; border-radius: 6px; display: none; }
            .success-msg { background-color: #d1fae5; color: #065f46; border: 1px solid #34d399; }
            .error-msg { background-color: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Reset Your Password</h1>
            <form id="resetForm">
                <input type="hidden" id="token" value="${token}">
                <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <input type="password" id="newPassword" required placeholder="Enter new password">
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" required placeholder="Confirm new password">
                </div>
                <button type="submit" id="submitBtn">Update Password</button>
            </form>
            <div id="message"></div>
        </div>

        <script>
            document.getElementById('resetForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const token = document.getElementById('token').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const messageEl = document.getElementById('message');
                const btn = document.getElementById('submitBtn');

                messageEl.style.display = 'block';

                if (newPassword !== confirmPassword) {
                    messageEl.textContent = 'Passwords do not match.';
                    messageEl.className = 'error-msg';
                    return;
                }
                if (newPassword.length < 6) {
                    messageEl.textContent = 'Password must be at least 6 characters.';
                    messageEl.className = 'error-msg';
                    return;
                }

                btn.disabled = true;
                btn.textContent = 'Updating...';

                try {
                    const response = await fetch('/api/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token, newPassword })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        messageEl.innerHTML = 'Password successfully reset!';
                        messageEl.className = 'success-msg';
                        document.getElementById('resetForm').style.display = 'none';
                    } else {
                        messageEl.textContent = data.error || 'Failed to reset password.';
                        messageEl.className = 'error-msg';
                        btn.disabled = false;
                        btn.textContent = 'Update Password';
                    }
                } catch (error) {
                    messageEl.textContent = 'Network error. Please try again.';
                    messageEl.className = 'error-msg';
                    btn.disabled = false;
                    btn.textContent = 'Update Password';
                }
            });
        </script>
    </body>
    </html>
    `);
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

    const user = await User.findOne({ 
        reset_password_token: token,
        reset_password_expires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    user.password = await argon2.hash(newPassword);
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
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
    if (password) updateInfo.password = await argon2.hash(password);

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

app.listen(PORT, () => {
    console.log('Server is running');
});
