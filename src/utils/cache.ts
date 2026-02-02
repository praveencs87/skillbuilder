import fs from 'fs/promises';
import path from 'path';
import { CachedContent, CacheIndex } from '../types/cache.js';
import { createHash } from './hash.js';

const CACHE_DIR = '.skillbuilder/cache';

export async function getCacheDir(repoRoot: string): Promise<string> {
  const cacheDir = path.join(repoRoot, CACHE_DIR);
  await fs.mkdir(cacheDir, { recursive: true });
  return cacheDir;
}

export async function loadCacheIndex(repoRoot: string): Promise<CacheIndex> {
  const cacheDir = await getCacheDir(repoRoot);
  const indexPath = path.join(cacheDir, 'index.json');
  
  try {
    const content = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export async function saveCacheIndex(repoRoot: string, index: CacheIndex): Promise<void> {
  const cacheDir = await getCacheDir(repoRoot);
  const indexPath = path.join(cacheDir, 'index.json');
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}

export async function getCachedContent(hash: string, repoRoot: string): Promise<CachedContent | null> {
  const index = await loadCacheIndex(repoRoot);
  return index[hash] || null;
}

export async function setCachedContent(content: CachedContent, repoRoot: string): Promise<void> {
  const index = await loadCacheIndex(repoRoot);
  index[content.hash] = content;
  await saveCacheIndex(repoRoot, index);
  
  const cacheDir = await getCacheDir(repoRoot);
  const contentPath = path.join(cacheDir, `${content.hash}.json`);
  await fs.writeFile(contentPath, JSON.stringify(content, null, 2), 'utf-8');
}

export function hashContent(content: string): string {
  return createHash(content);
}
