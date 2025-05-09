# Jetkeep

A CLI tool for managing and keeping track of your jets.

## Features

- Add, update, and remove jets
- Track jet details (name, type, location)
- Monitor jet status (active, maintenance, grounded)
- Add notes for each jet
- Command-line interface for easy management

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm 

### Install from source

```bash
# Clone the repository
git clone https://github.com/HousekeepLtd/jetkeep.git
cd jetkeep

# Install dependencies
npm install

# Build the project
npm run build

# Create a global symlink
npm link
```

## Usage

```
Usage: jetkeep [options] [command]

A CLI tool for managing and keeping track of your jets

Options:
  -V, --version          output the version number
  -h, --help             display help for command

Commands:
  list [options]         List all your jets
  show <id>              Show details for a specific jet
  add [options] <name>   Add a new jet
  update [options] <id>  Update a jet
  remove <id>            Remove a jet
  init                   Initialize the storage
  help [command]         display help for command
```

### Initialize Storage

```bash
jetkeep init
```

### Add a Jet

```bash
jetkeep add "Gulfstream G650" -t "Business Jet" -l "Hangar 3, LAX" -s "active" -n "Recently acquired"
```

Options:
- `-t, --type <type>`: Type of jet
- `-l, --location <location>`: Where the jet is stored
- `-s, --status <status>`: Status (active, maintenance, grounded)
- `-n, --notes <notes>`: Additional notes

### List Jets

```bash
# List all jets
jetkeep list

# List jets with detailed information
jetkeep list -d
```

### Show Jet Details

```bash
jetkeep show <id>
```

### Update a Jet

```bash
jetkeep update <id> -n "New Name" -s "maintenance" --notes "Engine inspection required"
```

Options:
- `-n, --name <name>`: New name
- `-t, --type <type>`: New type
- `-l, --location <location>`: New location
- `-s, --status <status>`: New status (active, maintenance, grounded)
- `--notes <notes>`: New notes

### Remove a Jet

```bash
jetkeep remove <id>
```

## Data Storage

Jetkeep stores your jet data in `~/.jetkeep/jets.json`.

## Development

This project is built with:

- TypeScript
- Node.js
- Commander.js for CLI functionality
- Chalk for colorful terminal output

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