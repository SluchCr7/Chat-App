module.exports = {
  BearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Use a valid JWT token to access protected resources',
  },
};
