module.exports = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string', example: 'Invalid credentials provided' },
    details: { type: 'string', nullable: true, example: 'Email must be a valid email address' },
  },
};
