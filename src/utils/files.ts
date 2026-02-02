import fs from 'fs/promises';
import path from 'path';

export async function readLocalFile(filePath: string, repoRoot: string, maxChars: number = 12000): Promise<string> {
  const absolutePath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(repoRoot, filePath);
  
  try {
    const stats = await fs.stat(absolutePath);
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${absolutePath}`);
    }
    
    const content = await fs.readFile(absolutePath, 'utf-8');
    return content.slice(0, maxChars);
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}
