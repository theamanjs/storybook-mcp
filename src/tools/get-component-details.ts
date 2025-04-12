import { getComponents, Component } from '../storybook-api.js';
import { getConfig } from '../config.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const GetComponentDetailsParamsSchema = z.object({
  name: z.string().describe('Component name to get details for'),
});

export const getComponentDetails = async (
  args: z.infer<typeof GetComponentDetailsParamsSchema>
) => {
  const config = getConfig();
  const storybookStaticDir = config.storybookStaticDir;

  try {
    const components = await getComponents(storybookStaticDir);
    const componentName = args.name;
    const component = components.find((c: Component) => c.name === componentName);

    if (!component) {
      throw new McpError(ErrorCode.MethodNotFound, `Component "${componentName}" not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(component, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error getting component details:', error);
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, 'Failed to get component details');
  }
};
