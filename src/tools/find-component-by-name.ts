import { getComponents, Component } from '../storybook-api.js';
import { getConfig } from '../config.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const FindComponentByNameParamsSchema = z.object({
  name: z.string().describe('Component name or keyword to search for'),
});

export const findComponentByName = async (
  args: z.infer<typeof FindComponentByNameParamsSchema>
) => {
  const config = getConfig();
  const storybookStaticDir = config.storybookStaticDir;

  try {
    const components = await getComponents(storybookStaticDir);
    const searchTerm = args.name.toLowerCase();
    const matchingComponents = components.filter((component: Component) =>
      component.name.toLowerCase().includes(searchTerm)
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(matchingComponents, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error finding component by name:', error);
    throw new McpError(ErrorCode.InternalError, 'Failed to find component by name');
  }
};
