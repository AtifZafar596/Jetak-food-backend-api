const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AA Food Delivery API',
      version: '1.0.0',
      description: 'API documentation for AA Food Delivery application',
      contact: {
        name: 'API Support',
        email: 'support@aafood.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
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
        },
        Location: {
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
            address: {
              type: 'string'
            },
            latitude: {
              type: 'number'
            },
            longitude: {
              type: 'number'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/api/v1/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs; 