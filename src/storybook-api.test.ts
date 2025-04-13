import { describe, expect, it } from 'bun:test';
import { mockComponents } from './mock-storybook-data.js';
import { getComponents } from './storybook-api.js';

const mockStoryPath = './src/__mocks__/stories.json';

describe('storybook-api', () => {
  it('should return mock components data', async () => {
    const components = await getComponents(mockStoryPath);

    // Verify components are the mock components
    expect(components).toEqual(mockComponents);
  });

  it('should return components with expected structure', async () => {
    const components = await getComponents(mockStoryPath);

    // Check that we got an array
    expect(Array.isArray(components)).toBe(true);

    // Check that at least one component exists
    expect(components.length).toBeGreaterThan(0);

    // Check the structure of the first component
    const component = components[0];
    expect(component).toHaveProperty('name');
    expect(component).toHaveProperty('description');
    expect(component).toHaveProperty('props');
    expect(component).toHaveProperty('stories');

    // Check props array structure
    expect(Array.isArray(component.props)).toBe(true);
    if (component.props.length > 0) {
      const prop = component.props[0];
      expect(prop).toHaveProperty('name');
      expect(prop).toHaveProperty('type');
      expect(prop).toHaveProperty('defaultValue');
    }

    // Check stories object structure
    expect(typeof component.stories).toBe('object');
    if (Object.keys(component.stories).length > 0) {
      const storyKey = Object.keys(component.stories)[0];
      const story = component.stories[storyKey];
      expect(story).toHaveProperty('name');
      expect(story).toHaveProperty('parameters');
    }
  });

  it('should match snapshot for component structure', async () => {
    const components = await getComponents(mockStoryPath);
    expect(components).toMatchSnapshot();
  });

  it('should match snapshot for individual components', async () => {
    const components = await getComponents(mockStoryPath);

    // Test snapshots for each component
    components.forEach((component, index) => {
      expect(component).toMatchSnapshot(`component-${index}-${component.name}`);

      // Test snapshots for component properties
      expect(component.props).toMatchSnapshot(`component-${index}-${component.name}-props`);

      // Test snapshots for component stories
      for (const [storyKey, story] of Object.entries(component.stories)) {
        expect(story).toMatchSnapshot(`component-${index}-${component.name}-story-${storyKey}`);
      }
    });
  });
});
