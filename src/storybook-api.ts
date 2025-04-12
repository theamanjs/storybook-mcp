export interface ComponentProp {
  name: string;
  type: string;
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
  parameters: {
    __id: string;
    docsOnly: boolean;
    fileName: string;
    [key: string]: any; // For any additional parameters
  };
}

export interface ComponentStory {
  name: string;
  parameters: any;
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
    [key: string]: StorybookStory;
  };
}

import { mockComponents } from './mock-storybook-data.js';

export const getComponents = async (storybookStaticDir: string): Promise<Component[]> => {
  console.warn('Using mock Storybook data.  storybookStaticDir=', storybookStaticDir);
  return mockComponents;
};
