# Contributing to SkillBuilder

Thank you for your interest in contributing to SkillBuilder!

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/praveencs87/skillbuilder.git
cd skillbuilder
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

## Project Structure

```
skillbuilder/
├── src/
│   ├── commands/       # CLI command implementations
│   ├── generators/     # Editor-specific rule generators
│   ├── build/          # Build and ingestion system
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── cli.ts          # CLI entry point
│   └── index.ts        # Library exports
├── dist/               # Compiled output
└── tests/              # Test files
```

## Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and add tests

3. Run tests and linting:
```bash
npm test
npm run lint
```

4. Build to verify:
```bash
npm run build
```

5. Commit your changes:
```bash
git commit -m "Description of changes"
```

6. Push and create a pull request

## Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Keep functions focused and small
- Write tests for new features

## Testing

- Unit tests for utilities and core logic
- Integration tests for commands
- Golden file tests for generators

Run tests with:
```bash
npm test
npm run test:watch  # Watch mode
```

## Adding New Editor Support

To add support for a new editor:

1. Add the editor to `EditorTarget` type in `src/types/config.ts`
2. Create a generator in `src/generators/your-editor.ts`
3. Add the generator to `src/generators/index.ts`
4. Update default output config in `src/types/config.ts`
5. Add tests
6. Update documentation

## Questions?

Open an issue for discussion before starting major changes.
