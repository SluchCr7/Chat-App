module.exports = {
  type: 'object',
  properties: {
    _id: { type: 'string', format: 'uuid' },
    content: { type: 'string', example: 'You have been invited to join the Engineering Squad group.' },
    sender: { $ref: '#/components/schemas/User' },
    receiver: { $ref: '#/components/schemas/User' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
