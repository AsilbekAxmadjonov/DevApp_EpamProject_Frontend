import { Routes, Route, Navigate } from 'react-router';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import BookmarksPage from './pages/BookmarksPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

export const useRoutes = (isAuthenticated) => {
  console.log('AppRouter rendered with isAuthenticated:', isAuthenticated);

  if (isAuthenticated) {
    console.log('Rendering authenticated routes');
    return (
      <>
        <Navbar />
        <Routes>
          <Route
            path='/'
            element={
              <Navigate
                to='/home'
                replace={true}
              />
            }
          />
          <Route
            path='/home'
            element={<HomePage />}
          />
          <Route
            path='/create'
            element={<CreatePage />}
          />
          <Route
            path='/profile'
            element={<ProfilePage />}
          />
          <Route
            path='/bookmarks'
            element={<BookmarksPage />}
          />
          <Route
            path='*'
            element={<NotFoundPage />}
          />
        </Routes>
      </>
    );
	}

  console.log('Rendering guest routes');
	return (
		<Routes>
			<Route
				path='/'
				element={<LoginPage />}
			/>
			<Route
				path='/register'
				element={<RegisterPage />}
      />
      <Route path='*' element={<Navigate to='/'/>}/>
		</Routes>
	);
};
