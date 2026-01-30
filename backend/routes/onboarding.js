const express = require('express');
const { createProfile } = require('../utils/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Complete onboarding
router.post('/', auth, async (req, res) => {
  try {
    const {
      academicBackground,
      studyGoals,
      budget,
      examReadiness,
      preferredCountries,
      currentStage
    } = req.body;

    const profile = await createProfile(req.user.id, {
      academicBackground,
      studyGoals,
      budget,
      examReadiness,
      preferredCountries,
      currentStage
    });

    res.status(201).json({
      message: 'Onboarding completed successfully',
      profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;