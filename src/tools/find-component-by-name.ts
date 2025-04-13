import {
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { type Component, getComponents } from '../storybook-api.js';

const FindComponentByNameParamsSchema = z.object({
  name: z.string().describe('Component name or keyword to search for'),
});

export const findComponentByName = async (
  args: z.infer<typeof FindComponentByNameParamsSchema> & { storybookStaticDir: string }
) => {
  try {
    const components = await getComponents(args.storybookStaticDir);
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
