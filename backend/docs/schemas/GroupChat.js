module.exports = {
  type: 'object',
  properties: {
    _id: { type: 'string', format: 'uuid' },
    name: { type: 'string', example: 'Engineering Squad' },
    description: { type: 'string', example: 'A private channel for team discussions' },
    avatar: { $ref: '#/components/schemas/Attachment' },
    coverImage: { $ref: '#/components/schemas/Attachment' },
    creator: { $ref: '#/components/schemas/User' },
    inviteLink: { type: 'string', example: 'a1b2c3d4e5f6' },
    members: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          role: { type: 'string', enum: ['owner', 'admin', 'moderator', 'member'] },
          joinedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    joinRequests: {
      type: 'array',
      items: { $ref: '#/components/schemas/User' },
    },
    isPrivate: { type: 'boolean', example: false },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
