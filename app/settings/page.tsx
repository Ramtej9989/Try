'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ANALYST'
  });

  // Settings for the platform
  const [settings, setSettings] = useState({
    automatedDetection: true,
    detectionInterval: 24,
    dataRetentionDays: 90,
    threatIntelUpdateFrequency: 12
  });
  
  // Redirect non-admin users
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // In a real application, you would fetch from your API
        // For this demo, we'll use a mock response
        const response = await axios.get('/api/users');
        setUsers(response.data.users);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if the user is an admin
    if (session?.user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [session]);

  // Handle creating a new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', newUser);
      setUsers([...users, response.data.user]);
      
      // Reset form
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'ANALYST'
      });
      
      alert('User created successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  // Handle saving settings
  const handleSaveSettings = () => {
    // In a real application, you would save to your API
    alert('Settings saved successfully!');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">User Management</h2>
            
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">Create New User</h3>
              <form onSubmit={handleCreateUser}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="ANALYST">Analyst</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Existing Users</h3>
              {loading ? (
                <p>Loading users...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2">Admin User</td>
                        <td className="px-4 py-2">admin@example.com</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            ADMIN
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">Analyst User</td>
                        <td className="px-4 py-2">analyst@example.com</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            ANALYST
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* System Settings Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">System Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.automatedDetection}
                    onChange={(e) => setSettings({...settings, automatedDetection: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span>Enable Automated Detection</span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  Run detection rules automatically on a schedule
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detection Interval (hours)
                </label>
                <input
                  type="number"
                  value={settings.detectionInterval}
                  onChange={(e) => setSettings({...settings, detectionInterval: parseInt(e.target.value)})}
                  min="1"
                  max="48"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Retention Period (days)
                </label>
                <input
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => setSettings({...settings, dataRetentionDays: parseInt(e.target.value)})}
                  min="30"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Threat Intel Update Frequency (hours)
                </label>
                <input
                  type="number"
                  value={settings.threatIntelUpdateFrequency}
                  onChange={(e) => setSettings({...settings, threatIntelUpdateFrequency: parseInt(e.target.value)})}
                  min="1"
                  max="72"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Platform Diagnostics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">API Status</h3>
              <p className="text-lg font-semibold text-green-600">Connected</p>
              <p className="text-xs text-gray-500 mt-1">
                Last checked: {new Date().toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Database</h3>
              <p className="text-lg font-semibold text-green-600">Online</p>
              <p className="text-xs text-gray-500 mt-1">
                MongoDB: v5.0.14
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Detection Engine</h3>
              <p className="text-lg font-semibold text-green-600">Active</p>
              <p className="text-xs text-gray-500 mt-1">
                Last run: 10 minutes ago
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">System Status</h3>
              <p className="text-lg font-semibold text-green-600">Healthy</p>
              <p className="text-xs text-gray-500 mt-1">
                All subsystems operational
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Run System Diagnostic
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
