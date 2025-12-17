# FORGE AI Integration Layer

Production-ready AI integration system for FORGE using Claude API.

## Overview

The AI Integration Layer provides a complete, production-ready interface to Claude for code generation, chat, code explanation, and refactoring. It includes:

- **Streaming responses** with real-time file extraction
- **Cost tracking** with token counting and USD calculations
- **Retry logic** with exponential backoff for reliability
- **Context building** from project memory and decisions
- **Production mode prompts** (MVP, Startup, Enterprise)
- **Feature-specific prompts** for common patterns
- **Error handling** with custom error types
- **Usage quota management** to prevent overages

## Architecture

```
src/lib/ai/
├── types.ts              # TypeScript types and schemas
├── claude-client.ts      # Main Claude API client
├── cost-tracker.ts       # Token counting and cost tracking
├── streaming.ts          # Streaming response handler
├── context-builder.ts    # Context generation from project data
├── prompts/
│   ├── system-prompts.ts # Production mode system prompts
│   └── feature-prompts.ts # Feature-specific prompts
└── index.ts             # Barrel exports
```

## Quick Start

### Setup

1. Set your Anthropic API key:
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

2. Import the client:
```typescript
import { ClaudeClient } from '@/lib/ai';

const client = new ClaudeClient();
```

### Code Generation

```typescript
import { ClaudeClient } from '@/lib/ai';

const client = new ClaudeClient();

const response = await client.generateCode({
  projectId: 'proj_123',
  featureId: 'feat_456',
  userId: 'user_789',
  featureName: 'User Authentication',
  featureDescription: 'Complete auth system with email/password',
  featureCategory: 'authentication',
  requirements: {
    authMethod: 'email/password',
    emailVerification: true,
    passwordReset: true,
  },
  productionMode: 'startup',
  projectMemories: [],
  decisions: [],
  streaming: false,
});

console.log('Generated files:', response.files);
console.log('Explanation:', response.explanation);
console.log('Cost:', response.estimatedCost);
```

### Streaming Generation

```typescript
const stream = await client.generateCode({
  // ... same params as above
  streaming: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk); // Print as it streams
}

const result = await stream; // Get final result
console.log('Files:', result.files);
```

### Chat Interface

```typescript
const response = await client.chat({
  messages: [
    { role: 'user', content: 'How do I implement user authentication?' }
  ],
  userId: 'user_789',
  projectId: 'proj_123',
});

console.log(response.response);
```

### Code Explanation

```typescript
const explanation = await client.explain({
  code: `
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
  `,
  language: 'javascript',
  userId: 'user_789',
});

console.log(explanation.explanation);
```

### Code Refactoring

```typescript
const refactored = await client.refactor({
  code: '/* your code here */',
  instructions: 'Extract the validation logic into a separate function',
  language: 'typescript',
  userId: 'user_789',
  filePath: 'src/utils/validation.ts',
});

console.log(refactored.refactoredCode);
console.log(refactored.explanation);
```

## Production Modes

FORGE supports three production modes with different quality/speed tradeoffs:

### MVP Mode
- **Goal:** Ship fast, document technical debt
- **Quality:** Working functionality, basic validation, type safety
- **Trade-offs:** Minimal error handling, basic styling, limited tests
- **Use case:** Early-stage startups, prototypes, MVPs

### Startup Mode (Default)
- **Goal:** Balanced quality and speed
- **Quality:** Comprehensive validation, proper error handling, 70-80% test coverage
- **Trade-offs:** Some code duplication, optimization for likely scale (not max)
- **Use case:** Growing startups, production apps with moderate scale

### Enterprise Mode
- **Goal:** Maximum quality, security, compliance
- **Quality:** Bulletproof implementations, >90% test coverage, full security hardening
- **Trade-offs:** Slower development, more complex
- **Use case:** Mission-critical systems, healthcare, finance, enterprise apps

```typescript
const response = await client.generateCode({
  // ...
  productionMode: 'enterprise', // or 'mvp', 'startup'
});
```

## Cost Tracking

### Track Usage

```typescript
import { CostTracker } from '@/lib/ai';

// Calculate cost for a request
const cost = CostTracker.calculateCost(
  { inputTokens: 1000, outputTokens: 2000, totalTokens: 3000 },
  'claude-sonnet-4-20250514'
);
console.log('Cost:', CostTracker.formatCost(cost)); // "$0.0450"

// Get user's current usage
const usage = await CostTracker.getCurrentUsage('user_789');
console.log(`Used ${usage.used}/${usage.limit} (${usage.percentUsed}%)`);

// Get monthly analytics
const analytics = await CostTracker.getMonthlyAnalytics('user_789', 2024, 12);
console.log('Total cost:', analytics.summary.totalCost);
console.log('By type:', analytics.byType);
```

### Model Pricing (as of December 2024)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|----------------------|
| Claude Sonnet 4.5 | $3.00 | $15.00 |
| Claude Sonnet 3.5 | $3.00 | $15.00 |
| Claude Haiku 3.5 | $0.80 | $4.00 |

## Context Building

```typescript
import { buildGenerationContext, formatContextAsMarkdown } from '@/lib/ai';

// Build context from project data
const context = buildGenerationContext(
  project,
  feature,
  memories,
  decisions,
  existingFiles
);

// Format as markdown for Claude
const markdown = formatContextAsMarkdown(context);

// Optimize context (filter relevant memories/decisions)
const optimized = optimizeContext(context);

// Compress if too large
const compressed = compressContext(context);
```

## Error Handling

```typescript
import {
  AIError,
  RateLimitError,
  ContextTooLargeError,
  AuthenticationError,
  NetworkError
} from '@/lib/ai';

try {
  const response = await client.generateCode(params);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limited. Retry after:', error.retryAfter);
  } else if (error instanceof ContextTooLargeError) {
    console.log('Context too large:', error.tokenCount, 'tokens');
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof NetworkError) {
    console.log('Network error, retrying...');
  } else if (error instanceof AIError) {
    console.log('AI error:', error.message, error.code);
  }
}
```

## Streaming Handler

For advanced use cases with custom streaming logic:

```typescript
import { createStreamingHandler } from '@/lib/ai';

const handler = createStreamingHandler({
  onFileStart: (data) => {
    console.log('Starting file:', data.path);
  },
  onContentChunk: (data) => {
    console.log('Chunk:', data.chunk);
  },
  onFileComplete: (file) => {
    console.log('Completed file:', file.path);
    console.log('Content length:', file.content.length);
  },
  onExplanation: (data) => {
    console.log('Explanation:', data.text);
  },
  onDone: (data) => {
    console.log('All done!');
    console.log('Total files:', data.files.length);
  },
  onError: (error) => {
    console.error('Streaming error:', error);
  },
});

// Feed chunks to handler
for await (const chunk of stream) {
  handler.processChunk(chunk);
}

handler.finalize();
```

## Feature Prompts

Pre-built prompts for common feature types:

- **Authentication** - Complete auth system (login, register, reset, etc.)
- **CRUD** - Full CRUD with validation, pagination, search
- **Dashboard** - Analytics dashboard with charts and metrics
- **Payment** - Stripe integration with subscriptions
- **API** - RESTful or tRPC endpoints
- **File Upload** - Upload system with cloud storage
- **Search** - Full-text search with filters
- **Notifications** - In-app and email notifications

```typescript
import { getFeaturePrompt } from '@/lib/ai';

const prompt = getFeaturePrompt('authentication');
// Returns comprehensive prompt with all requirements
```

## Configuration

### Model Selection

```typescript
import { ClaudeClient, CLAUDE_MODELS } from '@/lib/ai';

// Use Sonnet 4.5 (default)
const client = new ClaudeClient(undefined, CLAUDE_MODELS.SONNET_4_5);

// Use Haiku for faster/cheaper responses
const fastClient = new ClaudeClient(undefined, CLAUDE_MODELS.HAIKU_3_5);
```

### Retry Configuration

```typescript
// Default: 3 retries with exponential backoff
const client = new ClaudeClient(undefined, undefined, 3);

// Disable retries
const noRetryClient = new ClaudeClient(undefined, undefined, 0);
```

## Database Integration

All AI interactions are automatically tracked in the database:

```typescript
// Automatically logged:
// - User ID
// - Project ID
// - Interaction type
// - Prompt and response
// - Tokens used
// - Model used
// - Estimated cost
// - Timestamp
```

Query interactions:

```sql
-- Get recent interactions
SELECT * FROM "AIInteraction"
WHERE "userId" = 'user_789'
ORDER BY "createdAt" DESC
LIMIT 10;

-- Get total cost for project
SELECT SUM("estimatedCost") as total_cost
FROM "AIInteraction"
WHERE "projectId" = 'proj_123';
```

## Best Practices

1. **Always specify production mode** based on your needs
2. **Use streaming for long-running operations** to improve UX
3. **Handle errors gracefully** with proper error types
4. **Monitor costs** regularly using CostTracker
5. **Optimize context** to reduce token usage
6. **Set appropriate rate limits** to prevent abuse
7. **Cache responses** where appropriate
8. **Use feature prompts** for common patterns

## Testing

```typescript
// Mock the client for testing
jest.mock('@/lib/ai', () => ({
  ClaudeClient: jest.fn().mockImplementation(() => ({
    generateCode: jest.fn().mockResolvedValue({
      files: [],
      explanation: 'Test explanation',
      tokensUsed: { inputTokens: 100, outputTokens: 200, totalTokens: 300 },
      estimatedCost: 0.01,
    }),
  })),
}));
```

## Performance Tips

1. **Use context optimization** for large projects
2. **Stream responses** for better perceived performance
3. **Cache expensive operations** (context building)
4. **Use Haiku model** for simple operations
5. **Batch similar requests** when possible
6. **Monitor token usage** to optimize prompts

## Security Considerations

1. **Never expose API keys** in client-side code
2. **Validate user input** before sending to Claude
3. **Check user quotas** before making requests
4. **Sanitize AI responses** before displaying
5. **Implement rate limiting** per user
6. **Log all interactions** for audit trail
7. **Encrypt sensitive data** in database

## Troubleshooting

### "API key invalid"
- Check `ANTHROPIC_API_KEY` environment variable
- Verify key is active in Anthropic dashboard

### "Quota exceeded"
- User has hit their monthly limit
- Upgrade user's plan or wait for reset

### "Context too large"
- Use `compressContext()` to reduce size
- Remove non-essential context
- Split into multiple requests

### "Rate limit exceeded"
- Client automatically retries with backoff
- Consider upgrading Anthropic plan
- Implement request queuing

## Support

For issues or questions:
- Check this documentation
- Review error messages (they're descriptive!)
- Check Anthropic API status
- Review logs in database (`AIInteraction` table)

## License

Internal use only - FORGE AI Integration Layer
