import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FiPlus, FiTrash2, FiMessageSquare, FiSidebar } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { notify } from '../../lib/notify';
import { SidebarHeader } from '../ui/SidebarHeader';
import { SettingsDropdown } from '../ui/SettingsDropdown';
import { UserButton } from '../ui/UserButton';
import { UserProfileModal } from '../ui/UserProfileModal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { conversations, loadConversation, deleteConversation, startNewChat } = useChatStore();
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleNewChat = () => {
    startNewChat();
    navigate('/chat');
  };

  const handleConversationClick = (uuid: string) => {
    loadConversation(uuid);
    navigate(`/chat/${uuid}`);
  };

  const handleDelete = async (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(uuid);
    }
  };

  const handleLogout = () => {
    const username = user?.username || user?.email || 'User';
    logout();
    notify.success(`You are logged out successfully! See you soon ${username}!`);
  };

  const handleUpdateEmail = async (email: string) => {
    await updateProfile({ email });
    notify.success('Email updated successfully!');
  };

  const handleUpdateUsername = async (username: string) => {
    await updateProfile({ username });
    notify.success('Username updated successfully!');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  return (
    <>
      {/* Collapsed Sidebar */}
      {!isOpen && (
        <div className="w-16 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] border-r border-white/10 h-screen flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h1 className="text-xl font-bold tracking-wide text-center">
              Z<span className="text-[rgb(var(--color-primary))]">A</span>
            </h1>
          </div>
          <div className='relative mx-auto'>
            <button
              onClick={onToggle}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-2 mx-auto mt-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <FiSidebar size={20} className="rotate-180" />
            </button>
            {showTooltip && (
              <div className="absolute left-full top-[60%] -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-900 text-white border border-white/20 rounded whitespace-nowrap">
                {isOpen ? 'Collapse sidebar (Ctrl+B)' : 'Expand sidebar (Ctrl+B)'}
              </div>
            )}
          </div>

          <div className="p-3">
            <button
              onClick={handleNewChat}
              className="
                group relative w-full flex items-center justify-center
                bg-[rgb(var(--color-primary))/12]
                backdrop-blur-sm
                border-2 border-[rgb(var(--color-primary))]
                text-[rgb(var(--color-primary))]
                rounded-xl py-2 px-2
                hover:shadow-xl hover:shadow-[rgb(var(--color-primary))/30]
                hover:scale-[1.05] active:scale-[0.95]
                hover:bg-[rgb(var(--color-primary))/20]
                transition-all duration-300 ease-out
                overflow-hidden
              "
              title="New Chat"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[rgb(var(--color-primary))/25] to-transparent" />
              
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              
              <FiPlus 
                size={20} 
                className="transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" 
              />
            </button>
          </div>

         {/* Spacer - pushes everything below to bottom */}
          <div className="flex-1" />
          
          <div className="p-3 space-y-3 border-t border-white/10">
            <SettingsDropdown
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogout={handleLogout}
              variant="icon"
            />
            <UserButton
              variant="icon"
              onClick={() => setIsProfileModalOpen(true)}
            />
          </div>

          <UserProfileModal
            key={isProfileModalOpen ? 'open' : 'closed'}
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={{
              email: user?.email || '',
              username: user?.username || '',
            }}
            onUpdateEmail={handleUpdateEmail}
            onUpdateUsername={handleUpdateUsername}
          />

        </div>
      )}

      {/* Expanded Sidebar - Full content */}
      {isOpen && (
        <div className="w-64 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] border-r border-white/10 h-screen flex flex-col">
          <SidebarHeader isOpen={isOpen} onToggle={onToggle} />

          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="
                group relative w-full flex items-center justify-center gap-2
                bg-[rgb(var(--color-primary))/12]
                backdrop-blur-sm
                border-2 border-[rgb(var(--color-primary))]
                text-[rgb(var(--color-primary))]
                font-semibold
                rounded-xl py-2 px-1
                hover:shadow-xl hover:shadow-[rgb(var(--color-primary))/30]
                hover:scale-[1.02] active:scale-[0.98]
                hover:bg-[rgb(var(--color-primary))/20]
                transition-all duration-300 ease-out
                overflow-hidden
              "
              style={{
                textShadow: '0 0 2px rgba(0,0,0,0.2)',
                WebkitFontSmoothing: 'antialiased'
              }}
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform 
                              duration-1000 bg-gradient-to-r from-transparent via-[rgb(var(--color-primary))/25] to-transparent" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              
              <FiPlus 
                size={18} 
                className="transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" 
              />
              <span className="text-sm font-bold tracking-wide">New Chat</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <FiMessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.uuid}
                  onClick={() => handleConversationClick(conversation.uuid)}
                  className="relative group p-3 mx-2 my-1 cursor-pointer rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200"
                >
                  <div className="font-medium truncate pr-8">
                    {conversation.title || 'New Conversation'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(conversation.updated_at), { 
                      addSuffix: true 
                    })}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conversation.uuid)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all duration-200"
                    title="Delete conversation"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/10 space-y-2">
            <SettingsDropdown
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogout={handleLogout}
              variant="full"
            />
            <UserButton
              username={user?.username || user?.email?.split('@')[0]}
              onClick={() => setIsProfileModalOpen(true)}
              variant="full"
            />
          </div>

          <UserProfileModal
            key={isProfileModalOpen ? 'open' : 'closed'}
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={{
              email: user?.email || '',
              username: user?.username || '',
            }}
            onUpdateEmail={handleUpdateEmail}
            onUpdateUsername={handleUpdateUsername}
          />

        </div>
      )}
    </>
  );
};