# Dodgeball Manager API

A Node.js/TypeScript Express API for the Dodgeball Manager game.

## Overview

This API provides endpoints for managing a football-manager style dodgeball autobattler game. The initial implementation includes authentication using Supabase and basic game functionality.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account with project setup

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the sample environment file and update with your Supabase credentials:

```bash
cp .env.sample .env
```

4. Update the `.env` file with your Supabase project URL and API keys from the Supabase dashboard.

5. Apply the database migrations to your Supabase project:
   
   - Option 1: Run SQL from Supabase dashboard:
     - Go to your Supabase project dashboard
     - Navigate to SQL Editor
     - Copy and paste the contents of `migrations/001_initial_schema.sql`
     - Run the query
   
   - Option 2: Use psql if you have it installed:
     ```bash
     psql -h your_supabase_host -p 5432 -d postgres -U postgres -f migrations/001_initial_schema.sql
     ```

6. (Optional) Seed test data by modifying `migrations/002_seed_data.sql` to use your user ID, then running it:
   - Replace 'your-user-id-here' with your actual Supabase Auth user ID
   - Run the SQL through the Supabase dashboard or psql

## Development

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

API documentation is available at `http://localhost:3000/api-docs`.

## API Endpoints

### Current Endpoints

- `GET /api/games/current` - Get the current game for the authenticated user

### Authentication

All API endpoints require authentication using a JWT token. The token should be included in the Authorization header as a Bearer token.

```
Authorization: Bearer your_jwt_token
```

You can obtain a JWT token by authenticating through Supabase Auth.

## Project Structure

The project follows a modular structure with separation of concerns:

```
src/
  ├── config/        # Configuration
  ├── controllers/   # Request handlers
  ├── middleware/    # Express middleware
  ├── models/        # Data models (for future use)
  ├── routes/        # API routes
  ├── services/      # Business logic
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  └── index.ts       # Application entry point
```

## Building for Production

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Adding New Features

When adding new features to the API:

1. Define any new database tables/columns in a new migration file
2. Create corresponding TypeScript interfaces in the `types` directory
3. Add business logic in the `services` directory
4. Create controllers to handle HTTP requests
5. Define routes with proper authentication and validation
6. Update Swagger documentation

## Testing

Run tests with:

```bash
npm test
```

## License

[MIT](LICENSE)
