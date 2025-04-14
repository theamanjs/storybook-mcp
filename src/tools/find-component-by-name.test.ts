import { describe, it, expect, beforeEach, spyOn } from 'bun:test';
import { findComponentByName } from './find-component-by-name.js';
import * as storybookApi from '../storybook-api.js';
import * as configModule from '../config.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';

describe('find-component-by-name', () => {
  const mockConfig = { storybookStaticDir: './test-storybook-static' };
  const mockComponents = [
    { id: 'button', name: 'Button', props: [], variants: {} },
    { id: 'text-button', name: 'TextButton', props: [], variants: {} },
    { id: 'card', name: 'Card', props: [], variants: {} }
  ];

  beforeEach(() => {
    // Mock getConfig to return our test config
    spyOn(configModule, 'getConfig').mockReturnValue(mockConfig);
    // Mock getComponents to return our test components
    spyOn(storybookApi, 'getComponents').mockResolvedValue(mockComponents);
  });

  it('should return the component when it is found', async () => {
    const result = await findComponentByName({ name: 'button', storybookStaticDir: mockConfig.storybookStaticDir });

    expect(storybookApi.getComponents).toHaveBeenCalledWith(mockConfig.storybookStaticDir);

    // Should match both "Button" and "TextButton" since both contain "button"
    const expectedComponents = [
      { id: 'button', name: 'Button', props: [], stories: {} },
      { id: 'text-button', name: 'TextButton', props: [], stories: {} },
    ];

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify(expectedComponents, null, 2),
        },
      ],
    });
  });

  it('should return empty array when the component is not found', async () => {
    const result = await findComponentByName({ name: 'nonexistent', storybookStaticDir: mockConfig.storybookStaticDir });

    expect(storybookApi.getComponents).toHaveBeenCalledWith(mockConfig.storybookStaticDir);

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify([], null, 2),
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
    await expect(findComponentByName({ name: 'button', storybookStaticDir: mockConfig.storybookStaticDir })).rejects.toThrow(McpError);

    // Verify console error was called
    expect(console.error).toHaveBeenCalledWith('Error finding component by name:', testError);
  });
});
