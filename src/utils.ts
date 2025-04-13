import path from 'node:path';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { minimatch } from 'minimatch';

export interface SearchResult {
  path: string;
  context: string;
}

export async function searchFiles(options: {
  path: string;
  regex: string;
  file_pattern: string;
}): Promise<SearchResult[]> {
  const { path: searchPath, regex, file_pattern } = options;
  const results: SearchResult[] = [];

  try {
    // Get all files recursively
    const getAllFiles = async (dir: string): Promise<string[]> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          return entry.isDirectory()
            ? getAllFiles(fullPath)
            : fullPath;
        })
      );
      return files.flat();
    };

    // Get all files and filter by pattern
    const allFiles = await getAllFiles(searchPath);
    const matchingFiles = allFiles.filter(file =>
      minimatch(path.basename(file), file_pattern)
    );

    // Create regex object from string
    const regexObj = new RegExp(regex);

    // Process each file
    for (const filePath of matchingFiles) {
      try {
        const fileStream = createReadStream(filePath, { encoding: 'utf8' });
        const rl = createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });

        let lineNumber = 0;
        for await (const line of rl) {
          lineNumber++;
          if (regexObj.test(line)) {
            results.push({
              path: filePath,
              context: line.trim()
            });
          }
        }
      } catch (fileError) {
        console.error(`Error reading file ${filePath}: ${fileError}`);
      }
    }

    return results;
  } catch (error) {
    console.error(`Error searching files: ${error}`);
    return [];
  }
}

export function getAbsolutePath(dirPath: string): string {
  return path.isAbsolute(dirPath) ? dirPath : path.resolve(process.cwd(), dirPath);
}

/**
 * Resolves and normalizes the path to the Storybook JSON file
 *
 * @param dirPath - Path to the Storybook static directory or the stories.json file
 * @returns Resolved path to the stories.json file
 */
export function getStorybookJsonPath(dirPath: string): string {
  // Only join 'stories.json' if it's not already included in the path
  let storiesJsonPath = getAbsolutePath(dirPath);
  if (!dirPath.endsWith('.json')) {
    storiesJsonPath = path.join(dirPath, 'stories.json');
  }

  return storiesJsonPath;
}
