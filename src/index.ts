import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  ListResourcesRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from "zod-to-json-schema";
import { getConfig } from './config.js';
import { getComponents } from './storybook-api.js';
import { listComponents } from './tools/list-components.js';
import { findComponentByName } from './tools/find-component-by-name.js';
import { getComponentDetails } from './tools/get-component-details.js';
import { z } from 'zod';

const config = getConfig();

const server = new Server(
  {
    name: 'storybook-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

const ListComponentsParamsSchema = z.object({});

const FindComponentByNameParamsSchema = z.object({
  name: z.string().describe('Component name or keyword to search for'),
});

const GetComponentDetailsParamsSchema = z.object({
  name: z.string().describe('Component name to get details for'),
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list-components',
      description: 'Returns all available components',
      inputSchema: zodToJsonSchema(ListComponentsParamsSchema.describe('Parameters for listing components')),
    },
    {
      name: 'find-component-by-name',
      description: 'Search components by name/keyword',
      inputSchema: zodToJsonSchema(FindComponentByNameParamsSchema.describe('Parameters for finding component by name')),
    },
    {
      name: 'get-component-details',
      description: 'Get detailed component metadata',
      inputSchema: zodToJsonSchema(GetComponentDetailsParamsSchema.describe('Parameters for getting component details')),
    },
  ],
}));

// server.setRequestHandler(ListResourcesRequestSchema, async () => {
//   throw new McpError(ErrorCode.MethodNotFound, 'Method not supported: resources/list');
// });

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'list-components':
      return listComponents();
    case 'find-component-by-name':
      return findComponentByName(request.params.arguments as { name: string } ?? { name: '' });
    case 'get-component-details':
      return getComponentDetails(request.params.arguments as { name: string } ?? { name: '' });
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
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

  // Test the tools
  // try {
  //   const listComponentsResult = await listComponents();
  //   console.log('listComponentsResult:', listComponentsResult);

  //   const findComponentByNameResult = await findComponentByName({ name: 'Button' });
  //   console.log('findComponentByNameResult:', findComponentByNameResult);

  //   const getComponentDetailsResult = await getComponentDetails({ name: 'Button' });
  //   console.log('getComponentDetailsResult:', getComponentDetailsResult);
  // } catch (error) {
  //   console.error('Error testing tools:', error);
  // }
}

main().catch(console.error);
