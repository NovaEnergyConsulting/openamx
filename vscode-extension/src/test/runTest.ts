import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main(): Promise<void> {
  try {
    await runTests({
      version: '1.85.0',
      extensionDevelopmentPath: process.env.OPENAMX_EXTENSION_PATH ?? process.cwd(),
      extensionTestsPath: path.resolve(__dirname, './suite/index'),
      launchArgs: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });
  } catch (error) {
    console.error('Extension Development Host tests failed.', error);
    process.exitCode = 1;
  }
}

void main();