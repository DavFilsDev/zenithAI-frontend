import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Spinner } from '../shared/ui/Spinner';
import { useSessionStore } from '../shared/auth/sessionStore';

const HomePage = lazy(() =>
  import('../features/home/pages/HomePage').then((module) => ({ default: module.HomePage })),
);

const ChatShell = lazy(() =>
  import('./ChatShell').then((module) => ({ default: module.ChatShell })),
);

const LoginPage = lazy(() =>
  import('../features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);

const RegisterPage = lazy(() =>
  import('../features/auth/pages/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  })),
);

const PrivacyPage = lazy(() =>
  import('../features/legal/pages/PrivacyPage').then((module) => ({
    default: module.PrivacyPage,
  })),
);

const TermsPage = lazy(() =>
  import('../features/legal/pages/TermsPage').then((module) => ({
    default: module.TermsPage,
  })),
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
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
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
