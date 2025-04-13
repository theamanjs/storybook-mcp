import path from 'node:path';

/**
 * Resolves and normalizes the path to the Storybook JSON file
 *
 * @param dirPath - Path to the Storybook static directory or the stories.json file
 * @returns Resolved path to the stories.json file
 */
export function getStorybookJsonPath(dirPath: string): string {
  // Check if the path is relative, convert to absolute if needed
  if (!path.isAbsolute(dirPath)) {
    dirPath = path.resolve(process.cwd(), dirPath);
  }

  // Only join 'stories.json' if it's not already included in the path
  let storiesJsonPath = dirPath;
  if (!dirPath.endsWith('.json')) {
    storiesJsonPath = path.join(dirPath, 'stories.json');
  }

  return storiesJsonPath;
}