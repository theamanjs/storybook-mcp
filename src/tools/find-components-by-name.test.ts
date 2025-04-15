import { describe, it, expect } from 'bun:test';
import { findComponentsByName } from './find-components-by-name.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import path from 'path';

describe('find-components-by-name', () => {

  it('should return the component when it is found', async () => {
    const result = await findComponentsByName({
      name: 'button',
      storybookStaticDir: path.resolve(__dirname, '__fixtures__/stories.json')
    });

    // Should match both "Button" and "TextButton" since both contain "button"
    const expectedComponents = [
      { id: 'button', name: 'Button' },
      { id: 'textbutton', name: 'Textbutton' },
    ];

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: expect.any(String),
        },
      ],
    });

    const parsedResult = JSON.parse(result.content[0].text);
    expect(parsedResult).toMatchObject([
      expect.objectContaining({
        id: expectedComponents[0].id,
        name: expectedComponents[0].name,
      }),
      expect.objectContaining({
        id: expectedComponents[1].id,
        name: expectedComponents[1].name,
      })
    ]);
    expect(parsedResult.length).toBe(2); // Ensure we got both components
  });

  it('should return empty array when the component is not found', async () => {
    const result = await findComponentsByName({
      name: 'nonexistent',
      storybookStaticDir: path.resolve(__dirname, '__fixtures__/stories.json')
    });

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify([], null, 2),
        },
      ],
    });
  });

  it.skip('should handle errors properly (integration test)', async () => {});
});
