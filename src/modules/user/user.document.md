# User Service

## Overview
The User Service is responsible for managing users in the system, providing functionalities for creating, updating, and managing user information. This service utilizes a Bloom Filter to optimize performance when checking for the existence of wallet addresses.

## Structure

### Dependencies
- `UserRepository`: Access and manipulate user data
- `UserInternalWalletRepository`: Manage users' internal wallets
- `Logger`: System logging
- `BloomFilter`: Probabilistic data structure to check for element existence

### Key Methods

#### `initBloomFilter()`
- **Purpose**: Initialize the Bloom Filter with existing wallet addresses
- **Process**:
  1. Create a Bloom Filter with configured size and false positive rate
  2. Query all wallet addresses from the database
  3. Add each wallet address to the Bloom Filter
  4. Log initialization information

#### `createOrUpdateUser(request)`
- **Purpose**: Create a new user or update existing user information
- **Parameters**:
  - `walletAddress`: User's wallet address
  - `walletType`: Type of wallet
  - `referralCode`: Referral code (optional)
  - `email`: User's email (optional)
  - `name`: User's name (optional)
  - `avatar`: User's avatar (optional)
  - `hashedMnemonic`: Hashed mnemonic phrase (optional)
  - `isCreateWallet`: Flag to determine if a new wallet should be created
  - `googleAccessToken`: Google access token (optional)
  - `googleRefreshToken`: Google refresh token (optional)
- **Process**:
  1. Normalize the wallet address (convert to lowercase)
  2. Check if the wallet address exists using the Bloom Filter
  3. If the Bloom Filter indicates the address may exist, query the database to confirm
  4. If the user doesn't exist:
     - Generate a new referral code
     - Create a new user in the database
     - Add the wallet address to the Bloom Filter
     - Create an internal wallet if needed
     - Update referral information if provided
  5. If the user already exists:
     - Update referral information if needed
     - Update login count and last login date

#### `updateReferralCode(request)`
- **Purpose**: Update a user's referral code
- **Parameters**:
  - `userID`: ID of the user
  - `referralCode`: Referral code
- **Process**:
  1. Update the referred user's information
  2. Increment the referral count for the referrer
  3. Return success or failure result

## Performance Optimization
The service uses a Bloom Filter to reduce unnecessary database queries. A Bloom Filter is a probabilistic data structure that allows for quick checks to determine if an element might exist in a set.

- **Advantages**: Fast checking, memory efficient
- **Disadvantages**: Possibility of false positives, but never false negatives
- **Application**: Only query the database when the Bloom Filter indicates a wallet address might exist

## Error Handling
The service uses try-catch blocks to catch and handle errors, throwing HttpExceptions with appropriate status codes when necessary. 