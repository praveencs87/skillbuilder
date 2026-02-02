import ora from 'ora';
import { Skill, SkillBuilderConfig } from '../types/config.js';
import { fetchUrl } from '../utils/fetch.js';
import { readLocalFile } from '../utils/files.js';
import { getCachedContent, setCachedContent, hashContent } from '../utils/cache.js';

export interface BuildResult {
  skillId: string;
  content: string;
  sources: {
    urls: number;
    files: number;
  };
}

export async function buildSkill(
  skill: Skill,
  config: SkillBuilderConfig,
  repoRoot: string,
  showProgress: boolean = true
): Promise<BuildResult> {
  const spinner = showProgress ? ora(`Building skill: ${skill.name}`).start() : null;
  
  const contentParts: string[] = [];
  let urlCount = 0;
  let fileCount = 0;
  
  try {
    for (const url of skill.sources.urls) {
      try {
        const hash = hashContent(url);
        let content = (await getCachedContent(hash, repoRoot))?.content;
        
        if (!content) {
          if (spinner) spinner.text = `Fetching ${url}...`;
          content = await fetchUrl(url, { maxChars: config.limits.maxUrlChars });
          
          await setCachedContent({
            hash,
            url,
            content,
            timestamp: Date.now(),
            charCount: content.length
          }, repoRoot);
        }
        
        contentParts.push(`### Source: ${url}\n\n${content}`);
        urlCount++;
      } catch (error) {
        spinner?.warn(`Failed to fetch ${url}: ${(error as Error).message}`);
      }
    }
    
    for (const filePath of skill.sources.files) {
      try {
        const hash = hashContent(filePath);
        let content = (await getCachedContent(hash, repoRoot))?.content;
        
        if (!content) {
          if (spinner) spinner.text = `Reading ${filePath}...`;
          content = await readLocalFile(filePath, repoRoot, config.limits.maxFileChars);
          
          await setCachedContent({
            hash,
            filePath,
            content,
            timestamp: Date.now(),
            charCount: content.length
          }, repoRoot);
        }
        
        contentParts.push(`### Source: ${filePath}\n\n${content}`);
        fileCount++;
      } catch (error) {
        spinner?.warn(`Failed to read ${filePath}: ${(error as Error).message}`);
      }
    }
    
    const fullContent = contentParts.join('\n\n---\n\n');
    const truncated = fullContent.slice(0, config.limits.maxGeneratedCharsPerFile);
    
    spinner?.succeed(`Built skill: ${skill.name} (${urlCount} URLs, ${fileCount} files)`);
    
    return {
      skillId: skill.id,
      content: truncated,
      sources: { urls: urlCount, files: fileCount }
    };
  } catch (error) {
    spinner?.fail(`Failed to build skill: ${skill.name}`);
    throw error;
  }
}

export async function buildAllSkills(
  config: SkillBuilderConfig,
  repoRoot: string,
  showProgress: boolean = true
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  for (const skill of config.skills) {
    const result = await buildSkill(skill, config, repoRoot, showProgress);
    results.set(result.skillId, result.content);
  }
  
  return results;
}
