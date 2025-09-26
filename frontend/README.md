# Frontend

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 6
- **Routing**: React Router 7
- **UI Components**: React Bootstrap
- **State Management**: React Context API
- **HTTP Client**: Built-in Fetch API
- **Development Tools**:
  - Concurrently for running frontend and backend simultaneously

## Project Structure

```
src/
├── assets/         # Static assets (images, fonts, etc.)
├── components/     # Reusable UI components
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── App.jsx         # Main application component
├── AppRouter.jsx   # Application routing configuration
└── main.jsx        # Application entry point
```

## Components

### Reusable Components
- `Navbar.jsx`: Main navigation bar component
- `PostCard.jsx`: Component for displaying post content
- `Loader.jsx`: Loading spinner component

### Pages
- `HomePage.jsx`: Main landing page
- `LoginPage.jsx`: User authentication page
- `RegisterPage.jsx`: User registration page
- `ProfilePage.jsx`: User profile management
- `CreatePage.jsx`: Post creation interface
- `BookmarksPage.jsx`: Saved posts/bookmarks page

## Custom Hooks

- `useAuth.js`: Authentication state management
- `useFetch.js`: Custom hook for making HTTP requests

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. To run both frontend and backend simultaneously:
   ```bash
   npm start
   ```

## Features

- User authentication and authorization
- Post creation and management
- User profile management
- Bookmarking system
- Responsive design using Bootstrap
- Toast notifications for user feedback
