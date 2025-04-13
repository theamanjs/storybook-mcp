import { describe, expect, it } from 'bun:test';
import path from 'node:path';
import { getStorybookJsonPath, searchFiles } from './utils.js';

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

  describe('searchFiles', () => {
    const mockDir = path.join(__dirname, '__mocks__');

    it('should find matching content in files with matching pattern', async () => {
      const results = await searchFiles({
        path: mockDir,
        regex: 'test',
        file_pattern: '*.{tsx,ts,js}'
      });

      expect(results.length).toBe(2);
      expect(results.some(r => r.path.includes('component1.tsx'))).toBe(true);
      expect(results.some(r => r.path.includes('component2.tsx'))).toBe(true);
      expect(results.some(r => r.context.includes('// This is a test component'))).toBe(true);
      expect(results.some(r => r.context.includes('// Another test component'))).toBe(true);
    });

    it('should only search in files matching the file pattern', async () => {
      const results = await searchFiles({
        path: mockDir,
        regex: 'test',
        file_pattern: '*.js'
      });

      expect(results.length).toBe(1);
      expect(results[0].path.includes('helper.js')).toBe(true);
      expect(results[0].context.includes('test helper')).toBe(true);
    });

    it('should return empty array when no content matches the regex', async () => {
      const results = await searchFiles({
        path: mockDir,
        regex: 'nonexistent-text',
        file_pattern: '*.*'
      });

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(0);
    });

    it('should handle invalid directory paths gracefully', async () => {
      const results = await searchFiles({
        path: path.join(mockDir, 'nonexistent-directory'),
        regex: 'test',
        file_pattern: '*.*'
      });

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(0);
    });
  });
});
