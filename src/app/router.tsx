import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Spinner } from '../shared/ui/Spinner';
import { useSessionStore } from '../shared/auth/sessionStore';
import { ChatShell } from './ChatShell';

const HomePage = lazy(() =>
  import('../features/home/pages/HomePage').then((module) => ({ default: module.HomePage }))
);

const LoginPage = lazy(() =>
  import('../features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);

const RegisterPage = lazy(() =>
  import('../features/auth/pages/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  }))
);

const RequireAuth = () => {
  const status = useSessionStore((state) => state.status);

  if (status === 'loading') {
    return <Spinner />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const RedirectIfAuthenticated = () => {
  const status = useSessionStore((state) => state.status);

  if (status === 'loading') {
    return <Spinner />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/chat/:uuid?" element={<ChatShell />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
