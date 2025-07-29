// Hardcoded configs; fetch from SystemConfig in production
module.exports = {
  points: {
    submission: 5,
    approval: 50,
    minWithdrawal: 100,
  },
  complaintTypes: ['cleanliness', 'punctuality', 'behavior', 'other'],
  enableRewards: true,
  enableLeaderboards: false,
};