import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { getComponents } from '../storybook-api.js';
import { getConfig } from '../config.js';

export async function getComponentUsageExamples(args: { name: string }) {
  const componentName = args.name;

  if (!componentName) {
    throw new McpError(ErrorCode.InvalidParams, 'Component name is required');
  }

  const config = getConfig();
  const components = await getComponents(config.storybookStaticDir);
  const component = components.find((c) => c.name === componentName);

  if (!component) {
    throw new McpError(ErrorCode.MethodNotFound, `Component "${componentName}" not found`);
  }

  if (!component.stories || Object.keys(component.stories).length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `No usage examples found for component "${componentName}"`,
        },
      ],
    };
  }

  const usageExamples = Object.values(component.stories).map((story) => ({
    title: story.name,
    jsx: story.parameters?.jsx,
  }));

  const content = usageExamples
    .map((example) => `## ${example.title}\n\`\`\`jsx\n${example.jsx ?? ''}\n\`\`\`\n`)
    .join('\n');

  return {
    content: [
      {
        type: 'text',
        text: content,
      },
    ],
  };
}
