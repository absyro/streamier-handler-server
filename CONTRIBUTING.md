# Contributing to Streamier API Server

Thank you for your interest in contributing to Streamier API Server! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/absyro/streamier-api-server.git
   cd streamier-api-server
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

1. Make your changes following the [Style Guide](#style-guide)
2. Write or update tests as needed
3. Ensure all tests pass:
   ```bash
   pnpm test
   ```
4. Run linting:
   ```bash
   pnpm lint
   ```
5. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/) specification

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation if needed
3. The PR must pass all CI checks
4. You may merge the PR once you have the sign-off of at least one other developer

## Style Guide

### Code Style

- Use TypeScript for all new code
- Follow the ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages following the Conventional Commits specification

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

Example:

```
feat: add streaming capabilities

- Implement WebSocket connection handling
- Add stream validation middleware
- Update documentation

Closes #123
```

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting a PR
- Follow the existing test patterns in the codebase

## Documentation

- Update documentation for any new features or changes
- Keep the README.md up to date
- Document any breaking changes
- Add comments to complex code sections

## Questions?

If you have any questions about contributing, please open an issue in the repository.
