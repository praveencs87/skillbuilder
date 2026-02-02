export interface CachedContent {
  hash: string;
  url?: string;
  filePath?: string;
  content: string;
  timestamp: number;
  charCount: number;
}

export interface CacheIndex {
  [hash: string]: CachedContent;
}
