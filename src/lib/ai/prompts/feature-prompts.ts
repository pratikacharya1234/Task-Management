/**
 * FORGE Feature-Specific Prompts
 * Comprehensive prompts for common feature types
 * Each includes all necessary files (frontend, backend, database, tests)
 */

// ═══════════════════════════════════════════════════════════
// AUTHENTICATION FEATURE
// ═══════════════════════════════════════════════════════════

export const AUTH_FEATURE_PROMPT = `Generate a COMPLETE authentication system with the following:

REQUIRED FEATURES:
- User registration with email/password
- Email verification flow
- Login/logout functionality
- Password reset flow
- Session management
- Protected routes
- Role-based access control (if specified in requirements)

FILES TO GENERATE:

Frontend (React/Next.js):
1. Login form component (with validation)
2. Registration form component
3. Password reset request form
4. Password reset confirmation form
5. Email verification page
6. Auth context/provider for global auth state
7. Protected route wrapper/HOC
8. Auth hooks (useAuth, useUser, useSession)

Backend (tRPC/API Routes):
1. Auth router with procedures:
   - register
   - login
   - logout
   - verifyEmail
   - requestPasswordReset
   - resetPassword
   - getCurrentUser
   - updateProfile
2. Auth middleware for protected routes
3. Session management utilities
4. Password hashing utilities (bcrypt)
5. JWT token utilities (if using JWT)
6. Email service for verification/reset emails

Database (Prisma):
1. User model updates (if needed)
2. VerificationToken model
3. PasswordResetToken model
4. Session model (if using session-based auth)

Tests:
1. Auth flow integration tests
2. Registration validation tests
3. Login/logout tests
4. Password reset flow tests
5. Protected route tests

Validation (Zod):
1. Registration schema
2. Login schema
3. Password reset schemas
4. Profile update schema

SECURITY REQUIREMENTS:
- Password hashing with bcrypt (12 rounds minimum)
- Secure session tokens (httpOnly, secure, sameSite)
- Rate limiting on auth endpoints
- CSRF protection
- Email verification required before full access
- Password strength requirements (min 8 chars, mixed case, numbers)
- Account lockout after failed attempts
- Secure password reset tokens (expire in 1 hour)

Use the project's tech stack and follow established patterns.`;

// ═══════════════════════════════════════════════════════════
// CRUD FEATURE
// ═══════════════════════════════════════════════════════════

export const CRUD_FEATURE_PROMPT = `Generate a COMPLETE CRUD system for the specified resource with the following:

REQUIRED FEATURES:
- Create: Form to add new records
- Read: List view with pagination/filtering
- Update: Edit form for existing records
- Delete: Soft delete with confirmation
- Search and filtering
- Sorting
- Validation

FILES TO GENERATE:

Frontend (React/Next.js):
1. List page component (with table/cards)
2. Create form component
3. Edit form component
4. Detail view component
5. Delete confirmation modal
6. Search/filter component
7. Pagination component (if not already exists)
8. Custom hooks (useResourceList, useResource, useResourceMutations)

Backend (tRPC/API Routes):
1. Resource router with procedures:
   - list (with pagination, filtering, sorting)
   - getById
   - create
   - update
   - delete (soft delete)
   - search
2. Input validation schemas
3. Authorization checks (can user access this resource?)
4. Business logic services

Database (Prisma):
1. Resource model with fields from requirements
2. Relationships to other models
3. Soft delete fields (deletedAt)
4. Indexes for common queries
5. Migration file

Tests:
1. CRUD operation tests
2. Validation tests
3. Authorization tests
4. Edge case tests (duplicate records, not found, etc.)

Validation (Zod):
1. Create schema
2. Update schema (partial)
3. Query schema (filters, pagination)

FEATURES TO INCLUDE:
- Optimistic updates on frontend
- Loading states
- Error handling with user-friendly messages
- Form validation (client + server)
- Confirmation before destructive actions
- Success notifications
- Empty states
- Accessibility (semantic HTML, ARIA labels, keyboard navigation)

Use the project's tech stack and follow established patterns.`;

// ═══════════════════════════════════════════════════════════
// DASHBOARD FEATURE
// ═══════════════════════════════════════════════════════════

export const DASHBOARD_FEATURE_PROMPT = `Generate a COMPLETE analytics dashboard with the following:

REQUIRED FEATURES:
- Key metrics display (cards/widgets)
- Charts and visualizations
- Data filtering (date range, categories, etc.)
- Real-time updates (if specified)
- Export functionality (CSV/PDF)
- Responsive layout

FILES TO GENERATE:

Frontend (React/Next.js):
1. Dashboard page component (layout)
2. Metric card components (KPIs)
3. Chart components (line, bar, pie, etc.)
4. Filter panel component
5. Date range picker
6. Export button component
7. Dashboard hooks (useDashboardData, useMetrics)
8. Chart utilities and formatters

Backend (tRPC/API Routes):
1. Dashboard router with procedures:
   - getMetrics (aggregated data)
   - getChartData (time series data)
   - getRecentActivity
   - exportData
2. Analytics service (data aggregation logic)
3. Query optimization for large datasets
4. Caching layer for expensive queries

Database (Prisma):
1. Aggregation queries
2. Indexes for analytics queries
3. Materialized views (if needed)

Charts (Use a library like Recharts or Chart.js):
1. Line chart for trends
2. Bar chart for comparisons
3. Pie chart for distributions
4. Area chart for cumulative data
5. Custom tooltips and legends

Tests:
1. Dashboard data calculation tests
2. Chart rendering tests
3. Filter functionality tests
4. Export functionality tests

FEATURES TO INCLUDE:
- Skeleton loading states
- Empty states with helpful messages
- Error boundaries
- Responsive grid layout
- Accessible charts (data tables as fallback)
- Date range presets (Today, Last 7 days, Last 30 days, etc.)
- Metric comparisons (vs previous period)
- Drill-down capability (click for details)

PERFORMANCE:
- Lazy load charts
- Debounce filter changes
- Cache expensive queries
- Paginate large datasets
- Use React.memo for chart components

Use the project's tech stack and follow established patterns.`;

// ═══════════════════════════════════════════════════════════
// PAYMENT INTEGRATION FEATURE
// ═══════════════════════════════════════════════════════════

export const PAYMENT_FEATURE_PROMPT = `Generate a COMPLETE payment integration system (Stripe) with the following:

REQUIRED FEATURES:
- Payment method management (add, remove cards)
- One-time payments
- Subscription management (if specified)
- Payment history
- Invoices/receipts
- Refunds (admin)
- Webhooks for payment events

FILES TO GENERATE:

Frontend (React/Next.js):
1. Payment form component (Stripe Elements)
2. Payment methods list
3. Add payment method modal
4. Payment history table
5. Invoice viewer/downloader
6. Subscription management page (if applicable)
7. Payment hooks (usePaymentMethods, usePaymentIntent)

Backend (tRPC/API Routes):
1. Payment router with procedures:
   - createPaymentIntent
   - confirmPayment
   - addPaymentMethod
   - removePaymentMethod
   - getPaymentMethods
   - getPaymentHistory
   - createSubscription (if applicable)
   - cancelSubscription (if applicable)
   - refundPayment (admin)
2. Stripe webhook handler (verified signatures)
3. Payment service (business logic)
4. Invoice generation service

Database (Prisma):
1. Payment model
2. PaymentMethod model
3. Subscription model (if applicable)
4. Invoice model
5. WebhookEvent model (for idempotency)

Webhooks:
1. payment_intent.succeeded
2. payment_intent.failed
3. payment_method.attached
4. payment_method.detached
5. customer.subscription.created (if applicable)
6. customer.subscription.updated (if applicable)
7. customer.subscription.deleted (if applicable)

Tests:
1. Payment flow tests (mock Stripe)
2. Webhook handling tests
3. Subscription lifecycle tests (if applicable)
4. Error scenario tests (card declined, etc.)

Security:
1. Verify webhook signatures
2. Use Stripe's test mode in development
3. Never store card numbers (use Stripe tokens)
4. PCI compliance considerations
5. Idempotent webhook processing

FEATURES TO INCLUDE:
- 3D Secure support (SCA compliance)
- Error handling for common payment errors
- Retry failed payments
- Customer portal for self-service
- Email notifications (payment confirmation, failure, refund)
- Strong Customer Authentication (SCA) for European customers
- Payment method validation before charge
- Loading states during payment processing
- Clear error messages for declined cards

STRIPE SETUP:
- Stripe SDK initialization
- Environment variables for API keys
- Test mode vs production mode handling
- Webhook endpoint registration

Use the project's tech stack and follow established patterns.`;

// ═══════════════════════════════════════════════════════════
// API ENDPOINTS FEATURE
// ═══════════════════════════════════════════════════════════

export const API_FEATURE_PROMPT = `Generate a COMPLETE API endpoint system with the following:

REQUIRED FEATURES:
- RESTful endpoints or tRPC procedures
- Input validation
- Authentication/authorization
- Rate limiting
- Error handling
- API documentation
- Versioning (if specified)

FILES TO GENERATE:

Backend (tRPC or REST):
1. Router/controller with endpoints for specified operations
2. Input validation schemas (Zod)
3. Output schemas/types
4. Business logic services
5. Data access layer (repositories)
6. Middleware (auth, rate limiting, logging)
7. Error handlers

Database (Prisma):
1. Required models and relationships
2. Indexes for query optimization
3. Migrations

Documentation:
1. API documentation (TSDoc comments)
2. Example requests/responses
3. Error codes documentation

Tests:
1. Integration tests for each endpoint
2. Input validation tests
3. Authorization tests
4. Error scenario tests
5. Rate limiting tests

Security:
1. Input sanitization
2. SQL injection prevention (use ORMs)
3. Authentication checks
4. Authorization checks (role-based or resource-based)
5. Rate limiting per endpoint
6. CORS configuration
7. Request size limits

ENDPOINTS TO INCLUDE (based on requirements):
- List resources (GET with pagination, filtering, sorting)
- Get single resource (GET by ID)
- Create resource (POST)
- Update resource (PUT/PATCH)
- Delete resource (DELETE)
- Bulk operations (if specified)
- Custom business operations

ERROR HANDLING:
- Standardized error responses
- Proper HTTP status codes
- Error logging
- User-friendly error messages
- Detailed logs for debugging (no sensitive data)

FEATURES TO INCLUDE:
- Request/response logging
- Performance monitoring
- API versioning (if needed)
- Pagination metadata (total, page, pageSize)
- Sorting and filtering options
- Field selection (sparse fieldsets)
- Include related resources (if specified)
- Idempotency keys for POST/PUT
- ETag support for caching
- Compression (gzip)

Use the project's tech stack and follow established patterns.`;

// ═══════════════════════════════════════════════════════════
// FILE UPLOAD FEATURE
// ═══════════════════════════════════════════════════════════

export const FILE_UPLOAD_FEATURE_PROMPT = `Generate a COMPLETE file upload system with the following:

REQUIRED FEATURES:
- File upload (single/multiple)
- File type validation
- File size limits
- Progress tracking
- Preview before upload
- File management (list, delete)
- Cloud storage integration (S3, Uploadthing, etc.)

FILES TO GENERATE:

Frontend (React/Next.js):
1. File upload component (drag & drop)
2. File preview component
3. Upload progress indicator
4. File list component
5. File management page
6. Upload hooks (useFileUpload, useFileList)

Backend (tRPC/API Routes):
1. Upload router with procedures:
   - getUploadUrl (presigned URL)
   - confirmUpload
   - listFiles
   - deleteFile
   - getFileUrl (presigned download URL)
2. File validation service
3. Storage service (S3/Uploadthing integration)
4. Image processing (if specified - resize, optimize)

Database (Prisma):
1. File model with metadata
2. Relationship to owner (User/Project/etc.)

Tests:
1. Upload flow tests
2. Validation tests (file type, size)
3. File management tests
4. Access control tests

Security:
1. Validate file types (MIME type + extension)
2. Scan for malware (if specified)
3. Access control (who can view/delete files)
4. Presigned URLs with expiration
5. File size limits
6. Rate limiting on uploads

FEATURES TO INCLUDE:
- Drag and drop interface
- Multiple file selection
- Upload queue
- Retry failed uploads
- Cancel uploads
- Image preview/thumbnails
- File type icons
- Download functionality
- Copy link to clipboard
- Accessibility (keyboard navigation, screen reader support)

FILE TYPES TO SUPPORT (based on requirements):
- Images (JPEG, PNG, GIF, WebP)
- Documents (PDF, DOCX, XLSX)
- Videos (MP4, MOV)
- Audio (MP3, WAV)
- Archives (ZIP)

OPTIMIZATIONS:
- Client-side image compression
- Chunked uploads for large files
- Resume interrupted uploads
- CDN for file delivery
- Lazy loading thumbnails

Use the project's tech stack and follow established patterns.`;

// ═══════════════════════════════════════════════════════════
// SEARCH FEATURE
// ═══════════════════════════════════════════════════════════

export const SEARCH_FEATURE_PROMPT = `Generate a COMPLETE search system with the following:

REQUIRED FEATURES:
- Full-text search
- Faceted search/filters
- Search suggestions/autocomplete
- Search history
- Highlighting of search terms
- Sorting and pagination

FILES TO GENERATE:

Frontend (React/Next.js):
1. Search input component (with autocomplete)
2. Search results page
3. Filter panel component
4. Result item component (with highlighting)
5. Search suggestions dropdown
6. Search hooks (useSearch, useSearchSuggestions)

Backend (tRPC/API Routes):
1. Search router with procedures:
   - search (full-text)
   - getSuggestions
   - getFilters
   - saveSearchHistory
   - getSearchHistory
2. Search service (query building)
3. Indexing service (if using search engine)

Database (Prisma):
1. Full-text search indexes
2. SearchHistory model (optional)
3. Search optimization queries

Search Engine (optional - Elasticsearch, Algolia):
1. Index configuration
2. Search query builders
3. Sync service (keep search index updated)

Tests:
1. Search query tests
2. Suggestion tests
3. Filter tests
4. Pagination tests
5. Relevance tests

FEATURES TO INCLUDE:
- Debounced search input
- Search as you type
- Keyboard navigation (arrow keys, enter)
- Highlight search terms in results
- "Did you mean?" suggestions
- No results state with suggestions
- Loading skeleton
- Search analytics (track popular searches)
- Filters with counts
- Clear all filters button
- Sort by relevance, date, name, etc.

SEARCH CAPABILITIES:
- Exact match
- Partial match
- Fuzzy matching (typo tolerance)
- Boolean operators (AND, OR, NOT)
- Phrase search ("exact phrase")
- Wildcard search (prefix*)
- Multi-field search

PERFORMANCE:
- Database full-text search indexes
- Query caching
- Debounce user input
- Limit results per page
- Background indexing

Use the project's tech stack and follow established patterns.`;

// ═══════════════════════════════════════════════════════════
// NOTIFICATION FEATURE
// ═══════════════════════════════════════════════════════════

export const NOTIFICATION_FEATURE_PROMPT = `Generate a COMPLETE notification system with the following:

REQUIRED FEATURES:
- In-app notifications
- Email notifications (optional)
- Push notifications (optional)
- Notification preferences
- Mark as read/unread
- Notification history
- Real-time updates

FILES TO GENERATE:

Frontend (React/Next.js):
1. Notification bell/icon component
2. Notification dropdown/panel
3. Notification list page
4. Notification item component
5. Notification preferences page
6. Notification hooks (useNotifications, useUnreadCount)
7. Real-time listener (WebSocket/Polling)

Backend (tRPC/API Routes):
1. Notification router with procedures:
   - getNotifications (paginated)
   - getUnreadCount
   - markAsRead
   - markAllAsRead
   - deleteNotification
   - updatePreferences
   - getPreferences
2. Notification service (create, send)
3. Email service (if email notifications)
4. Push notification service (if push notifications)
5. WebSocket handler (if real-time)

Database (Prisma):
1. Notification model
2. NotificationPreferences model
3. Indexes for queries

Background Jobs:
1. Send email notifications (queue)
2. Clean up old notifications
3. Batch notification sending

Tests:
1. Notification creation tests
2. Delivery tests
3. Preference tests
4. Real-time update tests

NOTIFICATION TYPES (based on requirements):
- Info
- Success
- Warning
- Error
- System announcements

FEATURES TO INCLUDE:
- Unread indicator (badge with count)
- Group similar notifications
- Time formatting (relative: "2 hours ago")
- Action buttons (approve, view, dismiss)
- Infinite scroll for notification list
- Empty state
- Loading states
- Error boundaries
- Real-time updates (WebSocket or polling)
- Sound/visual notification (optional)
- Browser notifications (if permitted)

NOTIFICATION PREFERENCES:
- Enable/disable per notification type
- Email vs in-app preference
- Frequency (instant, daily digest, weekly digest)
- Quiet hours

PERFORMANCE:
- Lazy load notifications
- Cache unread count
- Batch mark as read operations
- Efficient real-time updates

Use the project's tech stack and follow established patterns.`;

// ═══════════════════════════════════════════════════════════
// PROMPT SELECTOR
// ═══════════════════════════════════════════════════════════

export function getFeaturePrompt(featureCategory: string): string | null {
  const prompts: Record<string, string> = {
    'authentication': AUTH_FEATURE_PROMPT,
    'auth': AUTH_FEATURE_PROMPT,
    'crud': CRUD_FEATURE_PROMPT,
    'dashboard': DASHBOARD_FEATURE_PROMPT,
    'analytics': DASHBOARD_FEATURE_PROMPT,
    'payment': PAYMENT_FEATURE_PROMPT,
    'payments': PAYMENT_FEATURE_PROMPT,
    'stripe': PAYMENT_FEATURE_PROMPT,
    'api': API_FEATURE_PROMPT,
    'endpoints': API_FEATURE_PROMPT,
    'upload': FILE_UPLOAD_FEATURE_PROMPT,
    'file-upload': FILE_UPLOAD_FEATURE_PROMPT,
    'search': SEARCH_FEATURE_PROMPT,
    'notification': NOTIFICATION_FEATURE_PROMPT,
    'notifications': NOTIFICATION_FEATURE_PROMPT,
  };

  return prompts[featureCategory.toLowerCase()] || null;
}

// ═══════════════════════════════════════════════════════════
// CUSTOM FEATURE PROMPT
// ═══════════════════════════════════════════════════════════

export const CUSTOM_FEATURE_PROMPT = `Generate a COMPLETE implementation for the specified feature.

Based on the feature requirements, include:

Frontend:
- All necessary components (forms, displays, modals)
- Custom hooks for data fetching and state management
- Form validation
- Loading and error states
- Responsive design
- Accessibility features

Backend:
- API routes or tRPC procedures
- Input validation (Zod schemas)
- Business logic services
- Data access layer
- Authentication/authorization checks
- Error handling

Database:
- Prisma models and relationships
- Indexes for performance
- Migrations

Tests:
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for UI

Security:
- Input validation and sanitization
- Authentication checks
- Authorization rules
- Rate limiting (if applicable)

Follow the project's established patterns and tech stack.
Generate ALL files needed for a complete, working implementation.`;
