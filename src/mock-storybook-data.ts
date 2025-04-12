import { Component } from './storybook-api.js';

export const mockComponents: Component[] = [
  {
    id: 'Button',
    name: 'Button',
    description: 'A simple button component',
    props: [
      {
        name: 'label',
        type: 'string',
        defaultValue: 'Button',
        description: 'The text to display on the button',
      },
      {
        name: 'onClick',
        type: 'function',
        defaultValue: null,
        description: 'The function to call when the button is clicked',
      },
    ],
    stories: {
      primary: {
        name: 'Primary',
        parameters: {
          label: 'Primary Button',
        },
      },
      secondary: {
        name: 'Secondary',
        parameters: {
          label: 'Secondary Button',
        },
      },
    },
  },
  {
    id: 'Input',
    name: 'Input',
    description: 'A simple input component',
    props: [
      {
        name: 'value',
        type: 'string',
        defaultValue: '',
        description: 'The value of the input',
      },
      {
        name: 'onChange',
        type: 'function',
        defaultValue: null,
        description: 'The function to call when the input changes',
      },
    ],
    stories: {
      default: {
        name: 'Default',
        parameters: {
          value: 'Initial Value',
        },
      },
    },
  },
];
