import User from '../models/user.model.js';

export const updateSettings = async (req, res) => {
  try {
    const { section, data } = req.body;
    const userId = req.user.userId;

    if (!section || !data) {
      return res.status(400).json({ message: 'Section and data are required' });
    }

    const allowedSections = ['profile', 'preferences', 'privacy', 'security'];
    if (!allowedSections.includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (section === 'profile') {
      // Handle profile updates - separate fullName, email from profile subdocument
      if (data.fullName !== undefined) {
        user.fullName = data.fullName;
        delete data.fullName;
      }
      if (data.email !== undefined) {
        user.email = data.email;
        delete data.email;
      }
      // Remaining data goes to profile subdocument
      user.profile = { ...user.profile, ...data };
    } else {
      // Update other sections normally
      user[section] = { ...user[section], ...data };
    }

    await user.save();

    res.json({
      message: 'Settings updated successfully',
      data: section === 'profile' ? {
        fullName: user.fullName,
        email: user.email,
        ...user.profile
      } : user[section]
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

export const getSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-passwordHash -refreshTokens');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      profile: {
        fullName: user.fullName,
        email: user.email,
        bio: user.profile.bio,
        location: user.profile.location,
        website: user.profile.website,
        avatar: user.profile.avatar
      },
      preferences: user.preferences,
      privacy: user.privacy,
      security: user.security
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};
