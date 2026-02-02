import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { loadConfig, findRepoRoot } from '../utils/config.js';
import { fileExists } from '../utils/files.js';

interface DiagnosticResult {
  passed: boolean;
  message: string;
  fix?: string;
}

export async function runDoctor(): Promise<void> {
  console.log(chalk.bold('\n🔍 Running SkillBuilder diagnostics...\n'));
  
  const results: DiagnosticResult[] = [];
  
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.log(chalk.red('✗ Not in a git repository'));
    console.log(chalk.gray('  Fix: Initialize git with: git init'));
    process.exit(1);
  }
  
  results.push({
    passed: true,
    message: 'Repository root found'
  });
  
  try {
    const config = await loadConfig(repoRoot);
    results.push({
      passed: true,
      message: 'Configuration loaded successfully'
    });
    
    if (config.targets.length === 0) {
      results.push({
        passed: false,
        message: 'No targets configured',
        fix: 'Add at least one target to skillbuilder.json'
      });
    } else {
      results.push({
        passed: true,
        message: `Targets configured: ${config.targets.join(', ')}`
      });
    }
    
    if (config.skills.length === 0) {
      results.push({
        passed: false,
        message: 'No skills defined',
        fix: 'Run: skillbuilder create <skill-name>'
      });
    } else {
      results.push({
        passed: true,
        message: `${config.skills.length} skill(s) defined`
      });
    }
    
    for (const target of config.targets) {
      const outputConfig = config.output[target];
      if (!outputConfig) {
        results.push({
          passed: false,
          message: `No output config for target: ${target}`,
          fix: 'Add output configuration in skillbuilder.json'
        });
        continue;
      }
      
      let outputPath: string;
      if ('dir' in outputConfig) {
        outputPath = path.join(repoRoot, outputConfig.dir);
      } else if ('file' in outputConfig) {
        outputPath = path.dirname(path.join(repoRoot, outputConfig.file));
      } else {
        continue;
      }
      
      try {
        await fs.access(outputPath, fs.constants.W_OK);
        results.push({
          passed: true,
          message: `Output path writable: ${target}`
        });
      } catch {
        results.push({
          passed: false,
          message: `Output path not writable: ${target}`,
          fix: `Ensure directory exists and is writable: ${outputPath}`
        });
      }
    }
    
    for (const skill of config.skills) {
      for (const file of skill.sources.files) {
        const fullPath = path.isAbsolute(file) ? file : path.join(repoRoot, file);
        const exists = await fileExists(fullPath);
        
        if (!exists) {
          results.push({
            passed: false,
            message: `Source file not found: ${file}`,
            fix: `Check path or remove from skill: ${skill.id}`
          });
        }
      }
    }
    
    const cacheDir = path.join(repoRoot, '.skillbuilder/cache');
    const cacheExists = await fileExists(cacheDir);
    
    if (cacheExists) {
      results.push({
        passed: true,
        message: 'Cache directory exists'
      });
    } else {
      results.push({
        passed: false,
        message: 'Cache directory missing',
        fix: 'Run: skillbuilder build'
      });
    }
    
  } catch (error) {
    results.push({
      passed: false,
      message: `Configuration error: ${(error as Error).message}`,
      fix: 'Check skillbuilder.json for errors'
    });
  }
  
  console.log(chalk.bold('Results:\n'));
  
  let hasErrors = false;
  for (const result of results) {
    if (result.passed) {
      console.log(chalk.green(`✓ ${result.message}`));
    } else {
      console.log(chalk.red(`✗ ${result.message}`));
      if (result.fix) {
        console.log(chalk.gray(`  → ${result.fix}`));
      }
      hasErrors = true;
    }
  }
  
  console.log();
  
  if (hasErrors) {
    console.log(chalk.yellow('⚠ Some issues found. Please address them and run doctor again.'));
    process.exit(1);
  } else {
    console.log(chalk.green('✓ All checks passed!'));
  }
}
