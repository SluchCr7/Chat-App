const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const responseComponents = require('../docs/components/responses');
const securitySchemes = require('../docs/security');
const examples = require('../docs/examples');
const schemas = require('../docs/schemas');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Chat Backend API',
    version: '1.0.0',
    description: 'Enterprise-grade Swagger/OpenAPI 3.0 documentation for the real-time chat backend.',
    contact: {
      name: 'Chat API Support',
      email: 'support@example.com',
      url: 'https://example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://staging.example.com',
      description: 'Staging server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  components: {
    schemas,
    responses: responseComponents,
    securitySchemes,
    examples,
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/socket.io': {
      get: {
        tags: ['Chats'],
        summary: 'Socket.IO realtime chat connection',
        description: 'Handshake endpoint for Socket.IO clients. Connect by passing `userId` as a query string parameter and then use Socket.IO events such as `joinRoom`, `leaveRoom`, `typingStart`, `typingStop`, and `markAsSeen`.',
        responses: {
          200: {
            description: 'Socket.IO connection handshake successful',
          },
        },
      },
    },
  },
  tags: [
    { name: 'Authentication', description: 'Login, registration, logout, and token flows' },
    { name: 'Users', description: 'User profile and account management' },
    { name: 'Chats', description: 'Chat conversation retrieval and overview' },
    { name: 'Messages', description: 'Send, edit, delete, and react to messages' },
    { name: 'Groups', description: 'Group creation, membership, and channels' },
    { name: 'Notifications', description: 'Notification management and delivery' },
    { name: 'Uploads', description: 'File and photo upload endpoints' },
    { name: 'Admin', description: 'Administrative insight and user controls' },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [path.join(__dirname, '../Routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
