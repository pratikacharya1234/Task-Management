import { GeneratedFile, Feature, Decision } from './types'

export class DocumentationGenerator {
  /**
   * Generate feature documentation
   */
  async generateFeatureDocumentation(
    feature: Feature,
    files: GeneratedFile[]
  ): Promise<GeneratedFile> {
    const content = this.buildFeatureReadme(feature, files)

    return {
      path: `docs/features/${feature.name.toLowerCase().replace(/\s+/g, '-')}.md`,
      content,
      language: 'markdown',
      type: 'doc',
      explanation: `Documentation for ${feature.name} feature`,
    }
  }

  /**
   * Generate Architecture Decision Record (ADR)
   */
  async generateArchitectureDecisionRecord(decision: Decision): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0]
    const fileName = `${timestamp}-${decision.title.toLowerCase().replace(/\s+/g, '-')}.md`

    const content = `# ${decision.title}

**Status:** ${decision.status}
**Date:** ${new Date().toLocaleDateString()}
**Category:** ${decision.category.replace(/_/g, ' ')}

## Context

${decision.description}

## Decision

We have decided to use **${decision.selectedOption || decision.recommendedOption}**.

## Consequences

### Positive

${decision.alternatives?.find((a: any) => a.name === decision.selectedOption)?.pros?.map((p: string) => `- ${p}`).join('\n') || 'N/A'}

### Negative

${decision.alternatives?.find((a: any) => a.name === decision.selectedOption)?.cons?.map((c: string) => `- ${c}`).join('\n') || 'N/A'}

## Alternatives Considered

${decision.alternatives?.map((alt: any) => `
### ${alt.name}

**Pros:**
${alt.pros?.map((p: string) => `- ${p}`).join('\n') || 'N/A'}

**Cons:**
${alt.cons?.map((c: string) => `- ${c}`).join('\n') || 'N/A'}
`).join('\n') || 'No alternatives documented'}

## Impact Analysis

${decision.costImplications ? `**Cost:** ${decision.costImplications}` : ''}
${decision.performanceImplications ? `\n**Performance:** ${decision.performanceImplications}` : ''}
${decision.securityImplications ? `\n**Security:** ${decision.securityImplications}` : ''}
${decision.learningCurve ? `\n**Learning Curve:** ${decision.learningCurve}` : ''}
${decision.futureFlexibility ? `\n**Future Flexibility:** ${decision.futureFlexibility}` : ''}
`

    return content
  }

  /**
   * Build feature README content
   */
  private buildFeatureReadme(feature: Feature, files: GeneratedFile[]): string {
    const components = files.filter((f) => f.type === 'component')
    const apis = files.filter((f) => f.type === 'api')
    const tests = files.filter((f) => f.type === 'test')

    return `# Feature: ${feature.name}

## Overview

${feature.description}

## Files Generated

Total files: ${files.length}

### Components (${components.length})
${components.map((f) => `- \`${f.path}\` - ${f.explanation || 'Component file'}`).join('\n') || 'No components generated'}

### API Routes (${apis.length})
${apis.map((f) => `- \`${f.path}\` - ${f.explanation || 'API endpoint'}`).join('\n') || 'No API routes generated'}

### Tests (${tests.length})
${tests.map((f) => `- \`${f.path}\``).join('\n') || 'No tests generated'}

## Setup

### 1. Environment Variables

Add the following to your \`.env\` file:

\`\`\`env
# Add required environment variables here
\`\`\`

### 2. Database Migrations

If this feature requires database changes:

\`\`\`bash
pnpm db:push
\`\`\`

### 3. Dependencies

Install any new dependencies:

\`\`\`bash
pnpm install
\`\`\`

## Usage

${this.generateUsageExample(feature, components)}

## API Endpoints

${this.generateApiDocumentation(apis)}

## Security

- All endpoints require authentication
- Input validation implemented
- CSRF protection enabled
- Rate limiting applied

## Testing

Run tests for this feature:

\`\`\`bash
pnpm test ${feature.name.toLowerCase()}
\`\`\`

## Performance Considerations

- Optimized database queries
- Caching implemented where appropriate
- Lazy loading for components
- Code splitting enabled

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation supported
- Screen reader compatible
- ARIA labels included

## Troubleshooting

### Common Issues

1. **Issue:** Feature not working after deployment
   - **Solution:** Check environment variables are set correctly

2. **Issue:** Database errors
   - **Solution:** Ensure migrations have been run

## Changelog

- **${new Date().toLocaleDateString()}**: Initial feature implementation

## Related Documentation

- [Architecture Decisions](../decisions/)
- [API Reference](../api/)
- [Testing Guide](../testing/)
`
  }

  /**
   * Generate usage example
   */
  private generateUsageExample(feature: Feature, components: GeneratedFile[]): string {
    if (components.length === 0) {
      return 'No components generated for this feature.'
    }

    const mainComponent = components[0]
    const componentName = mainComponent.path.split('/').pop()?.replace(/\.(tsx|ts)$/, '') || 'Component'

    return `\`\`\`tsx
import { ${componentName} } from '@/components/${componentName}'

function MyPage() {
  return (
    <div>
      <${componentName} />
    </div>
  )
}
\`\`\`
`
  }

  /**
   * Generate API documentation
   */
  private generateApiDocumentation(apis: GeneratedFile[]): string {
    if (apis.length === 0) {
      return 'No API endpoints generated for this feature.'
    }

    return apis
      .map((api) => {
        const routeName = api.path.split('/').pop()?.replace(/\.(tsx|ts)$/, '') || 'route'
        const endpoint = `/api/${routeName}`

        return `### \`${endpoint}\`

**Methods:** GET, POST, PUT, DELETE

**Authentication:** Required

**Request:**
\`\`\`json
{
  "data": "example"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {}
}
\`\`\`

**Error Responses:**
- \`400\`: Bad Request - Invalid input data
- \`401\`: Unauthorized - Authentication required
- \`403\`: Forbidden - Insufficient permissions
- \`404\`: Not Found - Resource not found
- \`500\`: Internal Server Error
`
      })
      .join('\n\n')
  }
}
