import { describe, it, expect, spyOn, beforeAll, afterAll } from 'bun:test';
import { getComponents, Component } from './storybook-api.js';
import { mockComponents } from './mock-storybook-data.js';

describe('storybook-api', () => {
  // Save original console.warn to restore after tests
  const originalConsoleWarn = console.warn;

  beforeAll(() => {
    // Mock console.warn to prevent output during tests
    console.warn = () => {};
  });

  afterAll(() => {
    // Restore original console.warn
    console.warn = originalConsoleWarn;
  });

  it('should return mock components data', async () => {
    // Setup a spy on console.warn
    const warnSpy = spyOn(console, 'warn');

    const components = await getComponents('./test-storybook-static');

    // Verify console.warn was called with correct parameters
    expect(warnSpy).toHaveBeenCalledWith(
      'Using mock Storybook data.  storybookStaticDir=',
      './test-storybook-static'
    );

    // Verify components are the mock components
    expect(components).toEqual(mockComponents);
  });

  it('should return components with expected structure', async () => {
    const components = await getComponents('./any-path');

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
});
