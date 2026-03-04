# Samvad Test Suite Documentation

## Overview

The test suite covers all layers of the Samvad MERN application:

| Category | Framework | Tests | Location |
|---|---|---|---|
| Backend Unit Tests | Jest 30 | 60 | `Backend/tests/unit/` |
| API Integration Tests | Jest + Supertest | 34 | `Backend/tests/integration/` |
| Socket.io Event Tests | Jest + socket.io-client | 14 | `Backend/tests/integration/socket.test.js` |
| React Component Tests | Vitest + Testing Library | 72 | `Frontend/src/tests/` |
| E2E Tests | Playwright | 17 | `Frontend/e2e/` |

**Total: 180 automated tests**

---

## Quick Start

### Backend Tests

```bash
cd Backend

# Run all backend tests (unit + integration)
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run with coverage report
npm run test:coverage
```

### Frontend Tests

```bash
cd Frontend

# Run all component/unit tests once
npm test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
cd Frontend

# Run E2E tests (requires backend + frontend running)
npm run test:e2e

# Run with interactive Playwright UI
npm run test:e2e:ui
```

> **Note:** E2E tests require the full app running. Start the backend (`cd Backend && npm start`) and frontend (`cd Frontend && npm run dev`) before running E2E tests.

---

## Test Structure

### Backend (`Backend/tests/`)

```
tests/
├── setup.js                          # Shared setup (MongoMemoryServer)
├── unit/
│   ├── authSocket.test.js            # Auth middleware for Socket.io
│   ├── catchAsync.test.js            # Error-handling wrapper utility
│   ├── conversationMessageModel.test.js  # Conversation & Message schemas
│   ├── messageHandlers.test.js       # Socket message handlers
│   ├── otpTemplate.test.js           # OTP email HTML template
│   ├── socketHandlers.test.js        # Connection/disconnect/typing handlers
│   └── userModel.test.js            # User model, hashing, validation
└── integration/
    ├── auth.test.js                  # Signup, login, OTP verify, middleware
    ├── chat.test.js                  # Message retrieval, file upload routes
    ├── socket.test.js                # Full Socket.io lifecycle tests
    └── user.test.js                  # User CRUD, conversations, password update
```

### Frontend (`Frontend/src/tests/`)

```
src/tests/
├── setup.js                          # Global mocks (matchMedia, localStorage)
├── helpers/
│   └── renderWithProviders.jsx       # Test helper with Redux + Router
├── components/
│   ├── ChatHeader.test.jsx           # Chat header, online status, call buttons
│   ├── Layout.test.jsx              # App layout with sidebar + outlet
│   ├── Login.test.jsx               # Login page form & validation
│   ├── Logo.test.jsx                # Brand logo component
│   ├── ProfilePage.test.jsx         # Profile page tab navigation
│   ├── Protect.test.jsx             # Auth route protection
│   └── Signup.test.jsx              # Signup page form & validation
├── redux/
│   ├── appSlice.test.js             # App state modals (gif, audio, media)
│   ├── authSlice.test.js            # Auth state management
│   ├── chatSlice.test.js            # Chat typing indicators, online status
│   ├── store.test.js                # Redux store initialization
│   └── userSlice.test.js            # User messages, status updates
└── utils/
    ├── authToken.test.js            # JWT sanitization & validation
    ├── extractLinks.test.js         # URL extraction utility
    └── networkConfig.test.js        # Backend URL & WebRTC config
```

### E2E (`Frontend/e2e/`)

```
e2e/
├── auth.spec.js                      # Login/signup page flows
└── navigation.spec.js               # App navigation, branding, OTP page
```

---

## What Each Test Covers

### Backend Unit Tests (60 tests)

- **User Model**: Schema validation (required fields, email uniqueness, status enum), password hashing with bcrypt, OTP hashing, `correctPassword()`, `correctOTP()`, `changedPasswordAfter()` instance methods
- **Conversation & Message Models**: Schema creation, participant population, message types (text, media, audio, document, giphy), validation of media type enum
- **Auth Socket Middleware**: Valid/invalid/expired/missing JWT token handling
- **Socket Handlers**: User connection (online status broadcast), disconnect (offline cleanup), typing indicators (start/stop relay), message creation/emission, chat history retrieval
- **Utilities**: catchAsync error forwarding, OTP email template generation

### API Integration Tests (34 tests)

- **Auth Routes**: User signup, duplicate email rejection, login (success/failure cases), OTP verification (correct/expired/wrong), OTP resend, auth middleware protection
- **User Routes**: Get current user, get specific user, update profile, update password, list users, create/retrieve conversations
- **Chat Routes**: Authenticated message retrieval, file upload auth requirements

### Socket.io Event Tests (14 tests)

- **Connection**: Valid/invalid/missing token authentication
- **Messaging**: `new-message` event creation & acknowledgment, chat history fetch
- **Typing**: `start-typing` / `stop-typing` relay between users
- **WebRTC**: `call:initiate`, `call:answer`, `call:end`, `call:reject` signal relay
- **Disconnect**: User goes offline properly

### React Component Tests (72 tests)

- **Redux Slices**: Store initialization, modal toggles, typing indicators, online status, message accumulation, state reset
- **Utilities**: JWT token sanitization, bearer header creation, backend URL resolution, WebRTC ICE server config
- **Components**: Logo rendering, auth route protection with redirect, profile page tab switching, layout structure, login/signup form rendering & validation, chat header display with online status & call buttons

### E2E Tests (17 tests)

- Login/signup page rendering, form validation, page navigation, branding, OTP verification page, Google OAuth presence

---

## Key Design Decisions

1. **In-Memory MongoDB**: All database tests use `mongodb-memory-server` — no external databases needed
2. **Mocked Externals**: Mailer (nodemailer), Cloudinary storage, and Google Auth are mocked in tests
3. **Test Isolation**: Each test file creates its own MongoMemoryServer instance and cleans up after itself
4. **Render Helper**: `renderWithProviders()` wraps components with Redux store + React Router for consistent testing
5. **No Network Calls**: All API tests use Supertest (in-process), socket tests use real Socket.io server on random port

---

## Adding New Tests

### Backend

```js
// Backend/tests/unit/myFeature.test.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('My Feature', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

### Frontend

```jsx
// Frontend/src/tests/components/MyComponent.test.jsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

## Coverage

Run coverage reports:

```bash
# Backend coverage
cd Backend && npm run test:coverage

# Frontend coverage
cd Frontend && npm run test:coverage
```

Coverage reports are generated in:
- Backend: `Backend/coverage/` (lcov + text)
- Frontend: `Frontend/coverage/` (lcov + text)
