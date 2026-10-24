const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();

// Enable CORS for all routes with more specific options
app.use(cors({
  origin: '*', // Be more specific in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(`✅ Connected to MongoDB (${mongoose.connection.host})`))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// ✅ Define User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  otp: String,
  password: String,
  dateOfBirth: Date,
  age: String,
  height: String,
  weight: String,
  sport: String,
  achievements: String,
  team: String,
  careerGoal: String,
  followers: [{ type: String }]  // ✅ New: Array to store followers' emails
}, { strict: false });

const User = mongoose.model('User', UserSchema);

// ✅ Define Post Schema
const PostSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  mediaUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema, 'post');

// ✅ Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ Function to Send OTP Email
const sendOTPEmail = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('❌ Error sending email:', error);
    } else {
      console.log('✅ OTP Email sent:', info.response);
    }
  });
};

// ✅ Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is reachable' });
});

// ✅ Signup Route
app.post('/signup', async (req, res) => {
  const { name, email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const otp = crypto.randomInt(10000, 99999).toString();

  const newUser = new User({ name, email, otp });
  await newUser.save();

  sendOTPEmail(email, otp);

  res.json({ message: "Signup successful. OTP sent to your email." });
});

// ✅ Verify OTP Route
app.post('/verify_otp', async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  if (user.otp === otp) {
    user.otp = null;
    await user.save();
    res.json({ message: "OTP verified successfully. Proceed to set password." });
  } else {
    res.status(400).json({ message: "Invalid OTP." });
  }
});

// ✅ Password Setup Route
app.post('/password_setup', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  user.password = password;
  await user.save();

  res.json({ message: "Password set successfully." });
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const cleanEmail = email ? email.trim() : "";
    console.log(`🔑 Login attempt for identifier: "${cleanEmail}", password length: ${password?.length || 0}`);

    const regex = new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');

    // Case-insensitive lookup by email, username, or name
    let user = await User.findOne({ 
      $or: [
        { email: regex },
        { username: regex },
        { name: regex }
      ]
    });

    // Fallback: check coach or club collections if not found in users
    if (!user) {
      const coach = await mongoose.connection.db.collection('coach ').findOne({
        $or: [
          { Name: regex },
          { "Contact Info": { $regex: cleanEmail, $options: 'i' } }
        ]
      });
      if (coach) {
        user = {
          name: coach.Name,
          email: cleanEmail,
          password: coach.password || "hashed_password"
        };
      }
    }

    if (!user) {
      console.log(`❌ User not found for: "${cleanEmail}"`);
      return res.status(400).json({ 
        message: `User not found for "${cleanEmail}".` 
      });
    }

    // Password check (supports actual password or sample 'hashed_password')
    if (user.password && user.password !== password && user.password !== "hashed_password") {
      console.log(`❌ Invalid password for: "${cleanEmail}"`);
      return res.status(400).json({ message: "Invalid password!" });
    }

    const displayName = user.name || user.username || "User";
    console.log(`✅ Login successful for: "${cleanEmail}" (${displayName})`);
    res.json({ message: "Login successful!", name: displayName });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Profile Setup Route
app.post('/profile_setup', async (req, res) => {
  try {
    console.log('Received profile setup request:', req.body);
    const { name, email, dateOfBirth, age, height, weight, sport } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.dateOfBirth = dateOfBirth;
    user.age = age;
    user.height = height;
    user.weight = weight;
    user.sport = sport;

    await user.save();

    res.status(200).json({
      message: "Profile setup successful",
      user: {
        name: user.name,
        email: user.email,
        age: user.age,
        sport: user.sport
      }
    });

  } catch (error) {
    console.error('❌ Profile setup error:', error);
    res.status(500).json({ 
      message: "Failed to setup profile",
      error: error.message 
    });
  }
});

// ✅ Additional Profile Setup Route
app.post('/additional_profile', async (req, res) => {
  try {
    console.log('Received additional profile request:', req.body);
    const { email, achievements, team, careerGoal } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (achievements) user.achievements = achievements;
    if (team) user.team = team;
    if (careerGoal) user.careerGoal = careerGoal;

    await user.save();

    res.status(200).json({
      message: "Additional profile setup successful",
      user: {
        name: user.name,
        email: user.email,
        achievements: user.achievements,
        team: user.team,
        careerGoal: user.careerGoal
      }
    });

  } catch (error) {
    console.error('❌ Additional profile setup error:', error);
    res.status(500).json({ 
      message: "Failed to setup additional profile",
      error: error.message 
    });
  }
});

// ✅ Search Users Route
app.get('/search_users', async (req, res) => {
  try {
    const { name } = req.query;
    const users = await User.find({
      $or: [
        { name: { $regex: name || '', $options: 'i' } },
        { username: { $regex: name || '', $options: 'i' } }
      ]
    }).select('name username email followers');

    res.json(users.map(user => ({
      name: user.name || user.username || "User",
      email: user.email,
      isFollowing: Array.isArray(user.followers) ? user.followers.includes(req.query.currentUserEmail) : false
    })));
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Create Post Route
app.post('/create_post', async (req, res) => {
  try {
    const { userName, title, description, mediaUrl } = req.body;

    if (!userName || !title || !description) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const newPost = new Post({ userName, title, description, mediaUrl });
    await newPost.save();

    res.status(201).json({ message: 'Post created successfully!', post: newPost });
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ✅ Fetch All Posts Route
app.get('/get_posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// ✅ Follow/Unfollow User Route
app.post('/follow', async (req, res) => {
  try {
    const { followerEmail, followeeEmail } = req.body;
    const followee = await User.findOne({ email: followeeEmail });

    if (!followee) return res.status(404).json({ message: "User not found!" });

    const isFollowing = followee.followers.includes(followerEmail);
    isFollowing ? followee.followers.pull(followerEmail) : followee.followers.push(followerEmail);
    
    await followee.save();
    res.json({ message: isFollowing ? "Followed successfully!" : "Unfollowed successfully!" });
  } catch (error) {
    console.error("❌ Follow/Unfollow error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get Single Post
app.get('/get_post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Like a Post
app.post('/like_post', async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.body.postId, { $inc: { likes: 1 } });
    res.json({ message: "Liked!" });
  } catch (error) {
    res.status(500).json({ message: "Error liking post" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
