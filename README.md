# SkillBuilder

> CLI tool to create and maintain project-level AI instructions across multiple editors

SkillBuilder helps developers create and maintain consistent AI rules/instructions as Markdown files for Cursor, Windsurf, VS Code Copilot, and Antigravity.

## Features

- 🎯 **Multi-editor support**: Generate rules for Cursor, Windsurf, VS Code Copilot, and Antigravity
- 📝 **Interactive TUI**: Beautiful terminal interface with arrow key navigation
- 🔄 **Watch mode**: Auto-sync rules when documentation changes
- 🔒 **Safe merging**: Preserves manual edits outside managed sections
- 📚 **Documentation ingestion**: Fetch from URLs and local files
- 🎨 **Style presets**: Strict, balanced, or minimal rule templates
- 🔍 **Diagnostics**: Built-in doctor and lint commands

## Installation

```bash
# From npm (once published)
npm install -g skillbuilder

# Or install from GitHub
npm install -g https://github.com/praveencs87/skillbuilder
```

## Quick Start

1. **Initialize in your repository**:
```bash
cd your-project
skillbuilder init
```

2. **Create a skill**:
```bash
skillbuilder create "frontend-rules" --goal "Next.js app guidelines"
```

3. **Add documentation sources**:
```bash
skillbuilder add-url https://docs.example.com/architecture --skill frontend-rules
skillbuilder add-file ./docs/CONTRIBUTING.md --skill frontend-rules
```

4. **Sync rules to editors**:
```bash
skillbuilder sync
```

5. **Watch for changes**:
```bash
skillbuilder watch
```

## Commands

### `skillbuilder init`
Bootstrap SkillBuilder in a repository.

**Options:**
- `--targets <targets>` - Comma-separated list (cursor,windsurf,vscode,antigravity)
- `--style <style>` - Rule style (strict, balanced, minimal)
- `--non-interactive` - Skip prompts for CI

**Example:**
```bash
skillbuilder init --targets cursor,windsurf --style balanced
```

### `skillbuilder create [name]`
Create a new skill/rule pack.

**Options:**
- `--goal <goal>` - Goal statement
- `--scope <scope>` - Comma-separated path globs
- `--non-interactive` - Skip prompts

**Example:**
```bash
skillbuilder create "backend-rules" --goal "API development guidelines" --scope "src/api/**"
```

### `skillbuilder add-url <url>`
Add a URL as a documentation source.

**Options:**
- `--skill <skill-id>` - Skill ID to add the URL to

**Example:**
```bash
skillbuilder add-url https://nextjs.org/docs --skill frontend-rules
```

### `skillbuilder add-file <file>`
Add a local file as a documentation source.

**Options:**
- `--skill <skill-id>` - Skill ID to add the file to

**Example:**
```bash
skillbuilder add-file ./docs/ARCHITECTURE.md --skill core
```

### `skillbuilder build`
Build skill content from sources (fetches URLs, reads files, caches).

**Example:**
```bash
skillbuilder build
```

### `skillbuilder sync`
Generate and update editor-specific rules files.

**Options:**
- `--targets <targets>` - Only sync specific targets

**Example:**
```bash
skillbuilder sync --targets cursor,windsurf
```

### `skillbuilder watch`
Watch for changes and auto-sync.

**Example:**
```bash
skillbuilder watch
```

### `skillbuilder doctor`
Diagnose configuration issues.

**Example:**
```bash
skillbuilder doctor
```

### `skillbuilder lint`
Lint skill configuration for errors and warnings.

**Example:**
```bash
skillbuilder lint
```

## Configuration

SkillBuilder uses `skillbuilder.json` in your repository root:

```json
{
  "version": "1.0",
  "targets": ["cursor", "windsurf", "vscode", "antigravity"],
  "style": "balanced",
  "skills": [
    {
      "id": "core",
      "name": "Core Project Rules",
      "goal": "How to work in this repo safely",
      "scopes": [],
      "sources": {
        "urls": ["https://docs.example.com"],
        "files": ["./README.md"]
      },
      "constraints": {
        "tone": "concise",
        "safety": "strict",
        "formatting": {
          "noEmDash": true
        }
      }
    }
  ],
  "output": {
    "cursor": { "dir": ".cursor/rules" },
    "windsurf": { "dir": ".windsurf/rules", "global": ".windsurf/global_rules.md" },
    "vscode": { "file": ".github/copilot-instructions.md" },
    "antigravity": { "dir": ".antigravity/rules" }
  },
  "limits": {
    "maxUrlChars": 12000,
    "maxFileChars": 12000,
    "maxGeneratedCharsPerFile": 18000
  }
}
```

## Rule Styles

### Strict
- Short, focused rules
- Cautious about refactors
- Always run tests
- Clear do/don't sections

### Balanced (recommended)
- Includes repo commands
- Structure hints
- Moderate refactors allowed
- Comprehensive documentation

### Minimal
- High-level constraints only
- Safety rules
- Minimal verbosity

## Output Formats

### Cursor
Generates `.cursor/rules/*.md` files, one per skill.

### Windsurf
Generates `.windsurf/rules/*.md` files plus optional `global_rules.md`.

### VS Code / GitHub Copilot
Generates `.github/copilot-instructions.md` with all skills merged.

### Antigravity
Generates `.antigravity/rules/*.md` files.

## Safe Merging

SkillBuilder uses marker-based merging to preserve manual edits:

```markdown
<!-- skillbuilder:begin core -->
... generated content ...
<!-- skillbuilder:end core -->

Your manual notes here are preserved!
```

## CI/CD Integration

Use non-interactive mode in CI:

```bash
# Initialize
skillbuilder init --targets cursor,windsurf --style balanced --non-interactive

# Create skill
skillbuilder create "ci-rules" --goal "CI guidelines" --non-interactive

# Sync
skillbuilder sync

# Lint
skillbuilder lint
```

## Monorepo Support

Use scopes to target specific paths:

```bash
skillbuilder create "web-app" --scope "apps/web/**"
skillbuilder create "api" --scope "services/api/**"
```

## Troubleshooting

Run diagnostics:
```bash
skillbuilder doctor
```

Common issues:
- **Not in git repo**: Initialize git first
- **Missing config**: Run `skillbuilder init`
- **Markers corrupted**: Check for manual edits inside markers
- **Cache issues**: Delete `.skillbuilder/cache` and rebuild

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/cli.js init

# Run tests
npm test

# Watch mode
npm run dev
```

## License

MIT

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.
