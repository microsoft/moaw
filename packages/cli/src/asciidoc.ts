import createDebug from 'debug';
import Processor, { type Asciidoctor } from 'asciidoctor';
import { escapeForHtml, unescapeHtml } from './util.js';
import { createFrontmatter, type FrontMatterData, validateMetadata } from './frontmatter.js';

const debug = createDebug('asciidoc');

export type AsciidocConversionResult = {
  markdown: string;
  warnings: string[];
  errors: string[];
};

const admonitionMap: Record<string, string> = {
  note: 'info',
  tip: 'tip',
  important: 'important',
  warning: 'important',
  caution: 'warning'
};

export async function convertToMarkdown(
  file: string,
  attributes: Record<string, any> = {}
): Promise<AsciidocConversionResult> {
  // Workaround issue with asciidoctor.js typings
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const asciidoctor = new (Processor as any)() as Asciidoctor;
  const converter = new MarkdownConverter(asciidoctor);
  asciidoctor.ConverterFactory.register(converter, ['md']);
  const md = asciidoctor.convertFile(file, {
    doctype: 'book',
    standalone: true,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    to_file: false,
    safe: 'unsafe',
    backend: 'md',
    attributes
  });
  return {
    markdown: md as string,
    warnings: converter.warnings,
    errors: converter.errors
  };
}

class MarkdownConverter implements Asciidoctor.AbstractConverter {
  baseConverter: Asciidoctor.Html5Converter;
  warnings: string[] = [];
  errors: string[] = [];

  constructor(asciidoctor: Asciidoctor) {
    this.baseConverter = asciidoctor.Html5Converter.create();
  }

  convert(node: Asciidoctor.AbstractNode, transform?: string, options?: unknown): string {
    // Adapted to markdown from original HTML5 converter:
    // https://github.com/asciidoctor/asciidoctor/blob/main/lib/asciidoctor/converter/html5.rb
    const type = node.getNodeName();
    switch (type) {
      case 'preamble': {
        return this.convertPreamble(node as Asciidoctor.Block);
      }

      case 'paragraph': {
        return this.convertParagraph(node as Asciidoctor.Block);
      }

      case 'ulist': {
        return this.convertUlist(node as Asciidoctor.List);
      }

      case 'olist': {
        return this.convertOlist(node as Asciidoctor.List);
      }

      case 'admonition': {
        return this.convertAdmonition(node as Asciidoctor.Block);
      }

      case 'image': {
        return this.convertImage(node as Asciidoctor.Block);
      }

      case 'inline_quoted': {
        return this.convertInlineQuoted(node as Asciidoctor.Inline) ?? '';
      }

      case 'document': {
        return this.convertDocument(node as Asciidoctor.Document);
      }

      case 'inline_anchor': {
        return this.convertInlineAnchor(node as Asciidoctor.Inline);
      }

      case 'section': {
        return this.convertSection(node as Asciidoctor.Section);
      }

      case 'listing': {
        return this.convertListing(node as Asciidoctor.List);
      }

      case 'page_break': {
        return this.convertPageBreak(node as Asciidoctor.Block);
      }

      case 'thematic_break': {
        return this.convertThematicBreak(node as Asciidoctor.Block);
      }

      case 'table': {
        return this.convertTable(node as Asciidoctor.Table);
      }

      case 'quote': {
        return this.convertQuote(node as Asciidoctor.Block);
      }

      // Case 'literal': return convert_literal(node);
      // case 'dlist': return convert_dlist(node);
      // case 'colist': return convert_colist(node);
      // case 'embedded': return convert_embedded(node);
      // case 'example': return convert_example(node);
      // case 'floating_title': return convert_floating_title(node);
      // case 'inline_break': return convert_inline_break(node);
      // case 'inline_button': return convert_inline_button(node);
      // case 'inline_callout': return convert_inline_callout(node);
      // case 'inline_footnote': return convert_inline_footnote(node);
      // case 'inline_image': return convert_inline_image(node);
      // case 'inline_indexterm': return convert_inline_indexterm(node);
      // case 'inline_kbd': return convert_inline_kbd(node);
      // case 'inline_menu': return convert_inline_menu(node);
      // case 'open': return convert_open(node);
      // case 'sidebar': return convert_sidebar(node);
      // case 'stem': return convert_stem(node);
      // case 'verse': return convert_verse(node);
      // case 'video': return convert_video(node);
      // case 'toc': return convert_toc(node);
      // case 'pass': return convert_pass(node);
      // case 'audio': return convert_audio(node);
      default: {
        debug(`Unsupported node type: ${type}`);
        return this.baseConverter.convert(node, transform);
      }
    }
  }

  convertParagraph(node: Asciidoctor.Block) {
    return `${node.getContent()}\n`;
  }

  convertPreamble(node: Asciidoctor.Block) {
    const doc = node.getDocument();
    const tocPlacement = doc.getAttribute('toc-placement') as string;
    let toc = '';
    if (tocPlacement === 'preamble' && doc.getSections() && doc.getAttribute('toc')) {
      toc = doc.getConverter().convert(doc, 'outline');
    }

    return `${node.getContent()}\n${toc}`;
  }

  convertUlist(node: Asciidoctor.List) {
    const checklist = node.isOption('checklist');
    const items = node.getItems();
    const result = items.map((item) => {
      const check = checklist ? (item.getAttribute('checked') ? '[x] ' : '[ ] ') : '';
      return `- ${check}${unescapeHtml(item.getText())}`;
    });
    return result.join('\n');
  }

  convertOlist(node: Asciidoctor.List) {
    const items = node.getItems();
    const reversed = node.isOption('reversed') ?? false;
    const start = node.getAttribute('start', reversed ? items.length : 1) as number;
    const result = items.map((item, index: number) => {
      const number_ = reversed ? start - index : start + index;
      return `${number_}. ${unescapeHtml(item.getText())}`;
    });
    return result.join('\n');
  }

  convertAdmonition(node: Asciidoctor.Block) {
    const content = unescapeHtml(node.getContent().split('\n').join('\n> '));
    const name = (node.getAttribute('name') as string | undefined)?.toLowerCase() ?? '';
    const title = escapeForHtml(node.getTitle() ?? name);

    if (admonitionMap[name] === undefined) {
      const error = `Unsupported admonition type: ${name}`;
      this.errors.push('Error: ' + error);
      debug(error);
    }

    const type = admonitionMap[name] ?? 'info';
    const result = `\n<div class="${type}" data-title="${title}">\n\n> ${content}\n\n</div>\n`;
    return result;
  }

  convertImage(node: Asciidoctor.Block) {
    const target = node.getAttribute('target') as string;
    const caption = node.getCaption();
    const alt = unescapeHtml(node.getAlt());
    const url = node.getImageUri(target) ?? '';
    const title = unescapeHtml(node.getTitle());
    const result = `![${alt}](${url}${title ? ` "${title}"` : ''})\n`;

    if (caption) {
      // TODO: handle caption
      const warning = 'Image caption is not supported';
      this.warnings.push(warning);
      debug('Warning: ' + warning);
    }

    return result;
  }

  convertInlineQuoted(node: Asciidoctor.Inline) {
    const type = node.getType();
    const text = node.getText();
    const result = escapeForHtml(text);
    switch (type) {
      case 'monospaced': {
        return `\`${result}\``;
      }

      case 'emphasis': {
        return `*${result}*`;
      }

      case 'strong': {
        return `**${result}**`;
      }

      case 'mark': {
        return `==${result}==`;
      }

      case 'superscript': {
        return `^${result}^`;
      }

      case 'subscript': {
        return `~${result}~`;
      }

      case 'double': {
        return `“${result}”`;
      }

      case 'single': {
        return `‘${result}’`;
      }

      case 'asciimath': {
        return `\\$${result}\\$`;
      }

      case 'latexmath': {
        return `\\(${result}\\)`;
      }

      default: {
        const error = `Unsupported inline quote type: ${type}`;
        this.errors.push(error);
        debug('Error: ' + error);
        return result;
      }
    }
  }

  convertDocument(node: Asciidoctor.Document) {
    const title = String(node.getDocumentTitle());
    const authors = node
      .getAuthor()
      .split(',')
      .map((author) => author.trim());

    let metadata = node.getAttributes()?.meta as FrontMatterData;
    if (!metadata) {
      const error = 'Missing attribute "meta" with MOAW frontmatter data';
      this.errors.push(error);
      debug('Error: ' + error);
    }

    metadata = {
      title,
      authors,
      type: 'workshop',
      published: true,
      ...metadata
    };
    const metadataErrors = validateMetadata(metadata);
    if (metadataErrors.length > 0) {
      for (const metaError of metadataErrors) {
        const error = `In metadata: ${metaError}`;
        this.errors.push(error);
        debug('Error: ' + error);
      }
    }

    return `${createFrontmatter(metadata)}\n# ${title}\n\n${node.getContent()}`;
  }

  convertInlineAnchor(node: Asciidoctor.Inline) {
    const text = unescapeHtml(node.getText());
    const type = node.getType();
    const target = node.getTarget() ?? '';
    switch (type) {
      case 'ref':
      case 'xref':
      case 'link': {
        return `[${text}](${target})`;
      }

      default: {
        const error = `Unsupported inline anchor type: ${type}`;
        this.errors.push(error);
        debug('Error: ' + error);
        return `${text}`;
      }
    }
  }

  convertSection(node: Asciidoctor.Section) {
    const level = node.getLevel() + 1;
    const title = unescapeHtml(node.getTitle());
    const content = unescapeHtml(node.getContent());
    const result = `${'#'.repeat(level)} ${title}` + (content ? `\n\n${content}` : '');
    return result;
  }

  convertListing(node: Asciidoctor.List) {
    const caption = node.getCaption();
    const content = unescapeHtml(node.getContent());
    const language = (node.getAttribute('language') as string | undefined) ?? '';
    const result = `\`\`\`${language}\n${content}\n\`\`\``;
    return result;
  }

  convertPageBreak(_node: Asciidoctor.Block) {
    return `\n---\n`;
  }

  convertThematicBreak(_node: Asciidoctor.Block) {
    return `***\n`;
  }

  convertTable(node: Asciidoctor.Table) {
    let result = '';
    const title = node.getCaptionedTitle();
    const columns = node.getColumns();
    const rows = node.getRows();
    const header = rows.getHead();
    const body = rows.getBody();
    const footer = rows.getFoot();
    const mapRows = (rows: Asciidoctor.Table.Cell[][], header = false) =>
      rows
        .map(
          (cells: Asciidoctor.Table.Cell[]) =>
            `| ` +
            cells
              .map((cell: Asciidoctor.Table.Cell) => {
                const style = cell.getStyle();
                if (!header && style === 'literal') {
                  return `\`${cell.getText()}\``;
                }

                if (!header && style === 'asciidoc') {
                  return cell.getContent();
                }

                return unescapeHtml(cell.getText());
              })
              .join(' | ') +
            ' |\n'
        )
        .join('');

    result += header.length > 0 ? mapRows(header, true) : `| ${' | '.repeat(columns.length - 1)} |\n`;
    result +=
      '| ' +
      columns
        .map((column: Asciidoctor.Table.Column) => {
          const align = column.getHorizontalAlign();
          switch (align) {
            case 'left': {
              return ':--';
            }

            case 'right': {
              return '--:';
            }

            case 'center': {
              return ':-:';
            }

            default: {
              return '---';
            }
          }
        })
        .join(' | ') +
      ' |\n';
    result += mapRows(body);

    if (footer.length > 0) {
      const warning = 'Table footer is not supported in markdown, appending to body instead';
      this.warnings.push(warning);
      debug('Warning: ' + warning);
      result += mapRows(footer);
    }

    if (title) {
      // TODO: handle caption
      const warning = 'Table caption is not supported';
      this.warnings.push(warning);
      debug('Warning: ' + warning);
    }

    return result;
  }

  convertQuote(node: Asciidoctor.Block) {
    const attribution = (node.getAttribute('attribution') as string | undefined) ?? '';
    const citetitle = (node.getAttribute('citetitle') as string | undefined) ?? '';
    const content = unescapeHtml(node.getContent().split('\n').join('\n> '));
    const citeContent = citetitle ? `<cite>${citetitle}</cite>` : '';
    const attributionText = attribution ? `— ${attribution}${citetitle ? '<br>\n> ' : ''}` : '';
    return `> ${content}${attribution || citetitle ? '\n> ' + attributionText + citeContent : ''}`;
  }
}
