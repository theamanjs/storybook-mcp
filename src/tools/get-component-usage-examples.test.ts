import { describe, it, expect, beforeEach, spyOn } from 'bun:test';
import path from 'node:path';
import { getComponentUsageExamples } from './get-component-usage-examples.js';
import * as storybookApi from '../storybook-api.js';
import type { Component, ComponentStory } from '../storybook-api.js';
import * as utils from '../utils.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';

describe('get-component-usage-examples', () => {
  const fixturesDir = path.join(import.meta.dir, '__fixtures__');
  const storybookStaticFixturePath = path.join(fixturesDir, 'storybook-static');

  // Sample components to be returned by getComponents
  const mockStories: Record<string, ComponentStory> = {
    'Primary': {
      name: 'Primary',
      parameters: {
        __id: 'button--primary',
        docsOnly: false,
        fileName: 'Button.stories.ts'
      },
      id: 'button--primary',
      title: 'Example/Button',
      importPath: './Button.stories.ts',
      kind: 'Example/Button',
      story: 'Primary',
      storyFileFullPath: path.join(fixturesDir, 'Button.stories.ts')
    },
    'Secondary': {
      name: 'Secondary',
      parameters: {
        __id: 'button--secondary',
        docsOnly: false,
        fileName: 'Button.stories.ts'
      },
      id: 'button--secondary',
      title: 'Example/Button',
      importPath: './Button.stories.ts',
      kind: 'Example/Button',
      story: 'Secondary',
      storyFileFullPath: path.join(fixturesDir, 'Button.stories.ts')
    }
  };

  const headerStories: Record<string, ComponentStory> = {
    'LoggedIn': {
      name: 'LoggedIn',
      parameters: {
        __id: 'header--logged-in',
        docsOnly: false,
        fileName: 'Header.stories.ts'
      },
      id: 'header--logged-in',
      title: 'Example/Header',
      importPath: './Header.stories.ts',
      kind: 'Example/Header',
      story: 'LoggedIn',
      storyFileFullPath: path.join(fixturesDir, 'Header.stories.ts')
    },
    'LoggedOut': {
      name: 'LoggedOut',
      parameters: {
        __id: 'header--logged-out',
        docsOnly: false,
        fileName: 'Header.stories.ts'
      },
      id: 'header--logged-out',
      title: 'Example/Header',
      importPath: './Header.stories.ts',
      kind: 'Example/Header',
      story: 'LoggedOut',
      storyFileFullPath: path.join(fixturesDir, 'Header.stories.ts')
    }
  };

  const mockComponents: Component[] = [
    {
      id: 'button',
      name: 'Button',
      description: 'Primary UI component for user interaction',
      props: [
        { name: 'primary', type: 'boolean', defaultValue: false, description: 'Is this the principal call to action?' },
        { name: 'label', type: 'string', defaultValue: '', description: 'Button contents' }
      ],
      variants: mockStories
    },
    {
      id: 'header',
      name: 'Header',
      description: 'Application header with login buttons',
      props: [
        { name: 'onLogin', type: 'function', defaultValue: undefined, description: 'Callback for login button click' },
        { name: 'onLogout', type: 'function', defaultValue: undefined, description: 'Callback for logout button click' },
        { name: 'onCreateAccount', type: 'function', defaultValue: undefined, description: 'Callback for sign up button click' },
        { name: 'user', type: 'object', defaultValue: undefined, description: 'User info if logged in' }
      ],
      variants: headerStories
    },
    {
      id: 'component-2',
      name: 'Component 2',
      description: '',
      props: [],
      variants: {}
    }
  ];

  beforeEach(() => {
    // Provide actual components with links to real fixture files
    spyOn(storybookApi, 'getComponents').mockResolvedValue(mockComponents);
  });

  it('should return usage examples with story information when successful', async () => {
    // Mock searchFiles to return some usage examples
    spyOn(utils, 'searchFiles').mockResolvedValue([
      { path: 'src/Button.tsx', context: '<Button>Click me</Button>' },
      { path: 'src/App.tsx', context: '<Button primary label="Submit">Submit</Button>' }
    ]);

    const result = await getComponentUsageExamples({
      name: 'Button',
      storybookStaticDir: storybookStaticFixturePath
    });

    // Verify searchFiles was called correctly
    expect(utils.searchFiles).toHaveBeenCalledWith({
      path: 'storybook-static',
      regex: '<Button.*>',
      file_pattern: '*.{tsx,ts}',
    });

    // Check the structure of the result
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty('type', 'text');

    // Verify the content includes expected sections
    const content = result.content[0].text;
    expect(content).toContain('# Button Component Usage Examples');
    expect(content).toContain('## Description');
    expect(content).toContain('Primary UI component for user interaction');
    expect(content).toContain('## Props');
    expect(content).toContain('`primary`: boolean');
    expect(content).toContain('`label`: string');
    expect(content).toContain('## Story Examples');
    expect(content).toContain('### Variant: Primary');
    expect(content).toContain('### Variant: Secondary');
    expect(content).toContain('## Code Usage Examples');
    expect(content).toContain('File: src/Button.tsx');
    expect(content).toContain('<Button>Click me</Button>');
    expect(content).toContain('<Button primary label="Submit">Submit</Button>');
  });

  it('should return usage examples for the Header component', async () => {
    // Mock searchFiles to return some usage examples
    spyOn(utils, 'searchFiles').mockResolvedValue([
      { path: 'src/Header.tsx', context: '<Header onLogin={() => {}} onLogout={() => {}} onCreateAccount={() => {}} />' },
      { path: 'src/App.tsx', context: '<Header user={user} onLogin={handleLogin} onLogout={handleLogout} onCreateAccount={handleSignUp} />' }
    ]);

    const result = await getComponentUsageExamples({
      name: 'Header',
      storybookStaticDir: storybookStaticFixturePath
    });

    // Verify searchFiles was called correctly
    expect(utils.searchFiles).toHaveBeenCalledWith({
      path: 'storybook-static',
      regex: '<Header.*>',
      file_pattern: '*.{tsx,ts}',
    });

    // Check the structure of the result
    const content = result.content[0].text;
    expect(content).toContain('# Header Component Usage Examples');
    expect(content).toContain('## Description');
    expect(content).toContain('Application header with login buttons');
    expect(content).toContain('## Props');
    expect(content).toContain('`onLogin`: function');
    expect(content).toContain('`user`: object');
    expect(content).toContain('## Story Examples');
    expect(content).toContain('### Variant: LoggedIn');
    expect(content).toContain('### Variant: LoggedOut');
    expect(content).toContain('## Code Usage Examples');
    expect(content).toContain('<Header onLogin');
  });

  it('should return only code usage examples when no stories are available', async () => {
    // Mock components without stories
    spyOn(storybookApi, 'getComponents').mockResolvedValue([
      {
        id: 'button',
        name: 'Button',
        description: 'A standard button component',
        props: [],
        variants: {}
      }
    ]);

    // Mock searchFiles to return some usage examples
    spyOn(utils, 'searchFiles').mockResolvedValue([
      { path: 'src/Button.tsx', context: '<Button>Click me</Button>' }
    ]);

    const result = await getComponentUsageExamples({
      name: 'Button',
      storybookStaticDir: storybookStaticFixturePath
    });

    const content = result.content[0].text;
    expect(content).toContain('# Button Component Usage Examples');
    expect(content).toContain('## Description');
    expect(content).toContain('## Code Usage Examples');
    expect(content).toContain('<Button>Click me</Button>');
    expect(content).not.toContain('## Story Examples');
  });

  it('should return a message when no usage examples are found', async () => {
    // Mock searchFiles to return an empty array
    spyOn(utils, 'searchFiles').mockResolvedValue([]);

    // Mock components without stories
    spyOn(storybookApi, 'getComponents').mockResolvedValue([
      {
        id: 'button',
        name: 'Button',
        description: '',
        props: [],
        variants: {}
      }
    ]);

    const result = await getComponentUsageExamples({
      name: 'Button',
      storybookStaticDir: storybookStaticFixturePath
    });

    const content = result.content[0].text;
    expect(content).toContain('# Button Component Usage Examples');
    expect(content).toContain('No usage examples found for component "Button"');
  });

  it('should throw McpError when component is not found', async () => {
    // Mock searchFiles to return an empty array
    spyOn(utils, 'searchFiles').mockResolvedValue([]);

    await expect(
      getComponentUsageExamples({
        name: 'NonExistentComponent',
        storybookStaticDir: storybookStaticFixturePath
      })
    ).rejects.toThrow(McpError);
  });
});
