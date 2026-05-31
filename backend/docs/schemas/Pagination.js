module.exports = {
  type: 'object',
  properties: {
    page: { type: 'integer', example: 1 },
    pages: { type: 'integer', example: 5 },
    total: { type: 'integer', example: 42 },
    limit: { type: 'integer', example: 10 },
  },
};
