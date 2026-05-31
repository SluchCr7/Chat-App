module.exports = {
  type: 'object',
  required: ['username', 'email'],
  properties: {
    _id: { type: 'string', format: 'uuid' },
    username: { type: 'string', example: 'johndoe' },
    email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
    profileName: { type: 'string', example: '@johnny' },
    profilePic: {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' },
        publicId: { type: 'string', nullable: true },
      },
    },
    bannerPic: {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' },
        publicId: { type: 'string', nullable: true },
      },
    },
    description: { type: 'string', example: 'Productive backend engineer' },
    socialLinks: {
      type: 'object',
      properties: {
        github: { type: 'string', format: 'uri', example: 'https://github.com/johndoe' },
        twitter: { type: 'string', format: 'uri', example: 'https://twitter.com/johndoe' },
        linkedin: { type: 'string', format: 'uri', example: 'https://linkedin.com/in/johndoe' },
      },
    },
    status: {
      type: 'string',
      enum: ['online', 'offline', 'away', 'busy', 'invisible'],
    },
    isOnline: { type: 'boolean', example: false },
    isVerified: { type: 'boolean', example: true },
    isAdmin: { type: 'boolean', example: false },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
