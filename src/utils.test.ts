import { describe, expect, it } from 'bun:test';
import path from 'node:path';
import { getStorybookJsonPath } from './utils.js';

describe('utils', () => {
  describe('getStorybookJsonPath', () => {
    it('should convert relative path to absolute path', () => {
      const relativePath = './test-dir';
      const result = getStorybookJsonPath(relativePath);
      const expected = path.join(process.cwd(), relativePath, 'stories.json');
      expect(result).toBe(expected);
    });

    it('should not modify absolute path but append stories.json', () => {
      const absolutePath = path.resolve('/absolute/test/path');
      const result = getStorybookJsonPath(absolutePath);
      const expected = path.join(absolutePath, 'stories.json');
      expect(result).toBe(expected);
    });

    it('should not append stories.json if path already ends with .json', () => {
      const jsonPath = path.join('/test/path', 'custom.json');
      const result = getStorybookJsonPath(jsonPath);
      expect(result).toBe(jsonPath);
    });

    it('should not append stories.json if path already ends with stories.json', () => {
      const storiesJsonPath = path.join('/test/path', 'stories.json');
      const result = getStorybookJsonPath(storiesJsonPath);
      expect(result).toBe(storiesJsonPath);
    });

    it('should handle paths with trailing slashes correctly', () => {
      const pathWithTrailingSlash = '/test/path/';
      const result = getStorybookJsonPath(pathWithTrailingSlash);
      const expected = path.join('/test/path/', 'stories.json');
      expect(result).toBe(expected);
    });

    it('should handle empty path by using cwd', () => {
      const result = getStorybookJsonPath('');
      const expected = path.join(process.cwd(), 'stories.json');
      expect(result).toBe(expected);
    });
  });
});