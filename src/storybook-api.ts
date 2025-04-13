import { promises as fs } from 'node:fs';

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
