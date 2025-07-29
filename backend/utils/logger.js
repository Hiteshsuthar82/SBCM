const log = (level, message) => {
  console[level](`[${level.toUpperCase()}] ${message}`);
};

module.exports = {
  info: (msg) => log('info', msg),
  error: (msg) => log('error', msg),
};