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

### API Endpoints

- `GET /api/jets` - Get all jets
- `GET /api/jets/:id` - Get a specific jet by ID
- `POST /api/jets` - Create a new jet
- `PUT /api/jets/:id` - Update a jet
- `DELETE /api/jets/:id` - Delete a jet

### API Documentation

The API is documented using OpenAPI/Swagger:

- Access the interactive API documentation at: `http://localhost:3000/api-docs`
- The OpenAPI schema is available at: `openapi.yaml`

### Creating a New Jet

```bash
curl -X POST http://localhost:3000/api/jets \
  -H "Content-Type: application/json" \
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