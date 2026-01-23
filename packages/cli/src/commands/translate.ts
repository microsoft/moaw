import process from 'node:process';
import createDebug from 'debug';
import { CopilotClient } from '@github/copilot-sdk';
import { pathExists } from '../util.js';
import { defaultWorkshopFile } from '../constants.js';

const debug = createDebug('translate');
const translationsFolder = 'translations';

const translatePrompt = (file: string, languages: string) => `## Role
You are an expert translator for technical documents. Your task is to translate the provided workshop content into the specified target language while preserving the original formatting, code snippets, and technical terminology. Ensure that the translated content is complete, clear, accurate, and maintains the instructional tone of the original text.

## Task
1. Translate the workshop file \`${file}\` in languages: \`${languages}\`.
2. Create one translated file per language. Each new translated file must be created as \`${translationsFolder}/<filename>.<language>.md\`.
3. Return the list of created files without any additional explanation.

## Instructions
- Preserve ALL markdown, HTML and frontmatter formatting, including headings, lists, links, and code blocks.
- Update the paths in any relative links or image references to point to the correct locations in the translated file.
- Keep technical terms and code snippets unchanged.
- Keep frontmatter metadata properties names unchanged. Only translate titles and descriptions in the frontmatter.
`;

export type TranslateOptions = {
  file?: string;
  languages?: string;
  model?: string;
  verbose?: boolean;
};

export async function translate(options: TranslateOptions = {}): Promise<void> {
  try {
    options.file = options.file?.trim() || defaultWorkshopFile;
    options.model = options.model?.trim() || 'gpt-5.2';
    debug('Options %o', options);

    const { file, model, languages } = options;
    if (!languages) {
      throw new Error('No target languages specified. Use the --languages option to specify target languages.');
    }

    if (!(await pathExists(file))) {
      throw new Error(`File not found: ${file}`);
    }

    const startTime = Date.now();
    const client = new CopilotClient();
    try {
      await client.start();
      const session = await client.createSession({ model });
      const auth = await client.getAuthStatus();
      if (!auth.isAuthenticated) {
        throw new Error(
          'GitHub Copilot CLI is not authenticated.\nPlease run "copilot" and use "/login" to authenticate.'
        );
      }

      debug('Connected to GitHub Copilot CLI');
      console.info(`Started translation agent for file "${file}" to languages: ${languages}...`);

      session.on((event) => {
        if (event.type === 'assistant.message') {
          debug(`Copilot: ${event.data.content}`);
        }
      });

      const response = await session.sendAndWait(
        {
          prompt: translatePrompt(file, languages),
          attachments: [{ type: 'file', path: file }]
        },
        15 * 60 * 1000 // 15 minutes timeout
      );

      const elapsed = (Date.now() - startTime) / 1000;
      const timeStr = elapsed > 60 ? `${(elapsed / 60).toFixed(1)}m` : `${elapsed.toFixed(1)}s`;
      console.info(`Translation agent task completed in ${timeStr}:`);
      console.log(response?.data.content);

      await session.destroy();
      debug('Copilot CLI session destroyed');
    } catch (error: unknown) {
      const error_ = error as Error;
      if (error_.message?.includes('ENOENT')) {
        throw new Error(
          `GitHub Copilot CLI is not installed.\nSee https://docs.github.com/copilot/how-tos/set-up/install-copilot-cli for installation instructions.`
        );
      }

      throw error_;
    } finally {
      await client.stop();
      debug('Copilot CLI client stopped');
    }

    // Temp workaround to avoid process hanging
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit();
  } catch (error: unknown) {
    const error_ = error as Error;
    console.error(error_.message);
    process.exitCode = 1;
  }
}
