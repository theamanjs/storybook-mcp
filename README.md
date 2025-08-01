# Storybook MCP Server

⚠️ This tool was created for testing purposes and is not recommended for use in production environments.

This project provides a custom [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/servers) server that integrates with Storybook to support UI development workflows.

It enables AI tools (like Cursor, Claude, or other AI agents) to query available UI components, retrieve comprehensive component information, and help developers work more efficiently with design systems.

---

## 🎯 Purpose

This MCP server is designed to:

- Help AI models understand and work with existing UI components
- Provide detailed component analysis including props, variants, and usage examples
- Enable intelligent code generation using established design system components
- Bridge the gap between component libraries and AI-assisted development

---

## Getting Started

Before you begin, you need to prepare your Storybook static files.
https://storybook.js.org/docs/sharing/publish-storybook

### 1. Clone the repository

```bash
git clone https://github.com/m-yoshiro/storybook-mcp.git
cd storybook-mcp
```

### 2. Install dependencies

We recommend using [Bun](https://bun.sh)

```bash
bun install
# or
npm install
```

### 3. Build

```bash
bun run build
# or
npm run build
```

### 4. Set up

```json
{
  "mcpServers": {
    "storybook-mcp": {
      "command": "node",
      "args": [
        "/< your path>/index.js",
        // Optional: path to your Storybook static json file
        "/< your path>/index.json"
      ]
    }
  }
}
```

The server will load your Storybook data and expose MCP tools to external agents.

---

## 🎯 Enhanced Features

### `get-component-details` Tool

The `get-component-details` tool provides comprehensive component analysis in a structured JSON format, perfect for AI tools and agents. It includes:

- **Component Overview**: Name, ID, description, and summary statistics
- **Props Analysis**: Detailed prop information with types, defaults, and descriptions
- **Variants**: All available component variants with JSX examples
- **File Information**: Story files, component files, and import paths
- **Usage Examples**: Ready-to-use JSX code snippets
- **Metrics**: Complexity scores, documentation coverage, and health indicators

#### Example Output Structure

```json
{
  "component": {
    "name": "Button",
    "id": "button",
    "description": "Interactive button component",
    "overview": {
      "totalVariants": 2,
      "propsCount": 3,
      "warnings": []
    }
  },
  "props": [
    {
      "name": "color",
      "type": "string",
      "defaultValue": "primary",
      "description": "Button color theme",
      "hasDefault": true
    }
  ],
  "variants": [
    {
      "name": "Default",
      "jsx": "<Button>Click me</Button>",
      "file": "Button.stories.js"
    }
  ],
  "metrics": {
    "complexity": { "score": "Medium" },
    "healthScore": "Good"
  }
}
```

---

## 🔧 Available Tools

| Tool Name                 | Description                                                                                                                                    | Parameters                                                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list-components`         | Lists all available components from Storybook                                                                                                  | `path` (optional): Path to the index.json or stories.json file (optional if default path is provided)                                                    |
| `find-components-by-name` | Finds components based on a keyword (partial match supported)                                                                                  | `name`: Component name or keyword to search for<br>`path` (optional): Path to the index.json or stories.json file (optional if default path is provided) |
| `get-component-details`   | Returns comprehensive component information in structured JSON format including props, variants, usage examples, file information, and metrics | `name`: Component name to get details for<br>`path` (optional): Path to the index.json or stories.json file (optional if default path is provided)       |

---

<!-- ## 💡 Example Use Cases

### 🔍 Find a matching component for a Figma element

Ask the AI:
> "What Storybook component matches this 'CTA Button' in my Figma design?"

➡️ MCP server runs:
- `find-component-by-name("cta button")`
- `get-component-details("PrimaryButton")`
- `get-component-usage-examples("PrimaryButton")`

### ✨ Auto-generate UI code from a Figma section

Ask the AI:
> "Generate a contact form using our design system"

➡️ MCP server:
- Suggests `TextField`, `Textarea`, `PrimaryButton`
- Provides JSX using those components

---

## 🧠 Why MCP?

MCP (Model Context Protocol) provides a standard interface for large language models to safely and efficiently access contextual information like UI components, documentation, and code.

By integrating your Storybook via MCP:

- AI agents can suggest components intelligently
- Designers and developers get a shared source of truth
- Natural language is enough to drive UI generation

---

## 📁 Project Structure

```
storybook-mcp/
├── src/
│   ├── tools/
│   │   ├── list-components.ts
│   │   ├── find-components-by-name.ts
│   │   ├── get-component-details.ts
│   │   └── ...
│   ├── storybook-api.ts
│   ├── utils.ts
│   └── index.ts
├── build/
├── README.md
└── package.json
```

---

## 🤝 Contributing

If you have ideas to improve or want to contribute new tools, feel free to open a PR or issue!

---

## 📜 License

MIT -->
