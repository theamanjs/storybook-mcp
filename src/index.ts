import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  ToolSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from "zod-to-json-schema";
import { findComponentByName } from './tools/find-component-by-name.js';
import { getComponentDetails } from './tools/get-component-details.js';
import { listComponents } from './tools/list-components.js';
import { getStorybookJsonPath } from './utils.js';

// Get the default storybook path from command line arguments if provided
const defaultStorybookPath = process.argv[2] || '';
console.error(`Using default storybook path: ${defaultStorybookPath || 'Not specified'}`);

const server = new Server(
  {
    name: 'storybook-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Updated schema to make path optional since we can use the default path
const ListComponentsParamsSchema = z.object({
  path: z.string().optional().describe('Path to the stories.json file (optional if default path is provided)'),
});

const FindComponentByNameParamsSchema = z.object({
  name: z.string().describe('Component name or keyword to search for'),
  path: z.string().optional().describe('Path to the stories.json file (optional if default path is provided)'),
});

const GetComponentDetailsParamsSchema = z.object({
  name: z.string().describe('Component name to get details for'),
  path: z.string().optional().describe('Path to the stories.json file (optional if default path is provided)'),
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list-components',
      description: 'Returns all available components',
      inputSchema: zodToJsonSchema(ListComponentsParamsSchema.describe('Parameters for listing components')) as ToolInput,
    },
    {
      name: 'find-component-by-name',
      description: 'Search components by name/keyword',
      inputSchema: zodToJsonSchema(FindComponentByNameParamsSchema.describe('Parameters for finding component by name')) as ToolInput,
    },
    {
      name: 'get-component-details',
      description: 'Get detailed component metadata',
      inputSchema: zodToJsonSchema(GetComponentDetailsParamsSchema.describe('Parameters for getting component details')) as ToolInput,
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments as { name?: string; path?: string } ?? { name: '', path: '' };
  // Use provided path or fall back to the default path from command line
  try {
    const storybookStaticDir = getStorybookJsonPath(args.path || defaultStorybookPath);

    if (!storybookStaticDir) {
      throw new McpError(ErrorCode.InvalidParams, 'No path specified for stories.json file and no default path provided');
    }

    switch (request.params.name) {
      case 'list-components':
        return listComponents(storybookStaticDir);
      case 'find-component-by-name':
        return findComponentByName({ name: args.name || '', storybookStaticDir });
      case 'get-component-details':
        return getComponentDetails({ name: args.name || '', storybookStaticDir });
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    console.error("Error in CallToolRequestSchema handler:", error);
    throw error;
  }
});

async function main() {
  const transport = new StdioServerTransport();
  try {
    await server.connect(transport);
    console.error('Storybook MCP server running on stdio');
  } catch (error) {
    console.error('Failed to connect to transport:', error);
    process.exit(1);
  }
}

main().catch(console.error);
