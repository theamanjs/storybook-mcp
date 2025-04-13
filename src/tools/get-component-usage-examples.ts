import path from 'node:path';
import fs from 'node:fs/promises';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { getComponents, type Component, type ComponentStory } from '../storybook-api.js';
import { searchFiles, type SearchResult } from '../utils.js';

/**
 * not yet implemented
 * @param args
 * @returns
 */
export async function getComponentUsageExamples(args: { name: string, storybookStaticDir: string }) {
  const { name: _componentName, storybookStaticDir } = args;

  const componentName = _componentName.split('/').at(-1); // Get the last part of the name (e.g., "Button" from "components/Button")

  if (!componentName) {
    throw new McpError(ErrorCode.InvalidParams, 'Component name is required');
  }

  // const config = getConfig();
  const components = await getComponents(storybookStaticDir);
  const component = components.find((c) => c.name === componentName);

  if (!component) {
    throw new McpError(ErrorCode.MethodNotFound, `Component "${componentName}" not found`);
  }

  // Extract story file examples
  let storyExamples = '';
  if (component.stories) {
    storyExamples = await extractStoryExamples(component);
  }

  const dir = path.basename(storybookStaticDir);

  // Search for component usage in code
  const searchResults = await searchFiles({
    path: dir, // Search within the src directory
    regex: `<${componentName}.*>`, // Match component usage
    file_pattern: '*.{tsx,ts}', // Search in .tsx and .ts files only
  });

  const codeUsageExamples = searchResults.map((result: SearchResult) => {
    return `File: ${result.path}\n\`\`\`tsx\n${result.context}\n\`\`\`\n`;
  }).join('\n');

  // Combine both types of examples
  const content = formatComponentUsageOutput(component, storyExamples, codeUsageExamples);

  return {
    content: [
      {
        type: 'text',
        text: content,
      },
    ],
  };
}

/**
 * Extracts and formats examples from story files
 */
async function extractStoryExamples(component: Component): Promise<string> {
  let examples = '';

  for (const storyKey in component.stories) {
    const story = component.stories[storyKey];

    if (story.fullPath) {
      try {
        // Read the story file content
        const fileContent = await fs.readFile(story.fullPath, 'utf-8');

        // Extract variants and their props
        const variants = extractVariants(fileContent, story);
        if (variants) {
          examples += `### Variant: ${story.name}\n${variants}\n\n`;
        }
      } catch (error) {
        console.error(`Error reading story file ${story.fullPath}:`, error);
      }
    }
  }

  return examples;
}

/**
 * Extract story variants from file content
 */
function extractVariants(fileContent: string, story: ComponentStory): string {
  // Extract exports that define variants
  const exportRegex = new RegExp(`export const\\s+([\\w]+)\\s*:?\\s*[\\w<>]*\\s*=\\s*{([^}]+)}`, 'g');
  let match;
  let variants = '';

  while ((match = exportRegex.exec(fileContent)) !== null) {
    const variantName = match[1];
    const variantProps = match[2].trim();

    variants += `\`\`\`tsx
// ${variantName} variant
<${story.title.split('/').pop()} ${variantProps.replace(/args:/, '').trim()}>
  {/* Component children if applicable */}
</${story.title.split('/').pop()}>
\`\`\`\n\n`;
  }

  // If no variants found, return the default story format
  if (!variants) {
    variants = `\`\`\`tsx
// Default usage
<${story.title.split('/').pop()} />
\`\`\`\n\n`;
  }

  return variants;
}

/**
 * Format the final output combining story examples and code usage
 */
function formatComponentUsageOutput(
  component: Component,
  storyExamples: string,
  codeUsageExamples: string
): string {
  let output = `# ${component.name} Component Usage Examples\n\n`;

  if (component.description) {
    output += `## Description\n${component.description}\n\n`;
  }

  // List available props
  if (component.props && component.props.length > 0) {
    output += `## Props\n`;
    component.props.forEach(prop => {
      const defaultValue = prop.defaultValue !== undefined ?
        ` (default: ${JSON.stringify(prop.defaultValue)})` : '';
      output += `- \`${prop.name}\`: ${prop.type}${defaultValue}${prop.description ? ` - ${prop.description}` : ''}\n`;
    });
    output += '\n';
  }

  if (storyExamples) {
    output += `## Story Examples\n${storyExamples}\n`;
  }

  if (codeUsageExamples) {
    output += `## Code Usage Examples\n${codeUsageExamples}\n`;
  }

  if (!storyExamples && !codeUsageExamples) {
    output += `No usage examples found for component "${component.name}"\n`;
  }

  return output;
}
