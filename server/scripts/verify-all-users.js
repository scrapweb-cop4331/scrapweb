// Dev-only: marks every account as email-verified so you can log in
// without SendGrid configured. Usage: npm run verify-users (from server/)
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_CONNECTION_STRING = process.env.mongo_connection_string;

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

async function main() {
    await mongoose.connect(MONGO_CONNECTION_STRING);
    const result = await User.updateMany(
        { is_verified: false },
        { $set: { is_verified: true }, $unset: { verification_token: '' } }
    );
    console.log(`Marked ${result.modifiedCount} account(s) as verified.`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
