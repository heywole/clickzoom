require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('../server/models/User');
    const Tutorial = require('../server/models/Tutorial');
    const TutorialStep = require('../server/models/TutorialStep');

    // Clear existing seed data
    await User.deleteMany({ email: /seed@clickzoom/ });

    // Create demo user
    const user = await User.create({
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@clickzoom.dev',
      passwordHash: 'Demo1234!',
      isEmailVerified: true,
      subscriptionTier: 'pro',
    });

    // Create sample tutorial
    const tutorial = await Tutorial.create({
      creatorId: user._id,
      title: 'How to swap tokens on Uniswap',
      description: 'A complete walkthrough of swapping ETH to USDC on Uniswap v3',
      targetUrl: 'https://app.uniswap.org',
      inputMethod: 'manual',
      outputType: 'video',
      status: 'completed',
      voiceSettings: { language: 'en', voiceType: 'female', voiceStyle: 'professional', speed: 1 },
    });

    const steps = await TutorialStep.insertMany([
      { tutorialId: tutorial._id, stepNumber: 1, instructionText: 'Navigate to app.uniswap.org and click on the Swap button in the top navigation', clickTarget: { description: 'Swap button', xCoordinate: 720, yCoordinate: 80 } },
      { tutorialId: tutorial._id, stepNumber: 2, instructionText: 'Click Connect Wallet to connect your Web3 wallet', clickTarget: { description: 'Connect Wallet button', xCoordinate: 1320, yCoordinate: 80 } },
      { tutorialId: tutorial._id, stepNumber: 3, instructionText: 'Select the token you want to swap from. In this example we are swapping from ETH', clickTarget: { description: 'Select Token dropdown', xCoordinate: 720, yCoordinate: 320 } },
      { tutorialId: tutorial._id, stepNumber: 4, instructionText: 'Enter the amount of ETH you want to swap', clickTarget: { description: 'Amount input field', xCoordinate: 720, yCoordinate: 400 }, transactionDetails: { requiresTransaction: true, transactionCount: 1 } },
      { tutorialId: tutorial._id, stepNumber: 5, instructionText: 'Click the Swap button to execute your transaction and confirm in your wallet', clickTarget: { description: 'Swap button', xCoordinate: 720, yCoordinate: 520 } },
    ]);

    tutorial.steps = steps.map(s => s._id);
    await tutorial.save();

    console.log('\n✅ Seed complete!');
    console.log('   Demo user: demo@clickzoom.dev / Demo1234!');
    console.log(`   Tutorial: ${tutorial.title} (${tutorial._id})`);
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
