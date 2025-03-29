import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dodgeball Manager API',
      version: '1.0.0',
      description: 'API for managing dodgeball teams and games',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Player: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            game_id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['draft', 'team', 'opponent', 'scout', 'transfer', 'sold', 'rejected'],
            },
            throwing: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            catching: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            dodging: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            blocking: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            speed: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            positional_sense: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            teamwork: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            clutch_factor: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            throwing_potential: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            catching_potential: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            dodging_potential: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            blocking_potential: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            speed_potential: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            positional_sense_potential: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            teamwork_potential: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            clutch_factor_potential: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            tier: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            potential_tier: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        GetDraftPlayersResponse: {
          type: 'object',
          properties: {
            players: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Player',
              },
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);
