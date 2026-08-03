const getJwtSecret = () => {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    console.warn("[WARNING] JWT Secret missing in environment variables. Falling back to default secure key.");
    return "default_chat_you_jwt_secret_key_2026_secure";
  }
  return secret;
};

const getRefreshTokenSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    console.warn("[WARNING] Refresh Token Secret missing in environment variables. Falling back to default secure key.");
    return "default_chat_you_refresh_token_secret_key_2026_secure";
  }
  return secret;
};

module.exports = {
  getJwtSecret,
  getRefreshTokenSecret,
};
