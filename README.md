# Jetkeep

A CLI tool and API for managing and keeping track of your jets.

## CLI Usage

A command-line interface for managing jets:

```
Usage: jetkeep [options] [command]

A CLI tool for managing and keeping track of your jets

Options:
  -V, --version          output the version number
  -h, --help             display help for command

Commands:
  list [options]         List all your jets
  show <id>              Show details for a specific jet
  add [options] <n>   Add a new jet
  update [options] <id>  Update a jet
  remove <id>            Remove a jet
  init                   Initialize the storage
  help [command]         display help for command
```

### CLI Commands

#### Initialize Storage

```bash
jetkeep init
```

#### Add a Jet

```bash
jetkeep add "Gulfstream G650" -t "Business Jet" -l "Hangar 3, LAX" -s "active" -n "Recently acquired"
```

Options:
- `-t, --type <type>`: Type of jet
- `-l, --location <location>`: Where the jet is stored
- `-s, --status <status>`: Status (active, maintenance, grounded)
- `-n, --notes <notes>`: Additional notes

#### List Jets

```bash
# List all jets
jetkeep list

# List jets with detailed information
jetkeep list -d
```

#### Show Jet Details

```bash
jetkeep show <id>
```

#### Update a Jet

```bash
jetkeep update <id> -n "New Name" -s "maintenance" --notes "Engine inspection required"
```

Options:
- `-n, --name <n>`: New name
- `-t, --type <type>`: New type
- `-l, --location <location>`: New location
- `-s, --status <status>`: New status (active, maintenance, grounded)
- `--notes <notes>`: New notes

#### Remove a Jet

```bash
jetkeep remove <id>
```

## API Server

### Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/HousekeepLtd/jetkeep.git
   cd jetkeep
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up MongoDB:
   - Make sure MongoDB is installed and running on your system
   - The default connection string is `mongodb://localhost:27017/jetkeep`
   - You can customize the connection string in the `.env` file

4. Build the project:
   ```
   npm run build
   ```

### Running the Backend API Server

Start the backend server:

```
npm run server
```

For development with hot reloading:

```
npm run server:dev
```

The server will start at http://localhost:3000 (or the port specified in your `.env` file).

### Authentication

The API includes user authentication and role-based access control:

- Register a new user: `POST /api/auth/register`
- Login to get a JWT token: `POST /api/auth/login`
- View your profile: `GET /api/auth/profile` (requires authentication)
- Generate an API key: `POST /api/auth/api-key` (requires authentication)
- Revoke an API key: `DELETE /api/auth/api-key` (requires authentication)

You can access protected endpoints using:
1. JWT token in the Authorization header: `Authorization: Bearer <token>`
2. API key in the X-API-Key header: `X-API-Key: <api-key>`

A default admin user is created automatically with:
- Email: admin@jetkeep.com (customizable via ADMIN_EMAIL env variable)
- Password: admin123 (customizable via ADMIN_PASSWORD env variable)
- Username: admin (customizable via ADMIN_USERNAME env variable)

### API Endpoints

**Jets**
- `GET /api/jets` - Get all jets (admin sees all, regular users see only their own)
- `GET /api/jets/:id` - Get a specific jet by ID (only owner or admin can view)
- `POST /api/jets` - Create a new jet (user becomes the owner)
- `PUT /api/jets/:id` - Update a jet (only owner or admin can update)
- `DELETE /api/jets/:id` - Delete a jet (only owner or admin can delete)

**Users**
- `GET /api/users` - Get all users (requires admin role)
- `GET /api/users/:id` - Get a specific user (own account or admin role)
- `POST /api/users` - Create a new user (requires admin role)
- `PUT /api/users/:id` - Update a user (own account or admin role)
- `DELETE /api/users/:id` - Delete a user (requires admin role)

### API Documentation

The API is documented using OpenAPI/Swagger:

- Access the interactive API documentation at: `http://localhost:3000/api-docs`
- The OpenAPI schema is available at: `openapi.yaml`

### Example: Creating a New Jet

```bash
# First login to get a token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@jetkeep.com", "password": "admin123"}'

# Then use the token to create a jet
curl -X POST http://localhost:3000/api/jets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"name": "Boeing 747", "type": "Commercial", "location": "Hangar 5"}'

# Or generate an API key for easier access
curl -X POST http://localhost:3000/api/auth/api-key \
  -H "Authorization: Bearer <your-token>"

# Then use the API key
curl -X POST http://localhost:3000/api/jets \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-api-key>" \
  -d '{"name": "Boeing 747", "type": "Commercial", "location": "Hangar 5"}'
```

## Database Structure

Jets are stored with the following structure:

```typescript
{
  name: string;       // Required
  type: string;       // Optional
  location: string;   // Optional
  createdAt: Date;    // Automatically set on creation
}
```

## Data Storage

CLI version stores your jet data in `~/.jetkeep/jets.json`.

API version stores data in MongoDB.

## MCP (Model Context Protocol) Servers

Jetkeep includes two separate MCP servers that allow AI agents to interact with the system:

1. **Custom MCP Server** - A custom implementation following MCP principles
2. **Official MCP Server** - An implementation using the official TypeScript SDK

Both servers provide the same functionality but with different implementations.

### MCP Setup

Both MCP servers run automatically when you start the main server with `npm run server`:
- Custom MCP server listens on port 3001 by default (configurable with the MCP_PORT environment variable)
- Official MCP server listens on port 3005 by default (configurable with the OFFICIAL_MCP_PORT environment variable)

### Custom MCP Server

The custom MCP server provides:

1. A natural language interface at `/v1/generate` that processes messages and returns answers or function calls
2. A direct function execution interface at `/mcp/function` (requires API key)
3. A function call processing endpoint at `/mcp/run` (requires API key)

### Example Custom MCP Interaction

```bash
# Natural language query
curl -X POST http://localhost:3001/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "List all jets"}]}'

# Direct function execution
curl -X POST http://localhost:3001/mcp/function \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-api-key>" \
  -d '{"name": "list_jets", "parameters": {}}'

# Process function calls
curl -X POST http://localhost:3001/mcp/run \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-api-key>" \
  -d '{"function_calls": [{"name": "list_jets", "parameters": {}}]}'
```

### Official MCP Server

The official MCP server follows the MCP 1.0 specification using the official TypeScript SDK:

```bash
# Natural language query
curl -X POST http://localhost:3005/v1 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "X-API-Key: <your-api-key>" \
  -d '{"messages": [{"role": "user", "content": "List all jets"}]}'

# Direct function call
curl -X POST http://localhost:3005/v1 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "X-API-Key: <your-api-key>" \
  -d '{"functions": [{"name": "list_jets", "arguments": "{}"}]}'
```

### Available MCP Functions (Both Servers)

- `list_jets` - List all jets in the system (admin sees all, regular users see only their own)
- `get_jet` - Get details of a specific jet by ID (only owner or admin can view)
- `create_jet` - Add a new jet to the system (user becomes the owner)
- `update_jet` - Update an existing jet's information (only owner or admin can update)
- `delete_jet` - Delete a jet from the system (only owner or admin can delete)

### MCP Schema

- Custom MCP server schema: `http://localhost:3001/schema`
- Official MCP server uses standard MCP 1.0 protocol

## Development

This project is built with:

- TypeScript
- Node.js
- Commander.js for CLI functionality
- Express for the API server
- MongoDB for database storage

To contribute to development:

```bash
# Clone the repository
git clone https://github.com/HousekeepLtd/jetkeep.git
cd jetkeep

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## License

ISC