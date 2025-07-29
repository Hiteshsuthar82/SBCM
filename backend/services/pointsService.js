const User = require('../models/User');
const PointsHistory = require('../models/PointsHistory');

const awardPoints = async (userId, points, source, referenceId) => {
  const user = await User.findById(userId);
  user.points += points;
  await user.save();
  await PointsHistory.create({
    userId,
    type: 'earned',
    points,
    description: `Points for ${source}`,
    source,
    referenceId,
  });
};

const redeemPoints = async (userId, points, source, referenceId) => {
  const user = await User.findById(userId);
  user.points -= points;
  await user.save();
  await PointsHistory.create({
    userId,
    type: 'redeemed',
    points: -points,
    description: `Points redeemed for ${source}`,
    source,
    referenceId,
  });
};

module.exports = { awardPoints, redeemPoints };