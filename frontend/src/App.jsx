import Loader from './components/Loader';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { useRoutes } from './AppRouter';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const { ready, isAuthenticated } = useContext(AuthContext);
  const routes = useRoutes(isAuthenticated);
  
	if (!ready) return <Loader />

	return (
			<div className='App'>
				{ routes }
			</div>
	)
}

export default App;
