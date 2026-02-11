const requiredVars = [
  'SESSION_SECRET'
];

function validateEnv() {
  const missing = requiredVars.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    throw new Error(message);
  }
}

module.exports = {
  validateEnv
};
