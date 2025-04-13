import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getConfig } from './config.js';

// Storybook json types
// https://github.com/storybookjs/storybook/blob/next/code/core/src/types/modules/indexer.ts

export interface Parameters {
  __id: string;
    docsOnly: boolean;
    fileName: string;
  // biome-ignore lint/suspicious/noExplicitAny: we can't expect the exact structure of the parameters
  [name: string]: any;
}

export interface ComponentProp {
  name: string;
  type: string;
  // biome-ignore lint/suspicious/noExplicitAny: we can't expect the type of the defaultValue
  defaultValue: any;
  description?: string;
}

export interface StorybookStory {
  id: string;
  title: string;
  name: string;
  importPath: string;
  kind: string;
  story: string;
  parameters: Parameters;
}

export interface ComponentStory {
  name: string;
  parameters: Parameters;
  id?: string;
  title?: string;
  importPath?: string;
  kind?: string;
  story?: string;
}

export interface Component {
  id: string;
  name: string;
  description?: string;
  props: ComponentProp[];
  stories: Record<string, ComponentStory>;
}

export interface StorybookData {
  v: number;
  stories: {
    [key: string]: ComponentStory;
  };
}

export const getComponents = async (storybookStaticDir: string): Promise<Component[]> => {
  try {
    const config = getConfig();

    // Use the provided path or the one from config
    let dirPath = storybookStaticDir || config.storybookStaticDir;

    // Check if the path is relative, convert to absolute if needed
    if (!path.isAbsolute(dirPath)) {
      dirPath = path.resolve(process.cwd(), dirPath);
      console.log('Converted relative path to absolute:', dirPath);
    }

    // Only join 'stories.json' if it's not already included in the path
    let storiesJsonPath = dirPath;
    if (!dirPath.endsWith('stories.json')) {
      storiesJsonPath = path.join(dirPath, 'stories.json');
    }
    console.log('storiesJsonPath:', storiesJsonPath);

    const storiesJsonContent = await fs.readFile(storiesJsonPath, 'utf-8');
    console.log('storiesJsonContent:', storiesJsonContent);
    const storiesData: StorybookData = JSON.parse(storiesJsonContent);
    console.log('storiesData:', storiesData);

    const components: Component[] = [];

    for (const storyId in storiesData.stories) {
      console.log('storyId:', storyId);
      const story = storiesData.stories[storyId];

      if (!story.title) {
        continue; // Skip stories without a title
      }

      // Check if the story already exists in the components array
      let component = components.find(c => c.name === story.title);

      if (!component) {
        component = {
          id: story.title.toLowerCase().replace(/ /g, '-'),
          name: story.title,
          description: '',
          props: [],
          stories: {},
        };
        components.push(component);
      }

      if (component) {
        component.stories[story.title] = {
          name: story.name,
          parameters: story.parameters,
          id: story.id,
          title: story.title,
          importPath: story.importPath,
          kind: story.kind,
          story: story.story,
        };
      }
    }

    return components;
  } catch (error) {
    console.error('Error reading or parsing stories.json:', error);
    return [];
  }
};
