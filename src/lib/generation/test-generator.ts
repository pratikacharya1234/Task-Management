import { GeneratedFile, GenerationContext } from './types'

export class TestGenerator {
  /**
   * Generate test files based on production mode
   */
  async generateTests(
    file: GeneratedFile,
    context: GenerationContext
  ): Promise<GeneratedFile[]> {
    const tests: GeneratedFile[] = []

    switch (file.type) {
      case 'component':
        tests.push(...await this.generateComponentTests(file, context))
        break
      case 'api':
        tests.push(...await this.generateApiTests(file, context))
        break
      case 'type':
        // Types usually don't need tests
        break
      default:
        tests.push(...await this.generateUtilityTests(file, context))
    }

    return tests
  }

  /**
   * Generate React component tests
   */
  private async generateComponentTests(
    file: GeneratedFile,
    context: GenerationContext
  ): Promise<GeneratedFile[]> {
    const testPath = file.path.replace(/\.(tsx|ts)$/, '.test.$1')
    const componentName = this.extractComponentName(file.path)

    const testContent = this.generateComponentTestContent(
      componentName,
      file.path,
      context.mode
    )

    return [
      {
        path: testPath,
        content: testContent,
        language: 'typescript',
        type: 'test',
        explanation: `Test suite for ${componentName} component`,
      },
    ]
  }

  /**
   * Generate API route tests
   */
  private async generateApiTests(
    file: GeneratedFile,
    context: GenerationContext
  ): Promise<GeneratedFile[]> {
    const testPath = file.path.replace(/\.(tsx|ts)$/, '.test.$1')
    const routeName = this.extractRouteName(file.path)

    const testContent = this.generateApiTestContent(routeName, file.path, context.mode)

    return [
      {
        path: testPath,
        content: testContent,
        language: 'typescript',
        type: 'test',
        explanation: `Test suite for ${routeName} API route`,
      },
    ]
  }

  /**
   * Generate utility function tests
   */
  private async generateUtilityTests(
    file: GeneratedFile,
    context: GenerationContext
  ): Promise<GeneratedFile[]> {
    const testPath = file.path.replace(/\.(tsx|ts)$/, '.test.$1')
    const utilityName = this.extractUtilityName(file.path)

    const testContent = this.generateUtilityTestContent(
      utilityName,
      file.path,
      context.mode
    )

    return [
      {
        path: testPath,
        content: testContent,
        language: 'typescript',
        type: 'test',
        explanation: `Test suite for ${utilityName} utility`,
      },
    ]
  }

  /**
   * Generate component test content
   */
  private generateComponentTestContent(
    componentName: string,
    filePath: string,
    mode: string
  ): string {
    const importPath = filePath.replace(/^src\//, '@/').replace(/\.(tsx|ts)$/, '')

    let content = `import { render, screen, fireEvent } from '@testing-library/react'
import { ${componentName} } from '${importPath}'

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles user interactions', () => {
    const onClick = vi.fn()
    render(<${componentName} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
`

    // Add more tests for startup and enterprise modes
    if (mode === 'startup' || mode === 'enterprise') {
      content += `
  it('renders with props', () => {
    const props = { title: 'Test Title' }
    render(<${componentName} {...props} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<${componentName} isLoading={true} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<${componentName} error="Test error" />)
    expect(screen.getByText(/test error/i)).toBeInTheDocument()
  })
`
    }

    // Add accessibility tests for enterprise mode
    if (mode === 'enterprise') {
      content += `
  it('is accessible', async () => {
    const { container } = render(<${componentName} />)
    // Add accessibility checks here
    expect(container).toBeInTheDocument()
  })
`
    }

    content += `})
`

    return content
  }

  /**
   * Generate API test content
   */
  private generateApiTestContent(
    routeName: string,
    filePath: string,
    mode: string
  ): string {
    let content = `import { describe, it, expect } from 'vitest'
import { ${routeName} } from '${filePath.replace(/^src\//, '@/').replace(/\.(tsx|ts)$/, '')}'

describe('${routeName} API', () => {
  it('returns 200 for valid request', async () => {
    const response = await ${routeName}({ method: 'GET' })
    expect(response.status).toBe(200)
  })

  it('returns 400 for invalid data', async () => {
    const response = await ${routeName}({ method: 'POST', body: {} })
    expect(response.status).toBe(400)
  })
`

    // Add more tests for startup and enterprise modes
    if (mode === 'startup' || mode === 'enterprise') {
      content += `
  it('returns 401 when not authenticated', async () => {
    const response = await ${routeName}({ method: 'GET' })
    expect(response.status).toBe(401)
  })

  it('returns 403 when unauthorized', async () => {
    const response = await ${routeName}({ method: 'DELETE', user: { role: 'user' } })
    expect(response.status).toBe(403)
  })

  it('returns 404 for non-existent resource', async () => {
    const response = await ${routeName}({ method: 'GET', params: { id: 'invalid' } })
    expect(response.status).toBe(404)
  })

  it('returns 500 on server error', async () => {
    // Mock server error
    const response = await ${routeName}({ method: 'GET', simulateError: true })
    expect(response.status).toBe(500)
  })
`
    }

    content += `})
`

    return content
  }

  /**
   * Generate utility test content
   */
  private generateUtilityTestContent(
    utilityName: string,
    filePath: string,
    mode: string
  ): string {
    const content = `import { describe, it, expect } from 'vitest'
import { ${utilityName} } from '${filePath.replace(/^src\//, '@/').replace(/\.(tsx|ts)$/, '')}'

describe('${utilityName}', () => {
  it('works with valid input', () => {
    const result = ${utilityName}('valid input')
    expect(result).toBeDefined()
  })

  it('handles edge cases', () => {
    expect(${utilityName}('')).toBeDefined()
    expect(${utilityName}(null)).toBeDefined()
    expect(${utilityName}(undefined)).toBeDefined()
  })

  it('throws on invalid input', () => {
    expect(() => ${utilityName}('invalid')).toThrow()
  })
})
`

    return content
  }

  /**
   * Extract component name from file path
   */
  private extractComponentName(path: string): string {
    const fileName = path.split('/').pop() || ''
    return fileName.replace(/\.(tsx|ts)$/, '')
  }

  /**
   * Extract route name from file path
   */
  private extractRouteName(path: string): string {
    const fileName = path.split('/').pop() || ''
    return fileName.replace(/\.(tsx|ts)$/, '')
  }

  /**
   * Extract utility name from file path
   */
  private extractUtilityName(path: string): string {
    const fileName = path.split('/').pop() || ''
    return fileName.replace(/\.(tsx|ts)$/, '')
  }
}
