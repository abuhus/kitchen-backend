const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET user by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST to update user pantry + shoppingList
router.post('/:username', async (req, res) => {
  const { shoppingList, pantry } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: { shoppingList, pantry } },
      { new: true, upsert: true } // upsert = create if doesn't exist
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:username/preferences
router.get('/:username/preferences', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      username: user.username,
      preferences: user.preferences || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/:username/preferences
router.post('/:username/preferences', async (req, res) => {
  const { preferences } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { preferences },
      { new: true, upsert: true }
    );
    res.json({ message: 'Preferences updated', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});


module.exports = router;
