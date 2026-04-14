const express = require('express');
const argon2 = require('argon2');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

const router = express.Router();

const JWT_SECRET = process.env.jwt_secret_key;
const MONGO_CONNECTION_STRING = process.env.mongo_connection_string;
const SERVER_HOST = process.env.server_host;
const SENDGRID_API_KEY = process.env.sendgrid_api_key;

sgMail.setApiKey(SENDGRID_API_KEY);

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

// Register
router.post('/register', async (req, res) => {
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

    const verificationLink = `https://${SERVER_HOST}/api/verify-email?token=${verification_token}`;

    const msg = {
        to: newUser.email,
        from: 'Scrapweb <scrapweb88@gmail.com>',
        subject: 'Verify your email address',
        html: `<a href="${verificationLink}">Click here to verify your email</a>`
    };

    sgMail.send(msg)
        .then(() => {
            console.log(`Verification email sent to: ${newUser.email}`);
        })
        .catch((error) => {
            console.error('SendGrid API Error:', error);
            if (error.response) {
                console.error(error.response.body);
            }
        });

    res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
        user: { id: newUser._id, first_name: newUser.first_name, last_name: newUser.last_name, username: newUser.username, email: newUser.email }
    });
});

// Verify Email
router.get('/verify-email', async (req, res) => {
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

    if (!token) return res.status(400).send(renderHtml('Verification Failed', 'A token is required.', true));

    const user = await User.findOne({ verification_token: token });
    if (!user) return res.status(400).send(renderHtml('Verification Failed', 'Your verification link is invalid or has already been used.', true));

    user.is_verified = true;
    user.verification_token = undefined;
    await user.save();

    res.send(renderHtml('Email Verified', 'Your email has been successfully verified!', false));
});

// Login
router.post('/login', async (req, res) => {
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
        res.status(401).json({ error: 'Invalid login' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.reset_password_token = resetToken;
    user.reset_password_expires = Date.now() + 3600000;
    await user.save();

    const resetLink = `https://${SERVER_HOST}/api/reset-password?token=${resetToken}`;

    const msg = {
        to: user.email,
        from: 'Scrapweb <scrapweb88@gmail.com>', // Ensure this email is verified in SendGrid
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click this link: ${resetLink}`,
        html: `<p>You requested a password reset.</p><a href="${resetLink}">Click here to reset your password</a>`
    };

    sgMail.send(msg)
        .then(() => {
            console.log(`Password reset email sent to: ${user.email}`);
        })
        .catch((error) => {
            console.error('SendGrid API Error:', error);
            if (error.response) {
                console.error(error.response.body);
            }
        });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// Reset Password Page
router.get('/reset-password', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const user = await User.findOne({
        reset_password_token: token,
        reset_password_expires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired.' });

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Reset Your Password</title>
        <style>
            body { font-family: sans-serif; background-color: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { background: white; padding: 40px; border-radius: 8px; max-width: 400px; width: 100%; border-top: 5px solid #3b82f6; }
            h1 { font-size: 24px; margin-bottom: 24px; text-align: center; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; }
            input[type="password"] { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-size: 16px; }
            button { width: 100%; background-color: #3b82f6; color: white; padding: 14px; border: none; border-radius: 6px; font-weight: 600; font-size: 16px; cursor: pointer; margin-top: 10px; }
            #message { margin-top: 20px; text-align: center; font-size: 14px; padding: 10px; border-radius: 6px; display: none; }
            .success-msg { background-color: #d1fae5; color: #065f46; }
            .error-msg { background-color: #fee2e2; color: #991b1b; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Reset Your Password</h1>
            <form id="resetForm">
                <input type="hidden" id="token" value="${token}">
                <div class="form-group">
                    <label>New Password</label>
                    <input type="password" id="newPassword" required placeholder="Enter new password">
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
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
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

    const user = await User.findOne({
        reset_password_token: token,
        reset_password_expires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Reset token is invalid or has expired.' });

    user.password = await argon2.hash(newPassword);
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();

    res.json({ message: 'Password has been successfully reset. You can now log in.' });
});

// Update User
router.patch('/users/:id', async (req, res) => {
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

// Delete User
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    const result = await User.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully', id: result._id });
});

module.exports = router;
