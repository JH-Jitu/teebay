# Teebay Mobile App

A React Native mobile application for product renting and buying/selling, built with Expo and integrated with a Django backend.

## Features

- 🔐 **Biometric Authentication** - Fingerprint/FaceID login support
- 📱 **Product Management** - Create, edit, delete products with multi-step forms
- 🛒 **Transaction System** - Buy and rent products with flexible rental periods
- 🔔 **Push Notifications** - Real-time notifications for transactions
- 🎨 **Modern UI** - Clean, responsive design with dark/light theme support
- ⚡ **Performance Optimized** - Handles large datasets efficiently

## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Python 3.12+ (for backend)
- Android Studio (for Android development)
- Expo CLI
- Git

## Setup Instructions

### 1. Backend Setup

First, clone and set up the Django backend:

```bash
# Clone the backend repository
git clone https://github.com/SazimAssessments/teebay-django-backend-mobile-dev-assessment
cd teebay-django-backend-mobile-dev-assessment

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py makemigrations users
python manage.py makemigrations products
python manage.py makemigrations transactions
python manage.py migrate

# Set up Firebase Admin SDK credentials
# Copy the JSON contents from the provided Firebase credentials
# to: teebay_django_backend_mobile_dev_assessment/teebay-mobile-assesment-firebase-adminsdk.json

# Run the server (for local testing)
python manage.py runserver

# Run the server (for mobile device testing)
python manage.py runserver 0.0.0.0:8000
```

**Important**: For mobile device testing, use `0.0.0.0:8000` to make the server accessible from your mobile device. Replace `127.0.0.1` with your computer's IP address in the mobile app configuration.

### 2. Mobile App Setup

Clone and set up the React Native app:

```bash
# Clone the mobile app repository
git clone https://github.com/JH-Jitu/teebay
cd teebay

# Install dependencies
pnpm install
# or
npm install

# Start the development server
npx expo start
```

### 3. Development Build Installation

For full functionality including push notifications, install the development build:

#### Option 1: QR Code Installation

1. Scan the QR code below with your mobile device
2. Follow the installation prompts
3. Install the development profile

#### Option 2: Direct Link

Visit: [https://expo.dev/accounts/jh-jitu/projects/teebay/builds/61cd6044-edd6-4541-875a-3f89c221fd7a](https://expo.dev/accounts/jh-jitu/projects/teebay/builds/61cd6044-edd6-4541-875a-3f89c221fd7a)

**Note**: The development build is required for push notifications as Expo Go doesn't support FCM in local development.

### 4. Configuration

Update the API configuration in the mobile app:

1. Open `src/config/api.ts`
2. Update the `BASE_URL` to match your backend server:
   ```typescript
   export const API_CONFIG = {
     BASE_URL: "http://YOUR_IP_ADDRESS:8000", // Replace with your computer's IP
     // ... other config
   };
   ```

## Usage

### 1. User Registration & Authentication

1. **Register**: Create a new account with email and password
2. **Biometric Setup**: Enable fingerprint/FaceID authentication (optional)
3. **Login**: Use biometric authentication or manual login

### 2. Product Management

1. **Create Product**:

   - Navigate to the home screen
   - Tap the "+" button to create a new product
   - Complete the multi-step form:
     - Product details (title, description, condition)
     - Categories (select from predefined categories)
     - Pricing (purchase price, rent price, rent options)
     - Images (upload multiple photos)
     - Review and submit

2. **Edit Product**:

   - Go to your profile
   - Select "My Products"
   - Tap edit on any product you own

3. **Delete Product**:
   - From "My Products" section
   - Tap delete and confirm

### 3. Marketplace & Transactions

1. **Browse Products**:

   - View all products on the home screen
   - Use search, filters, and sorting options
   - Switch between grid and list views

2. **Buy/Rent Products**:

   - Tap on any product to view details
   - Choose "Buy" or "Rent" option
   - Confirm transaction details
   - Complete the transaction

3. **View Transaction History**:
   - Go to the "Explore" tab
   - Switch between "Purchases" and "Rentals"
   - View transaction details and status

### 4. Push Notifications

- Notifications are automatically sent when:
  - Someone buys your product
  - Someone rents your product
  - Transaction status changes
- Tap notifications to navigate to relevant product pages

## Project Structure

```
teebay/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   ├── auth/              # Authentication screens
│   ├── products/          # Product-related screens
│   └── transactions/      # Transaction screens
├── src/
│   ├── components/        # Reusable components
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Common UI components
│   │   ├── forms/        # Form components
│   │   └── product/      # Product-specific components
│   ├── config/           # App configuration
│   ├── constants/        # Constants and theme
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── assets/               # Static assets
└── docs/                 # Documentation
```

## Key Technologies

- **React Native** - Mobile app framework
- **Expo** - Development platform and tools
- **Expo Router** - File-based navigation
- **Zustand** - State management
- **TanStack Query** - Data fetching and caching
- **TypeScript** - Type safety
- **Firebase** - Push notifications
- **Expo LocalAuthentication** - Biometric authentication

## API Endpoints

The app integrates with the Django backend API:

- **Authentication**: `/api/auth/`
- **Products**: `/api/products/`
- **Transactions**: `/api/transactions/`
- **Users**: `/api/users/`

## Troubleshooting

### Common Issues

1. **Backend Connection Issues**:

   - Ensure backend is running on `0.0.0.0:8000`
   - Check firewall settings
   - Verify IP address in mobile app config

2. **Push Notifications Not Working**:

   - Ensure development build is installed
   - Check Firebase configuration
   - Verify device has internet connection

3. **Biometric Authentication Issues**:

   - Check device biometric settings
   - Ensure biometric data is enrolled
   - Try disabling and re-enabling in app settings

4. **Image Upload Failures**:
   - Check image file size and format
   - Ensure stable internet connection
   - Try compressing images before upload

### Development Tips

- Use `npx expo start --clear` to clear cache
- Check Metro bundler logs for detailed error messages
- Use React Native Debugger for debugging
- Test on both Android and iOS devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of a technical assessment and is not intended for commercial use.

## Support

For technical support or questions, please refer to the documentation or create an issue in the repository.

---

**Note**: This app is designed for demonstration purposes as part of a technical assessment. Ensure you have proper permissions and follow all applicable guidelines when testing with real data.
