module.exports = {
  type: 'object',
  properties: {
    _id: { type: 'string', format: 'uuid' },
    username: { type: 'string', example: 'johndoe' },
    status: { type: 'string', enum: ['online', 'offline', 'away', 'busy', 'invisible'] },
    isOnline: { type: 'boolean', example: true },
  },
};
