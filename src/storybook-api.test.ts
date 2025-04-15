import { describe, expect, it } from 'bun:test';
import { getComponents } from './storybook-api.js';
import path from 'path';

const mockStoryPath = './src/__mocks__/stories.json';

describe('storybook-api', () => {
  it('should return mock components data', async () => {
    const components = await getComponents(mockStoryPath);

    // Verify components are the mock components
    expect(components).toMatchSnapshot();
  });

  it('should return components with expected structure', async () => {
    const components = await getComponents(mockStoryPath);

    // Check that we got an array
    expect(Array.isArray(components)).toBe(true);

    // Check that at least one component exists
    expect(components.length).toBeGreaterThan(0);

    // Check the structure of the first component
    const component = components[0];
    expect(component).toHaveProperty('id');
    expect(component).toHaveProperty('name');
    expect(component).toHaveProperty('description');
    expect(component).toHaveProperty('props');
    expect(component).toHaveProperty('variants');

    // Check props array structure
    expect(Array.isArray(component.props)).toBe(true);
    if (component.props.length > 0) {
      const prop = component.props[0];
      expect(prop).toHaveProperty('name');
      expect(prop).toHaveProperty('type');
      expect(prop).toHaveProperty('defaultValue');
    }

    // Check variants object structure
    expect(typeof component.variants).toBe('object');
  });

  it('should properly populate component variants', async () => {
    const components = await getComponents(mockStoryPath);

    // Ensure we have components to test
    expect(components.length).toBeGreaterThan(0);

    // Get the first component
    const component = components[0];

    // Check that variants is an object with at least one entry
    expect(Object.keys(component.variants).length).toBeGreaterThan(0);

    // Get the first variant
    const variantKey = Object.keys(component.variants)[0];
    const variant = component.variants[variantKey];

    // Check the structure of the variant
    expect(variant).toHaveProperty('id');
    expect(variant).toHaveProperty('title');
    expect(variant).toHaveProperty('name');
    expect(variant).toHaveProperty('parameters');
    expect(variant).toHaveProperty('importPath');
    expect(variant).toHaveProperty('storyFileFullPath');
    expect(variant).toHaveProperty('componentFullPath');

    // Check that the variant has the correct relationship to the component
    expect(variant.title).toBe('Components/MyComponent');

    // Check that the component ID is part of the variant ID
    expect(variant.id).toContain(component.id.replace('/', '-'));
  });

  it('should correctly resolve file paths for variants', async () => {
    const components = await getComponents(mockStoryPath);

    // For each component, check that the file paths in variants are correctly resolved
    for (const component of components) {
      for (const variantKey in component.variants) {
        const variant = component.variants[variantKey];

        if (variant.importPath) {
          // Check that storyFileFullPath exists and is an absolute path
          expect(variant.storyFileFullPath).toBeTruthy();
          expect(path.isAbsolute(variant.storyFileFullPath || '')).toBe(true);
        }

        if (variant.componentPath) {
          // Check that componentFullPath exists and is an absolute path
          expect(variant.componentFullPath).toBeTruthy();
          expect(path.isAbsolute(variant.componentFullPath || '')).toBe(true);
        }
      }
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
      for (const [storyKey, story] of Object.entries(component.variants)) {
        expect(story).toMatchSnapshot(`component-${index}-${component.name}-story-${storyKey}`);
      }
    });
  });

  it('should match snapshot for component variants', async () => {
    const components = await getComponents(mockStoryPath);

    // Test snapshots for each component's variants
    components.forEach((component, index) => {
      // Test snapshots for component variants
      for (const [variantKey, variant] of Object.entries(component.variants)) {
        expect(variant).toMatchSnapshot(`component-${index}-${component.name}-variant-${variantKey}`);
      }
    });
  });
});
