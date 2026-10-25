import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { useEffect } from 'react';
import { useChatStore } from './store/chatStore';
import { Loader } from './components/ui/Loader';
import { Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const { hasSession, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (!hasSession) return <Navigate to="/login" replace />;
  return <Outlet />;
};

function AppContent() {
  const { hasSession } = useAuth();
  const { loadConversations } = useChatStore();

  useEffect(() => {
    if (hasSession) {
      loadConversations();
    }
  }, [hasSession, loadConversations]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRoute />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent/>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'rgba(2, 6, 23, 0.8)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(16px)',
                borderRadius: '12px',
                padding: '12px 20px',
                whiteSpace: 'nowrap',
                minWidth: '280px',
                maxWidth: '480px',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: '500',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              },
              success: {
                duration: 5000,
                style: {
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ffffff',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
              loading: {
                style: {
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;