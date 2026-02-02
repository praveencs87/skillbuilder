import { JSDOM } from 'jsdom';

export interface FetchOptions {
  timeout?: number;
  maxChars?: number;
}

export async function fetchUrl(url: string, options: FetchOptions = {}): Promise<string> {
  const { timeout = 10000, maxChars = 12000 } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SkillBuilder/1.0 (AI Rules Generator)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const cleaned = cleanHtml(html);
    
    return cleaned.slice(0, maxChars);
  } finally {
    clearTimeout(timeoutId);
  }
}

export function cleanHtml(html: string): string {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const selectorsToRemove = [
      'script',
      'style',
      'nav',
      'header',
      'footer',
      'iframe',
      'noscript',
      '.advertisement',
      '.ad',
      '#comments'
    ];
    
    selectorsToRemove.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    const body = document.body;
    if (!body) return '';
    
    const textContent = extractTextContent(body);
    return textContent.trim();
  } catch (error) {
    throw new Error(`Failed to clean HTML: ${(error as Error).message}`);
  }
}

function extractTextContent(element: Element): string {
  let text = '';
  
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === 3) {
      text += node.textContent || '';
    } else if (node.nodeType === 1) {
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();
      
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        text += `\n\n## ${el.textContent?.trim()}\n\n`;
      } else if (tagName === 'p') {
        text += `${el.textContent?.trim()}\n\n`;
      } else if (tagName === 'pre' || tagName === 'code') {
        text += `\`\`\`\n${el.textContent?.trim()}\n\`\`\`\n\n`;
      } else if (tagName === 'li') {
        text += `- ${el.textContent?.trim()}\n`;
      } else {
        text += extractTextContent(el);
      }
    }
  }
  
  return text;
}
