# Auth Service

## Overview
The Auth Service is responsible for handling user authentication in the system, supporting both Web2 (email, Google OAuth) and Web3 (blockchain wallet) authentication methods. It manages login requests, session creation, and token generation.

## Structure

### Dependencies
- `JwtService`: For generating and validating JWT tokens
- `Web3AuthService`: Handles blockchain wallet authentication
- `Web2AuthService`: Handles email and OAuth authentication
- `UserService`: Manages user data
- `RedisService`: Manages session data and temporary storage

### Key Methods

#### `login(loginRequestDto)`
- **Purpose**: Process login requests for both Web2 and Web3 authentication
- **Parameters**:
  - `provider`: Authentication provider (WEB2 or WEB3)
  - `step`: Login step (REQUEST or VERIFY)
  - `type`: Login type (WEB3_EVM, WEB2_GOOGLE_OAUTH2, etc.)
  - `data`: Authentication data (varies by provider)
  - `referralCode`: Optional referral code
- **Process**:
  1. Route the request to the appropriate authentication service based on provider
  2. For REQUEST step: Generate and return authentication challenge
  3. For VERIFY step: Validate authentication response and create user session
  4. Generate JWT access token upon successful authentication
  5. Return authentication result with appropriate tokens

#### `generateAccessToken(payload)`
- **Purpose**: Create JWT access token for authenticated users
- **Parameters**:
  - `payload`: User authentication data including ID, wallet address, and session ID
- **Process**:
  1. Sign the payload using JWT with configured secret and expiration time
  2. Return the generated token

#### `generateSessionId(userId)`
- **Purpose**: Create and manage user sessions
- **Parameters**:
  - `userId`: ID of the authenticated user
- **Process**:
  1. Generate a unique session ID using UUID
  2. Store session data in Redis with timestamp
  3. Limit sessions per user (removing oldest if limit exceeded)
  4. Set appropriate TTL for session data
  5. Return the session ID

#### `logoutSession(userId, sessionId)`
- **Purpose**: End a user session
- **Parameters**:
  - `userId`: ID of the user
  - `sessionId`: ID of the session to terminate
- **Process**:
  1. Remove session data from Redis
  2. Return success response

#### `getUserSessions(userId)`
- **Purpose**: Retrieve all active sessions for a user
- **Parameters**:
  - `userId`: ID of the user
- **Process**:
  1. Fetch all session IDs from Redis
  2. Retrieve detailed session data for each ID
  3. Return formatted session information

## Bloom Filter Usage
The system does not use Bloom Filter for the login process since login users are typically already created users that require full user information retrieval from the database for authentication.

However, the system still adds wallet addresses and emails to the Bloom Filter to be used for actions that only need to check existence without requiring detailed user information. This helps optimize performance for simple existence checks.

## Performance Considerations
- The login process may be slow due to several factors:
  1. Multiple database queries during user verification
  2. External service calls for Web3 signature verification or OAuth validation
  3. Session management operations in Redis
  4. JWT token generation

## Optimization Opportunities
1. **Caching**: Implement caching for frequently accessed data
2. **Parallel Processing**: Use Promise.all for concurrent operations
3. **Reduce Database Queries**: Optimize database access patterns
4. **Session Management**: Streamline session creation and validation
5. **Logging Reduction**: Minimize excessive logging during authentication flow

## Error Handling
The service uses try-catch blocks to catch and handle errors, throwing HttpExceptions with appropriate status codes when necessary. 