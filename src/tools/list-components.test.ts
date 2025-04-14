import { describe, it, expect, beforeEach, spyOn } from 'bun:test';
import { listComponents } from './list-components.js';
import * as storybookApi from '../storybook-api.js';
import type { Component } from '../storybook-api.js';
import * as configModule from '../config.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';

describe('list-components', () => {
  const mockConfig = { storybookStaticDir: './test-storybook-static' };
  const mockComponents: Component[] = [
    { id: 'Component-1', name: 'Component 1', props: [], variants: {} },
    { id: 'Component-2', name: 'Component 2', props: [], variants: {} }
  ];

  beforeEach(() => {
    // Mock getConfig to return our test config
    spyOn(configModule, 'getConfig').mockReturnValue(mockConfig);
  });

  it('should return a list of components when successful', async () => {
    // Mock getComponents to return our test components
    spyOn(storybookApi, 'getComponents').mockResolvedValue(mockComponents);

    const result = await listComponents('./storybook-static');

    // Check correct config was used
    expect(configModule.getConfig).toHaveBeenCalled();
    expect(storybookApi.getComponents).toHaveBeenCalledWith(mockConfig.storybookStaticDir);

    // Check result structure
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockComponents, null, 2),
        },
      ],
    });
  });

  it('should throw McpError when getComponents fails', async () => {
    // Mock getComponents to throw an error
    const testError = new Error('Test error');
    spyOn(storybookApi, 'getComponents').mockRejectedValue(testError);
    spyOn(console, 'error').mockImplementation(() => {});

    // Expect function to throw McpError
    await expect(listComponents('./storybook-static')).rejects.toThrow(McpError);

    // Verify console error was called
    expect(console.error).toHaveBeenCalledWith('Error listing components:', testError);
  });
});
