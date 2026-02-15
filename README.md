# 13 STORE Mobile App

React Native mobile application for the 13 STORE sales team, built with Expo.

## Features

### ✅ Phase 1 (Complete)
- **Authentication**: Email/password and API key login with biometric support
- **Customer Management**: View, search customers with pagination
- **Deal Pipeline**: Track deals and sales opportunities
- **Dashboard**: Real-time sales metrics and KPIs
- **Secure Storage**: Encrypted credential storage with SecureStore

### ✅ Phase 2 (Complete)
- **Offline-First Architecture**: Work offline with automatic sync queue
- **Create Customers**: Full form with validation and offline support
- **Edit Customers**: Update customer details with offline queue
- **Create Deals**: Deal creation with stages and probability
- **Network Detection**: Automatic detection of online/offline status
- **Sync Queue**: Operations queued when offline, synced when online

### ✅ Phase 3 (Complete)
- **Background Sync**: Auto-sync when app returns to foreground
- **Network Status Banner**: Visual indicator of online/offline state
- **Edit Deals**: Full edit functionality with offline support
- **Sync Queue Viewer**: See pending operations in Profile screen
- **Manual Sync**: Trigger sync manually from Profile
- **App Lifecycle Management**: Proper initialization and cleanup

## Tech Stack

- **React Native** + **Expo SDK 52**
- **TypeScript** for type safety
- **Redux Toolkit** + **RTK Query** for state management and API integration
- **React Navigation** for navigation
- **React Native Paper** for Material Design UI components
- **Expo SecureStore** for secure credential storage
- **Expo LocalAuthentication** for biometric authentication
- **AsyncStorage** for offline sync queue
- **NetInfo** for network connectivity detection

## Project Structure

```
src/
├── config.ts              # App configuration
├── navigation/            # Navigation setup
│   └── index.tsx
├── screens/               # Screen components
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── CustomersScreen.tsx
│   ├── CustomerDetailScreen.tsx
│   ├── CreateCustomerScreen.tsx    # ✨ Phase 2
│   ├── EditCustomerScreen.tsx      # ✨ Phase 2
│   ├── DealsScreen.tsx
│   ├── DealDetailScreen.tsx
│   ├── CreateDealScreen.tsx        # ✨ Phase 2
│   ├── EditDealScreen.tsx          # ✨ Phase 3
│   └── ProfileScreen.tsx
├── services/              # Business logic
│   ├── auth.ts            # Authentication service
│   ├── api.ts             # RTK Query API
│   ├── syncQueue.ts       # Offline sync queue         # ✨ Phase 2
│   └── backgroundSync.ts  # Background sync service    # ✨ Phase 3
├── store/                 # Redux store
│   ├── index.ts           # Store configuration
│   ├── hooks.ts           # Typed hooks
│   ├── authSlice.ts       # Auth state slice
│   └── syncSlice.ts       # Sync queue slice           # ✨ Phase 2
├── types/                 # TypeScript types
│   ├── api.ts             # API types (matches API v1)
│   ├── auth.ts            # Auth types
│   └── sync.ts            # Sync queue types           # ✨ Phase 2
└── components/            # Reusable components
    ├── NetworkStatusBanner.tsx    # Network indicator  # ✨ Phase 3
    └── SyncStatusIndicator.tsx    # Sync status icon   # ✨ Phase 3
```

## Getting Started

### Prerequisites

- Node.js >= 20.19.4
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

### Running on Devices

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Expo Go App (on physical device)
# Scan QR code from `npx expo start`
```

## API Configuration

The app connects to the 13 STORE platform API v1:

- **Production**: `https://13store-platform.vercel.app/api/v1`
- **Development**: `http://localhost:3000/api/v1`

### Authentication Methods

1. **Email/Password**: Login with your platform credentials
2. **API Key**: Use an API key from the Developer Portal

To get an API key:
1. Login to the web platform
2. Go to Dashboard → Developer Portal
3. Generate a new API key with required scopes

## Features

### Authentication
- Email/password login
- API key authentication
- Biometric authentication (fingerprint/face)
- Secure credential storage
- Session persistence

### Dashboard
- Total customers overview
- Active deals count
- Pipeline value
- Key metrics and KPIs

### Customer Management
- List all customers with pagination
- Search customers
- View customer details
- Filter by status, type, potential
- Customer tags and metadata

### Deal Management
- List all deals with pagination
- Search deals
- View deal details
- Track deal stages and probability
- Expected close dates

### Profile & Settings
- User information
- Biometric toggle
- API configuration
- Logout

## Development

### Type Safety

All API types match the platform's API v1 models:
- `Customer`, `Deal`, `Product`, `Invoice`
- Filter types for each resource
- Pagination responses

### State Management

- **Redux Toolkit** for global state
- **RTK Query** for API caching and synchronization
- **Sync Queue** for offline operations
- Automatic cache invalidation on mutations
- Optimistic UI updates
- Network-aware sync

### API Integration

The app uses RTK Query endpoints:
- `useGetCustomersQuery`
- `useGetCustomerQuery`
- `useCreateCustomerMutation`
- `useUpdateCustomerMutation`
- `useDeleteCustomerMutation`
- Similar hooks for Deals, Products, Invoices

## Roadmap

### Phase 1 ✅ Complete (Week 1)
- ✅ Authentication with biometrics
- ✅ Customer list and details
- ✅ Deal list and details
- ✅ Dashboard with metrics
- ✅ API v1 integration
- ✅ Navigation structure

### Phase 2 ✅ Complete (Week 2)
- ✅ Offline sync queue with AsyncStorage
- ✅ Create customers (with offline support)
- ✅ Edit customers (with offline support)
- ✅ Create deals (with offline support)
- ✅ Network connectivity detection
- ✅ Automatic sync when online
- ✅ Form validation

### Phase 3 ✅ Complete (Week 3)
- ✅ Background sync service with app lifecycle
- ✅ Edit deals (with offline support)
- ✅ Network status banner (online/offline indicator)
- ✅ Sync queue viewer in Profile
- ✅ Manual sync trigger
- ✅ Sync status indicators

### Phase 4 (Future - Next Steps)
- [ ] GPS tracking for customer visits
- [ ] Push notifications with Expo
- [ ] Advanced search and filters
- [ ] Invoice management
- [ ] Product catalog
- [ ] Camera integration for photos
- [ ] File attachments
- [ ] Export reports to PDF/CSV
- [ ] Calendar integration
- [ ] Task management
- [ ] Offline data caching (SQLite)

## Testing

```bash
# Run type check
npx tsc --noEmit

# Run linter
npm run lint

# Run tests (when available)
npm test
```

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit
```

## Environment Variables

Create a `.env` file for local development:

```env
API_BASE_URL=http://localhost:3000/api/v1
WEB_BASE_URL=http://localhost:3000
```

## Contributing

1. Follow the codebase structure
2. Use TypeScript for all new files
3. Follow React Native best practices
4. Test on both iOS and Android
5. Update this README when adding features

## License

Proprietary - 13 STORE Platform

## Support

For issues or questions:
- Platform: https://13store-platform.vercel.app
- API Docs: https://13store-platform.vercel.app/dashboard/developer/docs
