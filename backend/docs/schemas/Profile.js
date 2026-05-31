module.exports = {
  type: 'object',
  properties: {
    _id: { type: 'string', format: 'uuid' },
    username: { type: 'string', example: 'johndoe' },
    email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
    profileName: { type: 'string', example: '@johnny' },
    profilePic: { $ref: '#/components/schemas/Attachment' },
    bannerPic: { $ref: '#/components/schemas/Attachment' },
    description: { type: 'string' },
    socialLinks: {
      type: 'object',
      properties: {
        github: { type: 'string', example: 'https://github.com/johndoe' },
        twitter: { type: 'string', example: 'https://twitter.com/johndoe' },
        linkedin: { type: 'string', example: 'https://linkedin.com/in/johndoe' },
      },
    },
    status: { type: 'string', enum: ['online', 'offline', 'away', 'busy', 'invisible'] },
    isOnline: { type: 'boolean' },
    isVerified: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
