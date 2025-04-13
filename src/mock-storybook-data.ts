import type { Component } from './storybook-api.js';

export const mockComponents: Component[] = [
  {
    id: 'components/mycomponent',
    name: 'Components/MyComponent',
    description: '',
    props: [],
    stories: {
      'Components/MyComponent': {
        id: 'components-mycomponent--simple',
        title: 'Components/MyComponent',
        name: 'Simple',
        importPath: './src/components/MyComponent.stories.jsx',
        kind: 'Components/MyComponent',
        story: 'Simple',
        parameters: {
          __id: 'components-mycomponent--simple',
          docsOnly: false,
          fileName: './src/components/MyComponent.stories.jsx',
        },
      },
    },
  },
  {
    id: 'components/myothercomponent',
    name: 'Components/MyOtherComponent',
    description: '',
    props: [],
    stories: {
      'Components/MyOtherComponent': {
        id: 'components-myothercomponent--simple',
        title: 'Components/MyOtherComponent',
        name: 'Simple',
        importPath: './src/components/MyOtherComponent.stories.jsx',
        kind: 'Example/Button',
        story: 'Simple',
        parameters: {
          __id: 'components-myothercomponent--simple',
          docsOnly: false,
          fileName: './src/components/MyOtherComponent.stories.jsx',
        },
      },
    },
  },
];
