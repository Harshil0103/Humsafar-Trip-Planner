const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { generateToken } = require('../middleware/auth');

async function register(req, res) {
  try {
    const { name, email, password, bio, avatar_url } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const defaultAvatar = avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`;

    const result = await db.run(
      `INSERT INTO users (name, email, password_hash, role, avatar_url, bio)
       VALUES (?, ?, ?, 'user', ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), password_hash, defaultAvatar, bio || 'Travel enthusiast & world explorer.']
    );

    const newUser = await db.get(
      'SELECT id, name, email, role, avatar_url, bio, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again later.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await getDb();
    const user = await db.get(
      'SELECT id, name, email, password_hash, role, avatar_url, bio, created_at FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      bio: user.bio,
      created_at: user.created_at
    };

    const token = generateToken(userProfile);

    return res.json({
      message: 'Login successful.',
      token,
      user: userProfile
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
}

async function getMe(req, res) {
  try {
    return res.json({ user: req.user });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, bio, avatar_url, current_password, new_password } = req.body;
    const db = await getDb();

    let password_hash = null;
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password.' });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(new_password, salt);
    }

    if (password_hash) {
      await db.run(
        `UPDATE users
         SET name = COALESCE(?, name),
             bio = COALESCE(?, bio),
             avatar_url = COALESCE(?, avatar_url),
             password_hash = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, bio, avatar_url, password_hash, req.user.id]
      );
    } else {
      await db.run(
        `UPDATE users
         SET name = COALESCE(?, name),
             bio = COALESCE(?, bio),
             avatar_url = COALESCE(?, avatar_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, bio, avatar_url, req.user.id]
      );
    }

    const updatedUser = await db.get(
      'SELECT id, name, email, role, avatar_url, bio, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
}

async function firebaseSync(req, res) {
  try {
    const { email, name, avatar_url, firebase_uid } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required for Firebase authentication sync.' });
    }

    const db = await getDb();
    let user = await db.get(
      'SELECT id, name, email, role, avatar_url, bio, created_at FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (!user) {
      // Create new user for this Firebase account
      const salt = await bcrypt.genSalt(10);
      const randomPassword = (firebase_uid || Math.random().toString(36).substring(2)) + '_FirebaseSecret2026!';
      const password_hash = await bcrypt.hash(randomPassword, salt);
      const defaultAvatar = avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`;

      const result = await db.run(
        `INSERT INTO users (name, email, password_hash, role, avatar_url, bio)
         VALUES (?, ?, ?, 'user', ?, ?)`,
        [
          (name || email.split('@')[0]).trim(),
          email.trim().toLowerCase(),
          password_hash,
          defaultAvatar,
          'Traveler exploring the world with Humsafar.'
        ]
      );

      user = await db.get(
        'SELECT id, name, email, role, avatar_url, bio, created_at FROM users WHERE id = ?',
        [result.lastID]
      );
    } else if (avatar_url && (!user.avatar_url || user.avatar_url.includes('unsplash'))) {
      // Update avatar if provided by Google/Firebase
      await db.run('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url, user.id]);
      user.avatar_url = avatar_url;
    }

    const token = generateToken(user);

    return res.json({
      message: 'Firebase sync successful.',
      token,
      user
    });
  } catch (err) {
    console.error('Firebase sync error:', err);
    return res.status(500).json({ error: 'Failed to synchronize Firebase user.' });
  }
}

module.exports = {
  register,
  login,
  firebaseSync,
  getMe,
  updateProfile
};
