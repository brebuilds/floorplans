'use client';

import { useState, useEffect } from 'react';
import { Lock, User, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

// Simple internal auth - just a few users
const INTERNAL_USERS = [
  { username: 'admin', password: 'admin123', name: 'Admin' },
  { username: 'user1', password: 'user123', name: 'User 1' },
  { username: 'user2', password: 'user123', name: 'User 2' },
];

export default function SimpleAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('floorplans-user');
    if (savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(savedUser);
    }
  }, []);

  const handleLogin = () => {
    const user = INTERNAL_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user.name);
      localStorage.setItem('floorplans-user', user.name);
      localStorage.setItem('floorplans-username', user.username);
      toast.success(`Welcome, ${user.name}!`);
      setShowLogin(false);
      setUsername('');
      setPassword('');
    } else {
      toast.error('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('floorplans-user');
    localStorage.removeItem('floorplans-username');
    toast.success('Logged out');
  };

  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setShowLogin(true)}
          className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 z-50"
        >
          <Lock className="w-4 h-4" />
          Login
        </button>

        {showLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-6 h-6" />
                Internal Login
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLogin();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLogin();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowLogin(false);
                      setUsername('');
                      setPassword('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogin}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Internal use only - Contact admin for access
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-3 z-50">
      <span className="text-sm text-gray-700">Logged in as: <strong>{currentUser}</strong></span>
      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-gray-800"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}

