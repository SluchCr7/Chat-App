module.exports = {
  type: 'object',
  properties: {
    requestId: { type: 'string', format: 'uuid' },
    requester: { $ref: '#/components/schemas/User' },
    receiver: { $ref: '#/components/schemas/User' },
    status: { type: 'string', enum: ['pending', 'accepted', 'rejected'], example: 'pending' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
