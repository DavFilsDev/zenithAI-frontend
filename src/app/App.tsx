import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers';
import { AppRoutes } from './router';
import { ErrorBoundary } from './ErrorBoundary';

const App = () => {
  return (
    <BrowserRouter>
      <AppProviders>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AppProviders>
    </BrowserRouter>
  );
};

export default App;
