/**
 * FORGE Streaming Response Handler
 * Parse and process Claude's streaming responses
 * Extract files, content, and explanations from markdown code blocks
 */

import { EventEmitter } from 'node:events';
import { FileGeneration, StreamingChunk } from './types';

export class StreamingResponseHandler extends EventEmitter {
  private buffer: string = '';
  private currentFile: Partial<FileGeneration> | null = null;
  private files: FileGeneration[] = [];
  private explanation: string = '';
  private inCodeBlock: boolean = false;
  private codeBlockLanguage: string = '';
  private codeBlockBuffer: string = '';
  private filePathPattern = /^(?:\/\/|#|\/\*)\s*(?:File:|Path:)?\s*(.+?)(?:\*\/)?$/i;

  constructor() {
    super();
  }

  /**
   * Process a chunk of streaming text
   */
  processChunk(chunk: string): void {
    this.buffer += chunk;

    // Process complete lines
    const lines = this.buffer.split('\n');

    // Keep the last incomplete line in the buffer
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      this.processLine(line);
    }
  }

  /**
   * Process a single line of text
   */
  private processLine(line: string): void {
    // Check for code block start
    const codeBlockStart = line.match(/^```(\w+)?/);
    if (codeBlockStart && !this.inCodeBlock) {
      this.inCodeBlock = true;
      this.codeBlockLanguage = codeBlockStart[1] || 'text';
      this.codeBlockBuffer = '';
      return;
    }

    // Check for code block end
    if (line.match(/^```$/) && this.inCodeBlock) {
      this.inCodeBlock = false;
      this.finalizeCodeBlock();
      return;
    }

    // If we're in a code block, accumulate the content
    if (this.inCodeBlock) {
      // Check if this is a file path comment (first line of code block)
      if (this.codeBlockBuffer === '' && this.looksLikeFilePath(line)) {
        const filePath = this.extractFilePath(line);
        if (filePath) {
          this.startNewFile(filePath, this.codeBlockLanguage);
          return;
        }
      }

      // Add line to code buffer
      this.codeBlockBuffer += line + '\n';

      // Emit content chunk if we have a current file
      if (this.currentFile) {
        this.emit('content-chunk', {
          type: 'content-chunk',
          data: { path: this.currentFile.path, chunk: line + '\n' },
        } as StreamingChunk);
      }

      return;
    }

    // If not in code block, treat as explanation text
    if (line.trim()) {
      this.explanation += line + '\n';
      this.emit('explanation', {
        type: 'explanation',
        data: { text: line },
      } as StreamingChunk);
    }
  }

  /**
   * Check if a line looks like a file path
   */
  private looksLikeFilePath(line: string): boolean {
    const trimmed = line.trim();
    return (
      this.filePathPattern.test(trimmed) ||
      trimmed.includes('/') ||
      trimmed.endsWith('.ts') ||
      trimmed.endsWith('.tsx') ||
      trimmed.endsWith('.js') ||
      trimmed.endsWith('.jsx') ||
      trimmed.endsWith('.css') ||
      trimmed.endsWith('.json') ||
      trimmed.endsWith('.md')
    );
  }

  /**
   * Extract file path from a comment line
   */
  private extractFilePath(line: string): string | null {
    const trimmed = line.trim();

    // Try pattern matching first
    const match = trimmed.match(this.filePathPattern);
    if (match) {
      return match[1].trim();
    }

    // If the line is just a path
    if (trimmed.includes('/') && !trimmed.includes(' ')) {
      return trimmed;
    }

    // Check for common comment patterns
    const commentPatterns = [
      /^\/\/\s*(.+)$/,
      /^#\s*(.+)$/,
      /^\/\*\s*(.+?)\s*\*\/$/,
    ];

    for (const pattern of commentPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const potential = match[1].trim();
        if (potential.includes('/') || potential.match(/\.\w+$/)) {
          return potential;
        }
      }
    }

    return null;
  }

  /**
   * Start tracking a new file
   */
  private startNewFile(path: string, language: string): void {
    // Finalize previous file if exists
    if (this.currentFile && this.currentFile.path) {
      this.finalizeCurrentFile();
    }

    // Start new file
    this.currentFile = {
      path: this.normalizeFilePath(path),
      content: '',
      language: this.normalizeLanguage(language),
    };

    this.emit('file-start', {
      type: 'file-start',
      data: { path: this.currentFile.path, language: this.currentFile.language },
    } as StreamingChunk);
  }

  /**
   * Finalize the current code block
   */
  private finalizeCodeBlock(): void {
    if (!this.currentFile) {
      // Code block without file path - might be inline example
      // Create a generic file or skip
      this.codeBlockBuffer = '';
      return;
    }

    // Set the content
    this.currentFile.content = this.codeBlockBuffer.trim();

    // Finalize the file
    this.finalizeCurrentFile();

    // Reset buffer
    this.codeBlockBuffer = '';
  }

  /**
   * Finalize the current file and add to files array
   */
  private finalizeCurrentFile(): void {
    if (!this.currentFile || !this.currentFile.path || !this.currentFile.content) {
      this.currentFile = null;
      return;
    }

    const file: FileGeneration = {
      path: this.currentFile.path,
      content: this.currentFile.content,
      language: this.currentFile.language || 'text',
      purpose: this.currentFile.purpose,
      patterns: this.currentFile.patterns,
    };

    this.files.push(file);

    this.emit('file-complete', {
      type: 'file-complete',
      data: file,
    } as StreamingChunk);

    this.currentFile = null;
  }

  /**
   * Finalize processing - call this when stream is complete
   */
  finalize(): void {
    // Process any remaining buffer
    if (this.buffer.trim()) {
      this.processLine(this.buffer);
    }

    // Finalize any open code block
    if (this.inCodeBlock && this.codeBlockBuffer) {
      this.finalizeCodeBlock();
    }

    // Finalize any open file
    if (this.currentFile) {
      this.finalizeCurrentFile();
    }

    this.emit('done', {
      type: 'done',
      data: {
        files: this.files,
        explanation: this.explanation.trim(),
      },
    } as StreamingChunk);
  }

  /**
   * Get all extracted files
   */
  getFiles(): FileGeneration[] {
    return this.files;
  }

  /**
   * Get the explanation text
   */
  getExplanation(): string {
    return this.explanation.trim();
  }

  /**
   * Reset the handler for a new stream
   */
  reset(): void {
    this.buffer = '';
    this.currentFile = null;
    this.files = [];
    this.explanation = '';
    this.inCodeBlock = false;
    this.codeBlockLanguage = '';
    this.codeBlockBuffer = '';
    this.removeAllListeners();
  }

  /**
   * Normalize file path
   */
  private normalizeFilePath(path: string): string {
    // Remove leading/trailing whitespace
    let normalized = path.trim();

    // Remove quotes
    normalized = normalized.replace(/^["']|["']$/g, '');

    // Ensure it starts with src/ or a known directory
    if (!normalized.startsWith('src/') &&
        !normalized.startsWith('public/') &&
        !normalized.startsWith('prisma/') &&
        !normalized.startsWith('tests/') &&
        !normalized.startsWith('.')) {
      normalized = 'src/' + normalized;
    }

    return normalized;
  }

  /**
   * Normalize language identifier
   */
  private normalizeLanguage(lang: string): string {
    const langMap: Record<string, string> = {
      'typescript': 'typescript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'javascript': 'javascript',
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'markdown': 'markdown',
      'md': 'markdown',
      'prisma': 'prisma',
      'sql': 'sql',
    };

    return langMap[lang.toLowerCase()] || lang;
  }

  /**
   * Parse a complete response (non-streaming)
   */
  static parseCompleteResponse(text: string): {
    files: FileGeneration[];
    explanation: string;
  } {
    const handler = new StreamingResponseHandler();
    handler.processChunk(text);
    handler.finalize();

    return {
      files: handler.getFiles(),
      explanation: handler.getExplanation(),
    };
  }

  /**
   * Extract files from markdown code blocks
   */
  static extractFilesFromMarkdown(markdown: string): FileGeneration[] {
    const files: FileGeneration[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const language = match[1] || 'text';
      const content = match[2];

      // Try to find file path in first line
      const lines = content.split('\n');
      const firstLine = lines[0].trim();

      const handler = new StreamingResponseHandler();
      const filePath = handler['extractFilePath'](firstLine);

      if (filePath) {
        files.push({
          path: handler['normalizeFilePath'](filePath),
          content: lines.slice(1).join('\n').trim(),
          language: handler['normalizeLanguage'](language),
        });
      } else {
        // Generic file without path
        files.push({
          path: `unknown-${files.length}.${language}`,
          content: content.trim(),
          language: handler['normalizeLanguage'](language),
        });
      }
    }

    return files;
  }
}

/**
 * Create a streaming handler with event listeners
 */
export function createStreamingHandler(callbacks: {
  onFileStart?: (data: { path: string; language: string }) => void;
  onContentChunk?: (data: { path: string; chunk: string }) => void;
  onFileComplete?: (file: FileGeneration) => void;
  onExplanation?: (data: { text: string }) => void;
  onDone?: (data: { files: FileGeneration[]; explanation: string }) => void;
  onError?: (error: Error) => void;
}): StreamingResponseHandler {
  const handler = new StreamingResponseHandler();

  if (callbacks.onFileStart) {
    handler.on('file-start', (chunk: StreamingChunk) => {
      callbacks.onFileStart!(chunk.data);
    });
  }

  if (callbacks.onContentChunk) {
    handler.on('content-chunk', (chunk: StreamingChunk) => {
      callbacks.onContentChunk!(chunk.data);
    });
  }

  if (callbacks.onFileComplete) {
    handler.on('file-complete', (chunk: StreamingChunk) => {
      callbacks.onFileComplete!(chunk.data);
    });
  }

  if (callbacks.onExplanation) {
    handler.on('explanation', (chunk: StreamingChunk) => {
      callbacks.onExplanation!(chunk.data);
    });
  }

  if (callbacks.onDone) {
    handler.on('done', (chunk: StreamingChunk) => {
      callbacks.onDone!(chunk.data);
    });
  }

  if (callbacks.onError) {
    handler.on('error', (error: Error) => {
      callbacks.onError!(error);
    });
  }

  return handler;
}
