'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface AdminStats {
  totalUsers: number;
  totalGigs: number;
  totalProjects: number;
  freelancers: number;
  clients: number;
  admins: number;
  activeGigs: number;
  completedGigs: number;
}

type RoleFilter = 'ALL' | 'FREELANCER' | 'CLIENT' | 'ADMIN';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [filterRole, setFilterRole] = useState<RoleFilter>('ALL');

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/users?role=${filterRole}`),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (err) {
      setError('Failed to fetch admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterRole]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user');
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await signOut({ redirect: false });
      router.replace('/login');
      router.refresh();
    } catch (err) {
      console.error('Sign out failed', err);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome, {session?.user?.name}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            {isSigningOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'Users' },
              { id: 'moderation', label: 'Moderation' },
              { id: 'reports', label: 'Reports' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {activeTab === 'overview' && <OverviewTab stats={stats} loading={loading} />}
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            loading={loading}
            filterRole={filterRole}
            onFilterChange={setFilterRole}
            onDeleteUser={handleDeleteUser}
          />
        )}
        {activeTab === 'moderation' && <ModerationTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </main>
    </div>
  );
}

function OverviewTab({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  if (loading) {
    return <div className="text-center py-12">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12 text-red-600">Failed to load statistics</div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-100 text-blue-800' },
    { label: 'Freelancers', value: stats.freelancers, color: 'bg-green-100 text-green-800' },
    { label: 'Clients', value: stats.clients, color: 'bg-purple-100 text-purple-800' },
    { label: 'Total Gigs', value: stats.totalGigs, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Active Gigs', value: stats.activeGigs, color: 'bg-orange-100 text-orange-800' },
    { label: 'Completed Gigs', value: stats.completedGigs, color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Total Projects', value: stats.totalProjects, color: 'bg-indigo-100 text-indigo-800' },
    { label: 'Admin Users', value: stats.admins, color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map(card => (
        <div key={card.label} className={`${card.color} rounded-lg p-6`}>
          <p className="text-sm font-medium opacity-75">{card.label}</p>
          <p className="text-3xl font-bold mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function UsersTab({
  users,
  loading,
  filterRole,
  onFilterChange,
  onDeleteUser,
}: {
  users: User[];
  loading: boolean;
  filterRole: RoleFilter;
  onFilterChange: (role: RoleFilter) => void;
  onDeleteUser: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="roleFilter" className="text-sm font-medium text-slate-900">
          Filter by Role:
        </label>
        <select
          id="roleFilter"
          value={filterRole}
          onChange={e => onFilterChange(e.target.value as RoleFilter)}
          className="px-4 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">All Users</option>
          <option value="FREELANCER">Freelancers</option>
          <option value="CLIENT">Clients</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-600">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">@{user.username}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'CLIENT'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      {user.role === 'ADMIN' ? (
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                          Protected
                        </span>
                      ) : (
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ModerationTab() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Moderation Center</h2>
      <p className="text-slate-600 mb-6">
        Monitor and manage content on the platform. Review reported gigs, projects, and user behavior.
      </p>

      <div className="space-y-4">
        <div className="p-4 border border-slate-200 rounded-lg">
          <h3 className="font-semibold text-slate-900">Reported Content</h3>
          <p className="text-slate-600 text-sm mt-2">View and manage reported gigs and projects</p>
          <Button className="mt-4 bg-amber-600 hover:bg-amber-700">Review Reports</Button>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg">
          <h3 className="font-semibold text-slate-900">Flagged Users</h3>
          <p className="text-slate-600 text-sm mt-2">View users flagged for suspicious activity</p>
          <Button className="mt-4 bg-amber-600 hover:bg-amber-700">View Flagged Users</Button>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg">
          <h3 className="font-semibold text-slate-900">Content Moderation</h3>
          <p className="text-slate-600 text-sm mt-2">Review user-generated content</p>
          <Button className="mt-4 bg-amber-600 hover:bg-amber-700">Moderate Content</Button>
        </div>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Reports & Analytics</h2>
      <p className="text-slate-600 mb-6">
        View detailed reports and analytics about platform usage and performance.
      </p>

      <div className="space-y-4">
        <div className="p-4 border border-slate-200 rounded-lg">
          <h3 className="font-semibold text-slate-900">User Growth Report</h3>
          <p className="text-slate-600 text-sm mt-2">Track new user signups and growth trends</p>
          <Button className="mt-4 bg-amber-600 hover:bg-amber-700">View Report</Button>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg">
          <h3 className="font-semibold text-slate-900">Platform Activity Report</h3>
          <p className="text-slate-600 text-sm mt-2">View gig and project activity metrics</p>
          <Button className="mt-4 bg-amber-600 hover:bg-amber-700">View Report</Button>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg">
          <h3 className="font-semibold text-slate-900">Financial Summary</h3>
          <p className="text-slate-600 text-sm mt-2">View transaction and revenue data</p>
          <Button className="mt-4 bg-amber-600 hover:bg-amber-700">View Summary</Button>
        </div>
      </div>
    </div>
  );
}
