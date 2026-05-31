module.exports = {
  SuccessResponse: {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
  },
  CreatedResponse: {
    description: 'Resource created successfully',
  },
  ValidationError: {
    description: 'Validation failed for the request',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
  UnauthorizedError: {
    description: 'Authentication credentials were missing or invalid',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
  ForbiddenError: {
    description: 'You do not have permission to access this resource',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
  NotFoundError: {
    description: 'Resource not found',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
  ConflictError: {
    description: 'Conflict occurred while processing the request',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
  UnprocessableEntity: {
    description: 'Unprocessable entity',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
  TooManyRequests: {
    description: 'Too many requests',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
  InternalServerError: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
};
