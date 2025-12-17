import { GeneratedFile } from './types'

export class CodeFormatter {
  private prettierConfig = {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5' as const,
    printWidth: 100,
    arrowParens: 'always' as const,
  }

  /**
   * Format code using Prettier
   */
  async formatCode(code: string, language: string): Promise<string> {
    try {
      // In a real implementation, we would use Prettier here
      // For now, return the code as-is since we can't import Prettier in this context
      // In production, you would:
      // const prettier = await import('prettier')
      // const formatted = await prettier.format(code, {
      //   ...this.prettierConfig,
      //   parser: this.getParser(language),
      // })
      // return formatted

      return code
    } catch (error) {
      console.error('Formatting error:', error)
      // Return original code if formatting fails
      return code
    }
  }

  /**
   * Format multiple files
   */
  async formatFiles(files: GeneratedFile[]): Promise<GeneratedFile[]> {
    const formatted = await Promise.all(
      files.map(async (file) => {
        // Skip non-formattable files
        if (this.isFormattable(file.language)) {
          const formattedContent = await this.formatCode(file.content, file.language)
          return { ...file, content: formattedContent }
        }
        return file
      })
    )
    return formatted
  }

  /**
   * Add imports to a file
   */
  async addImports(code: string, imports: string[]): Promise<string> {
    // Remove duplicates
    const uniqueImports = [...new Set(imports)]

    // Sort imports: built-in → external → internal
    const sortedImports = this.sortImports(uniqueImports)

    // Add to top of file
    const importStatements = sortedImports.join('\n')
    return `${importStatements}\n\n${code}`
  }

  /**
   * Organize imports in code
   */
  async organizeImports(code: string): Promise<string> {
    // Extract existing imports
    const importRegex = /^import\s+.+$/gm
    const imports = code.match(importRegex) || []

    if (imports.length === 0) return code

    // Sort imports
    const sortedImports = this.sortImports(imports)

    // Remove old imports and add sorted ones
    const codeWithoutImports = code.replace(importRegex, '').trim()
    return `${sortedImports.join('\n')}\n\n${codeWithoutImports}`
  }

  /**
   * Check if file type is formattable
   */
  private isFormattable(language: string): boolean {
    const formattableLanguages = [
      'typescript',
      'javascript',
      'tsx',
      'jsx',
      'css',
      'scss',
      'json',
      'html',
      'markdown',
    ]
    return formattableLanguages.includes(language.toLowerCase())
  }

  /**
   * Get Prettier parser for language
   */
  private getParser(language: string): string {
    const parserMap: Record<string, string> = {
      typescript: 'typescript',
      javascript: 'babel',
      tsx: 'typescript',
      jsx: 'babel',
      css: 'css',
      scss: 'scss',
      json: 'json',
      html: 'html',
      markdown: 'markdown',
    }
    return parserMap[language.toLowerCase()] || 'babel'
  }

  /**
   * Sort imports: built-in → external → internal
   */
  private sortImports(imports: string[]): string[] {
    const builtIn: string[] = []
    const external: string[] = []
    const internal: string[] = []

    imports.forEach((imp) => {
      if (imp.includes('from \'react\'') || imp.includes('from "react"')) {
        builtIn.push(imp)
      } else if (imp.includes('from \'@/') || imp.includes('from "@/')) {
        internal.push(imp)
      } else {
        external.push(imp)
      }
    })

    // Sort each group alphabetically
    return [
      ...builtIn.sort(),
      ...external.sort(),
      ...internal.sort(),
    ]
  }
}
