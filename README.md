# Streamier API Server

A powerful NestJS-based API server that provides real-time communication capabilities through WebSockets, built with scalability and maintainability in mind.

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- TypeScript
- PostgreSQL

## Installation

1. Clone the repository:

```bash
git clone https://github.com/absyro/streamier-api-server.git
cd streamier-api-server
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
DB_PASSWORD=dbpassword
DB_NAME=dbname
```

## Development

Start the development server:

```bash
pnpm start:dev
```

The server will be available at `http://localhost:3000`

## Available Scripts

- `pnpm start` - Start the application
- `pnpm start:dev` - Start the application in development mode
- `pnpm start:debug` - Start the application in debug mode
- `pnpm start:prod` - Start the application in production mode
- `pnpm build` - Build the application
- `pnpm lint` - Run ESLint
- `pnpm doc` - Generate documentation

## Documentation

API documentation is available at `/docs` when running the server.

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the terms specified in [LICENSE.md](LICENSE.md).

## Security

For security concerns, please refer to our [Security Policy](SECURITY.md).
