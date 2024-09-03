## Deployed Url : https://e-commerce-backend-sepia-seven.vercel.app/

## Features

- **Cron Job for Auto Delivery**: Automates delivery processes based on predefined schedules.
- **Environment-Specific Configuration**:
  - When running in development mode, the `vercel.json` configuration file is ignored.
- **User and Employee Accounts**:
  - **User**: Can create an account, add products to the cart, and place orders.
  - **Employee**: Can create an account, upload images and products for sale, and use the search feature with filters.
- **Search with Filter**: Available to both users and employees for finding products.
- **No Money Transactions**: The application handles orders and carts but does not process payments.

## Environment Variables

### Basic Settings
- **NODE_ENV**: `production` or `development`

### CORS Configuration
- **ALLOWED_ORIGINS**: Comma-separated list of allowed origins for cross-origin requests.

### Database Configuration
- **DATABASE_URI**: Connection URI for the database.

### Security Tokens
- **REFRESH_TOKEN_SECRET**: Secret key used to sign refresh tokens.
- **ACCESS_TOKEN_SECRET**: Secret key used to sign access tokens.

### Cloudinary Configuration
- **CLOUDINARY_CLOUD_NAME**: Your Cloudinary cloud name.
- **CLOUDINARY_API_KEY**: Your Cloudinary API key.
- **CLOUDINARY_API_SECRET**: Your Cloudinary API secret.
- **CLOUDINARY_URL**: URL for accessing Cloudinary services.

## Notes
- Ensure all sensitive information (e.g., secrets and API keys) is kept secure and not exposed in public repositories.
- The `vercel.json` file is ignored during development to facilitate easier local testing.

## Additional Information
- The application uses Node.js and Express for server-side logic and functionality.
