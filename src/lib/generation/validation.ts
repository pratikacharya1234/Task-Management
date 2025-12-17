import { ValidationResult, ValidationIssue, GeneratedFile } from './types'

/**
 * Validate TypeScript code
 */
export function validateTypeScript(code: string): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const suggestions: ValidationIssue[] = []

  // Check for 'any' types
  const anyRegex = /:\s*any\b/g
  let match
  while ((match = anyRegex.exec(code)) !== null) {
    const lineNumber = code.substring(0, match.index).split('\n').length
    warnings.push({
      severity: 'warning',
      message: 'Usage of \'any\' type detected. Consider using a more specific type.',
      line: lineNumber,
      code: code.split('\n')[lineNumber - 1],
    })
  }

  // Check for missing return types on functions
  const functionRegex = /function\s+\w+\s*\([^)]*\)\s*{/g
  while ((match = functionRegex.exec(code)) !== null) {
    if (!code.substring(match.index, match.index + 100).includes(':')) {
      const lineNumber = code.substring(0, match.index).split('\n').length
      suggestions.push({
        severity: 'info',
        message: 'Function missing explicit return type',
        line: lineNumber,
        code: code.split('\n')[lineNumber - 1],
      })
    }
  }

  // Check for console.log (should not be in production code)
  const consoleRegex = /console\.(log|debug|info)/g
  while ((match = consoleRegex.exec(code)) !== null) {
    const lineNumber = code.substring(0, match.index).split('\n').length
    warnings.push({
      severity: 'warning',
      message: 'Console statement found. Remove before production deployment.',
      line: lineNumber,
      code: code.split('\n')[lineNumber - 1],
    })
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * Validate file structure and organization
 */
export function validateFileStructure(files: GeneratedFile[]): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const suggestions: ValidationIssue[] = []

  files.forEach((file) => {
    // Check proper organization
    if (file.type === 'component' && !file.path.includes('components/')) {
      warnings.push({
        severity: 'warning',
        message: 'Component should be in components/ directory',
        file: file.path,
      })
    }

    if (file.type === 'api' && !file.path.match(/(api|routers|server)/)) {
      warnings.push({
        severity: 'warning',
        message: 'API files should be in app/api/ or server/routers/',
        file: file.path,
      })
    }

    // Check naming conventions
    if (file.type === 'component') {
      const fileName = file.path.split('/').pop() || ''
      if (!/^[A-Z]/.test(fileName)) {
        errors.push({
          severity: 'error',
          message: 'Component files should use PascalCase',
          file: file.path,
        })
      }
    }

    // Check file extensions
    if (file.type === 'component' && !file.path.endsWith('.tsx')) {
      warnings.push({
        severity: 'warning',
        message: 'React components should use .tsx extension',
        file: file.path,
      })
    }
  })

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * Validate security concerns in code
 */
export function validateSecurity(code: string, language: string): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const suggestions: ValidationIssue[] = []

  // Check for SQL injection vulnerabilities
  if (code.match(/`\s*SELECT\s+.*\$\{/i)) {
    const match = code.match(/`\s*SELECT\s+.*\$\{/i)
    if (match) {
      const lineNumber = code.substring(0, match.index).split('\n').length
      errors.push({
        severity: 'error',
        message: 'Potential SQL injection vulnerability. Use parameterized queries.',
        line: lineNumber,
        code: code.split('\n')[lineNumber - 1],
      })
    }
  }

  // Check for dangerouslySetInnerHTML without sanitization
  if (code.includes('dangerouslySetInnerHTML')) {
    const regex = /dangerouslySetInnerHTML/g
    let match
    while ((match = regex.exec(code)) !== null) {
      const lineNumber = code.substring(0, match.index).split('\n').length
      warnings.push({
        severity: 'warning',
        message: 'Using dangerouslySetInnerHTML. Ensure content is sanitized.',
        line: lineNumber,
        code: code.split('\n')[lineNumber - 1],
      })
    }
  }

  // Check for hardcoded secrets
  const secretPatterns = [
    /api[_-]?key\s*=\s*['"][^'"]+['"]/i,
    /password\s*=\s*['"][^'"]+['"]/i,
    /secret\s*=\s*['"][^'"]+['"]/i,
    /token\s*=\s*['"][^'"]+['"]/i,
  ]

  secretPatterns.forEach((pattern) => {
    const match = code.match(pattern)
    if (match && !match[0].includes('process.env')) {
      const lineNumber = code.substring(0, (match.index || 0)).split('\n').length
      errors.push({
        severity: 'error',
        message: 'Hardcoded secret detected. Use environment variables instead.',
        line: lineNumber,
        code: code.split('\n')[lineNumber - 1],
      })
    }
  })

  // Check for eval usage
  if (code.includes('eval(')) {
    const regex = /eval\(/g
    let match
    while ((match = regex.exec(code)) !== null) {
      const lineNumber = code.substring(0, match.index).split('\n').length
      errors.push({
        severity: 'error',
        message: 'Use of eval() is dangerous and should be avoided.',
        line: lineNumber,
        code: code.split('\n')[lineNumber - 1],
      })
    }
  }

  // Check for Math.random() in security contexts
  if (code.match(/Math\.random\(\).*(?:token|secret|key|id)/i)) {
    const match = code.match(/Math\.random\(\).*(?:token|secret|key|id)/i)
    if (match) {
      const lineNumber = code.substring(0, (match.index || 0)).split('\n').length
      warnings.push({
        severity: 'warning',
        message: 'Math.random() is not cryptographically secure. Use crypto.randomBytes() instead.',
        line: lineNumber,
        code: code.split('\n')[lineNumber - 1],
      })
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * Validate accessibility
 */
export function validateAccessibility(code: string): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const suggestions: ValidationIssue[] = []

  // Check for images without alt text
  if (code.match(/<img\s+(?![^>]*alt=)[^>]*>/i)) {
    const regex = /<img\s+(?![^>]*alt=)[^>]*>/gi
    let match
    while ((match = regex.exec(code)) !== null) {
      const lineNumber = code.substring(0, match.index).split('\n').length
      errors.push({
        severity: 'error',
        message: 'Image missing alt attribute for accessibility',
        line: lineNumber,
        code: code.split('\n')[lineNumber - 1],
      })
    }
  }

  // Check for clickable divs without role
  if (code.match(/<div[^>]*onClick[^>]*>/i) && !code.match(/role=/i)) {
    warnings.push({
      severity: 'warning',
      message: 'Clickable div should have role="button" and onKeyDown handler',
    })
  }

  // Check for missing form labels
  if (code.match(/<input[^>]*>/i) && !code.match(/aria-label|<label/i)) {
    suggestions.push({
      severity: 'info',
      message: 'Form inputs should have associated labels or aria-label',
    })
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * Validate performance
 */
export function validatePerformance(code: string, language: string): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const suggestions: ValidationIssue[] = []

  // Check for large inline objects in JSX
  if (code.match(/style=\{\{[^}]{100,}\}\}/)) {
    warnings.push({
      severity: 'warning',
      message: 'Large inline style object. Consider moving to constants or CSS.',
    })
  }

  // Check for missing memoization
  if (code.includes('useEffect') && !code.includes('useMemo') && !code.includes('useCallback')) {
    suggestions.push({
      severity: 'info',
      message: 'Consider using useMemo or useCallback to optimize performance',
    })
  }

  // Check for importing entire libraries
  if (code.match(/import\s+\*\s+as\s+\w+\s+from\s+['"](?!@\/)/)) {
    suggestions.push({
      severity: 'info',
      message: 'Importing entire library. Consider importing only needed functions.',
    })
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * Validate tests
 */
export function validateTests(files: GeneratedFile[]): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const suggestions: ValidationIssue[] = []

  const componentFiles = files.filter((f) => f.type === 'component')
  const apiFiles = files.filter((f) => f.type === 'api')
  const testFiles = files.filter((f) => f.type === 'test')

  // Check if every component has a test
  componentFiles.forEach((comp) => {
    const testPath = comp.path.replace(/\.(tsx|ts)$/, '.test.$1')
    const hasTest = testFiles.some((t) => t.path === testPath)
    if (!hasTest) {
      warnings.push({
        severity: 'warning',
        message: 'Component missing test file',
        file: comp.path,
      })
    }
  })

  // Check if every API route has a test
  apiFiles.forEach((api) => {
    const testPath = api.path.replace(/\.(tsx|ts)$/, '.test.$1')
    const hasTest = testFiles.some((t) => t.path === testPath)
    if (!hasTest) {
      warnings.push({
        severity: 'warning',
        message: 'API route missing test file',
        file: api.path,
      })
    }
  })

  // Check test quality
  testFiles.forEach((test) => {
    if (!test.content.includes('expect(')) {
      errors.push({
        severity: 'error',
        message: 'Test file has no assertions',
        file: test.path,
      })
    }

    if (!test.content.match(/describe\(|it\(|test\(/)) {
      errors.push({
        severity: 'error',
        message: 'Test file missing test structure (describe/it/test)',
        file: test.path,
      })
    }
  })

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}
