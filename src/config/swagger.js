const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AA Food API Documentation',
      version: '1.0.0',
      description: 'API documentation for AA Food application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Location: {
          type: 'object',
          required: ['user_id', 'address', 'latitude', 'longitude'],
          properties: {
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'The ID of the user',
            },
            address: {
              type: 'string',
              description: 'The full address of the location',
            },
            latitude: {
              type: 'number',
              format: 'float',
              description: 'The latitude coordinate',
            },
            longitude: {
              type: 'number',
              format: 'float',
              description: 'The longitude coordinate',
            },
            additional_note: {
              type: 'string',
              description: 'Additional information about the location (e.g., apartment number, floor)',
            },
            is_default: {
              type: 'boolean',
              description: 'Whether this is the default location for the user',
              default: false,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'string',
              description: 'Detailed error information',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
            hint: {
              type: 'string',
              description: 'Helpful hint for resolving the error',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            phone: {
              type: 'string'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        AdminLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@testing.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'admin'
            }
          }
        },
        AdminUser: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@testing.com'
            },
            role: {
              type: 'string',
              enum: ['admin'],
              example: 'admin'
            }
          }
        },
        AdminLoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            token: {
              type: 'string',
              description: 'JWT token for authentication'
            },
            user: {
              $ref: '#/components/schemas/AdminUser'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            image_url: {
              type: 'string'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Store: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            image_url: {
              type: 'string'
            },
            category_id: {
              type: 'string',
              format: 'uuid'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            price: {
              type: 'number'
            },
            image_url: {
              type: 'string'
            },
            store_id: {
              type: 'string',
              format: 'uuid'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            store_id: {
              type: 'string',
              format: 'uuid'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
            },
            total_amount: {
              type: 'number'
            },
            delivery_address: {
              type: 'string'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      securitySchemes: {
        userIdHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-User-ID',
          description: 'User ID header for authentication',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
    },
    security: [
      {
        userIdHeader: [],
      },
      {
        bearerAuth: []
      }
    ],
  },
  apis: ['./src/routes/api/v1/*.routes.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs; 