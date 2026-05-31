module.exports = {
  type: 'object',
  properties: {
    url: { type: 'string', format: 'uri', example: 'https://cdn.example.com/files/12345.jpg' },
    publicId: { type: 'string', nullable: true, example: 'chat_attachment_12345' },
    fileType: { type: 'string', enum: ['image', 'video', 'audio', 'voice', 'document'] },
    name: { type: 'string', example: 'document.pdf' },
    size: { type: 'number', example: 188345 },
  },
};
