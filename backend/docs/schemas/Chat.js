module.exports = {
  type: 'object',
  properties: {
    conversationId: { type: 'string', format: 'uuid' },
    participants: {
      type: 'array',
      items: { $ref: '#/components/schemas/User' },
    },
    lastMessage: { $ref: '#/components/schemas/Message' },
    unreadCount: { type: 'integer', example: 3 },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
