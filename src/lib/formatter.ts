import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserHtml from 'prettier/plugins/html';
import * as parserPostcss from 'prettier/plugins/postcss';
import * as parserEstree from 'prettier/plugins/estree';

export interface FormatResult {
  formatted: string;
  changed: boolean;
  error?: string;
}

export async function formatCode(
  content: string,
  language: string,
  fileName?: string
): Promise<FormatResult> {
  try {
    let parser = 'babel';
    let plugins: any[] = [parserBabel, parserEstree];

    // Determine parser by language or file extension
    const name = fileName?.toLowerCase() || '';
    if (language === 'html' || name.endsWith('.html')) {
      parser = 'html';
      plugins = [parserHtml];
    } else if (language === 'css' || name.endsWith('.css')) {
      parser = 'css';
      plugins = [parserPostcss];
    } else if (language === 'json' || name.endsWith('.json')) {
      parser = 'json';
      plugins = [parserBabel, parserEstree];
    } else if (language === 'typescript' || name.endsWith('.ts') || name.endsWith('.tsx')) {
      parser = 'babel-ts';
      plugins = [parserBabel, parserEstree];
    } else {
      parser = 'babel';
      plugins = [parserBabel, parserEstree];
    }

    const formatted = await prettier.format(content, {
      parser,
      plugins,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      printWidth: 80,
      trailingComma: 'es5',
      bracketSpacing: true,
    });

    return {
      formatted,
      changed: formatted !== content,
    };
  } catch (error: any) {
    console.warn('Prettier formatting warning:', error);
    return {
      formatted: content,
      changed: false,
      error: error?.message || 'Formatting failed',
    };
  }
}
