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

Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "storybook-mcp": {
      "command": "node",
      "args": [
        "/path/to/storybook-mcp/build/index.js",
        // Optional: path to your Storybook static json file
        "/path/to/your/storybook-static/stories.json"
      ]
    }
  }
}
```

**Note**: Replace `/path/to/` with your actual file paths. The second argument (Storybook static file path) is optional if you provide it when calling the tools.

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

## 💡 Example Use Cases

### 🔍 Get comprehensive component information

Ask the AI:

> "I need detailed information about the Button component including all its props and usage examples"

➡️ MCP server runs:

- `get-component-details("Button")`

Returns structured JSON with:

- Component overview and description
- All props with types, defaults, and descriptions
- Available variants with JSX examples
- File locations and import paths
- Usage examples ready to copy
- Complexity and health metrics

### 🔧 Find and analyze similar components

Ask the AI:

> "Show me all button-like components and their details"

➡️ MCP server runs:

- `find-components-by-name("button")`
- `get-component-details("Button")` for each match

### ✨ AI-assisted development workflow

Ask the AI:

> "Help me implement a form with validation using our design system"

➡️ AI uses MCP to:

- Find relevant form components (`TextField`, `Button`, etc.)
- Get detailed prop information and examples
- Generate code using the actual component APIs
- Suggest best practices based on component metrics

---

## 🧠 Why MCP?

MCP (Model Context Protocol) provides a standard interface for large language models to safely and efficiently access contextual information like UI components, documentation, and code.

By integrating your Storybook via MCP:

- **AI agents get real-time component data** - No outdated documentation
- **Structured JSON output** - Perfect for AI parsing and code generation
- **Comprehensive component analysis** - Props, variants, examples, and metrics in one call
- **Natural language queries** - Ask about components in plain English
- **Enhanced development workflow** - AI can suggest optimal component usage

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

MIT
