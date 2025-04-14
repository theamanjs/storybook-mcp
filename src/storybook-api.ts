import { promises as fs } from 'node:fs';
import path from 'path';
import { getAbsolutePath } from './utils.js';

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
  fullPath?: string;
}

export interface ComponentStory {
  name: string;
  parameters: Parameters;
  id?: string;
  title: string;
  importPath?: string;
  componentPath?: string;
  kind?: string;
  story?: string;
  storyFileFullPath?: string;
  componentFullPath?: string;
}

export interface Component {
  id: string;
  name: string;
  description?: string;
  props: ComponentProp[];
  variants: Record<string, ComponentStory>;
}

export interface StorybookData {
  v: number;
  // v8 ~
  entries?: {
    [key: string]: ComponentStory;
  };
  // v7
  stories?: {
    [key: string]: ComponentStory;
  };
}

export const getComponents = async (storybookStaticDir: string): Promise<Component[]> => {
  try {
    const storiesJsonContent = await fs.readFile(storybookStaticDir, 'utf-8');

    const storiesData: StorybookData = JSON.parse(storiesJsonContent);
    const components: Component[] = [];
    const storyEntries = storiesData.entries || storiesData.stories;

    for (const storyId in storyEntries) {
      const story = storyEntries[storyId];

      if (!story.id) {
        continue; // Skip stories without a title
      }

      // example-button--primary => example-button
      const componentId = story.id.split('--')[0];
      const componentName = componentId
        .replace(/-/g, '/')
        .replace(/(^|\/)(\w)/g, (_, separator, char) => `${separator}${char.toUpperCase()}`);

      // Check if the story already exists in the components array
      let component = components.find(c => c.name === story.title);

      if (!component) {
        component = {
          id: componentId,
          name: componentName,
          description: '',
          props: [],
          variants: {},
        };
        components.push(component);
      }

      if (component) {
        const storybookStaticDirname = path.dirname(storybookStaticDir);
        const storyFileFullPath = getAbsolutePath(path.resolve(storybookStaticDirname, '../', story.importPath || ''));
        const componentFullPath = getAbsolutePath(path.resolve(storybookStaticDirname, '../', story.componentPath || ''));

        component.variants[story.id] = {
          name: story.name,
          parameters: story.parameters,
          id: story.id,
          title: story.title,
          importPath: story.importPath,
          componentPath: story.componentPath,
          kind: story.kind,
          story: story.story,
          storyFileFullPath,
          componentFullPath,
        };
      }
    }

    return components;
  } catch (error) {
    console.error('Error reading or parsing stories.json:', error);
    return [];
  }
};
