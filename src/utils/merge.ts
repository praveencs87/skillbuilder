import fs from 'fs/promises';
import { fileExists } from './files.js';

export interface MergeResult {
  success: boolean;
  action: 'created' | 'updated' | 'skipped' | 'conflict';
  message: string;
}

export function createMarker(blockId: string, isStart: boolean): string {
  return isStart 
    ? `<!-- skillbuilder:begin ${blockId} -->`
    : `<!-- skillbuilder:end ${blockId} -->`;
}

export function wrapContent(blockId: string, content: string): string {
  return `${createMarker(blockId, true)}\n${content}\n${createMarker(blockId, false)}`;
}

export async function safeMerge(
  filePath: string,
  blockId: string,
  newContent: string,
  interactive: boolean = true
): Promise<MergeResult> {
  const exists = await fileExists(filePath);
  
  if (!exists) {
    const wrapped = wrapContent(blockId, newContent);
    await fs.writeFile(filePath, wrapped, 'utf-8');
    return {
      success: true,
      action: 'created',
      message: `Created ${filePath}`
    };
  }
  
  const existingContent = await fs.readFile(filePath, 'utf-8');
  const startMarker = createMarker(blockId, true);
  const endMarker = createMarker(blockId, false);
  
  const startIdx = existingContent.indexOf(startMarker);
  const endIdx = existingContent.indexOf(endMarker);
  
  if (startIdx === -1 || endIdx === -1) {
    if (interactive) {
      return {
        success: false,
        action: 'conflict',
        message: `Markers missing in ${filePath}. Manual intervention required.`
      };
    }
    
    const wrapped = wrapContent(blockId, newContent);
    await fs.writeFile(filePath, wrapped, 'utf-8');
    return {
      success: true,
      action: 'updated',
      message: `Overwrote ${filePath} (markers were missing)`
    };
  }
  
  const before = existingContent.slice(0, startIdx);
  const after = existingContent.slice(endIdx + endMarker.length);
  const wrapped = wrapContent(blockId, newContent);
  
  const merged = before + wrapped + after;
  await fs.writeFile(filePath, merged, 'utf-8');
  
  return {
    success: true,
    action: 'updated',
    message: `Updated ${filePath}`
  };
}

export async function mergeMultipleBlocks(
  filePath: string,
  blocks: Array<{ blockId: string; content: string }>,
  interactive: boolean = true
): Promise<MergeResult> {
  const exists = await fileExists(filePath);
  
  if (!exists) {
    const allContent = blocks
      .map(b => wrapContent(b.blockId, b.content))
      .join('\n\n');
    await fs.writeFile(filePath, allContent, 'utf-8');
    return {
      success: true,
      action: 'created',
      message: `Created ${filePath}`
    };
  }
  
  let content = await fs.readFile(filePath, 'utf-8');
  
  for (const block of blocks) {
    const startMarker = createMarker(block.blockId, true);
    const endMarker = createMarker(block.blockId, false);
    
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);
    
    if (startIdx === -1 || endIdx === -1) {
      content += '\n\n' + wrapContent(block.blockId, block.content);
    } else {
      const before = content.slice(0, startIdx);
      const after = content.slice(endIdx + endMarker.length);
      content = before + wrapContent(block.blockId, block.content) + after;
    }
  }
  
  await fs.writeFile(filePath, content, 'utf-8');
  
  return {
    success: true,
    action: 'updated',
    message: `Updated ${filePath}`
  };
}
