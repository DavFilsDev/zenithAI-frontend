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
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;