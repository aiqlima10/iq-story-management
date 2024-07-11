import mongoose from 'mongoose';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Story from '../../../models/Story';

const storySchema = new mongoose.Schema({
title: { type: String, required: true },
content: { type: String, required: true },
author: { type: String, required: true },
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now }
});

const Story = mongoose.model('Story', storySchema);

export default Story;

export default NextAuth({
// Configure one or more authentication providers
providers: [
Providers.Credentials({
name: 'credentials',
credentials: {
username: { label: 'Username', type: 'text' },
password: { label: 'Password', type: 'password' }
},
authorize: async (credentials) => {
const user = await User.findOne({ email: credentials.username });
if (!user) {
throw new Error('Invalid username or password');
}
const isValid = await user.comparePassword(credentials.password);
if (!isValid) {
throw new Error('Invalid username or password');
}
return user;
}
})
],

// Configure session management
session: {
jwt: true,
maxAge: 30 * 24 * 60 * 60 // 30 days
},

// Configure callbacks
callbacks: {
async jwt(token, user, account, profile, isNewUser) {
// Add custom claims to the JWT token
return {
sub: user.id,
name: user.name,
email: user.email
};
},
async session(session, token, user) {
// Add custom session data
session.user = user;
return session;
}
}
});

export default NextAuth({
async create(req, res) {
const { title, content, author } = req.body;
const story = new Story({ title, content, author });
try {
await story.save();
res.status(201).json({ message: 'Story created successfully' });
} catch (error) {
res.status(500).json({ message: 'Error creating story' });
}
}
});

export default NextAuth({
async getStory(req, res) {
const id = req.query.id;
const story = await Story.findById(id);
if (!story) {
res.status(404).json({ message: 'Story not found' });
}
res.status(200).json({ story });
},

async updateStory(req, res) {
const id = req.query.id;
const { title, content, author } = req.body;
const story = await Story.findByIdAndUpdate(id, { title, content, author }, { new: true });
if (!story) {
res.status(404).json({ message: 'Story not found' });
}
res.status(200).json({ message: 'Story updated successfully' });
},

async deleteStory(req, res) {
const id = req.query.id;
await Story.findByIdAndRemove(id);
res.status(204).json({ message: 'Story deleted successfully' });
}
});
