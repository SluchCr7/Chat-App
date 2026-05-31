module.exports = {
  type: 'object',
  properties: {
    _id: { type: 'string', format: 'uuid' },
    sender: { $ref: '#/components/schemas/User' },
    receiver: { $ref: '#/components/schemas/User' },
    group: { type: 'string', format: 'uuid' },
    channel: { type: 'string', format: 'uuid' },
    text: { type: 'string', example: 'Hello, are you available for a quick call?' },
    Photos: {
      type: 'array',
      items: { $ref: '#/components/schemas/Attachment' },
    },
    attachments: {
      type: 'array',
      items: { $ref: '#/components/schemas/Attachment' },
    },
    isRead: { type: 'boolean', example: false },
    deliveredTo: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
    },
    seenBy: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          user: { type: 'string', format: 'uuid' },
          seenAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    reactions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          user: { type: 'string', format: 'uuid' },
          emoji: { type: 'string', example: '👍' },
        },
      },
    },
    replyTo: { type: 'string', format: 'uuid' },
    isPinned: { type: 'boolean', example: false },
    starredBy: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
    },
    isEdited: { type: 'boolean', example: false },
    scheduledAt: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
