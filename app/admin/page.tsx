"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import "@/app/styles/pages/admin.css";

interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  totalRevenue: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      // Fetch stats and users separately to avoid complete failure
      try {
        const statsResponse = await fetch("/api/admin/quick-stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        } else {
          console.error("Failed to load admin statistics:", await statsResponse.text());
          // Set default stats if API fails
          setStats({
            totalUsers: 0,
            totalSubscriptions: 0,
            totalRevenue: 0,
            activeUsers: 0
          });
        }
      } catch (statsError) {
        console.error("Stats fetch error:", statsError);
        setStats({
          totalUsers: 0,
          totalSubscriptions: 0,
          totalRevenue: 0,
          activeUsers: 0
        });
      }

      try {
        const usersResponse = await fetch("/api/admin/users");
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.data?.users?.slice(0, 5) || []); // Show first 5 users
        } else {
          console.error("Failed to load users:", await usersResponse.text());
          setUsers([]);
        }
      } catch (usersError) {
        console.error("Users fetch error:", usersError);
        setUsers([]);
      }

    } catch (err) {
      console.error("General fetch error:", err);
      setError("Some admin data could not be loaded");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="admin-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  // Show error as warning but still show the page content

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Error Warning */}
        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '30px',
            color: '#ef4444',
            textAlign: 'center'
          }}>
            <p>⚠️ {error}</p>
            <button onClick={fetchStats} className="btn-primary" style={{ marginTop: '10px' }}>
              Retry Loading Data
            </button>
          </div>
        )}

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-left">
              <h1 className="admin-title">Admin Dashboard</h1>
              <p className="admin-subtitle">Welcome back, <span className="admin-name">{session.user.name || session.user.email}</span></p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-content">
              <span className="metric-icon">👥</span>
              <div className="metric-label">Total Users</div>
              <div className="metric-value">{stats?.totalUsers || 0}</div>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-content">
              <span className="metric-icon">📋</span>
              <div className="metric-label">Subscriptions</div>
              <div className="metric-value">{stats?.totalSubscriptions || 0}</div>
            </div>
          </div>

          <div className="metric-card info">
            <div className="metric-content">
              <span className="metric-icon">💰</span>
              <div className="metric-label">Revenue</div>
              <div className="metric-value">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-content">
              <span className="metric-icon">⚡</span>
              <div className="metric-label">Active Users</div>
              <div className="metric-value">{stats?.activeUsers || 0}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <div className="section-title">Quick Actions</div>
          <div className="quick-actions-grid">
            <Link href="/admin/users" className="quick-action-card">
              <span className="quick-action-icon">👥</span>
              <div className="quick-action-content">
                <h3>User Management</h3>
                <p>Manage users, view profiles, and update roles.</p>
              </div>
            </Link>

            <Link href="/admin/subscriptions" className="quick-action-card">
              <span className="quick-action-icon">💳</span>
              <div className="quick-action-content">
                <h3>Subscription Plans</h3>
                <p>Create and manage subscription plans.</p>
              </div>
            </Link>

            <Link href="/admin/analytics" className="quick-action-card">
              <span className="quick-action-icon">📈</span>
              <div className="quick-action-content">
                <h3>Analytics</h3>
                <p>View detailed analytics and reports.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Users */}
        <div className="recent-users-section">
          <div className="section-header">
            <div className="section-title">Recent Users</div>
            <Link href="/admin/users" className="view-all-link">
              View All Users →
            </Link>
          </div>
          
          {users.length > 0 ? (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="user-details">
                            <div className="user-name">{user.name || 'No name'}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                          {user.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="user-date">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="user-actions">
                          <Link href={`/admin/users/${user.id}`} className="action-btn view" title="View User">
                            👁
                          </Link>
                          <Link href={`/admin/users/${user.id}/edit`} className="action-btn edit" title="Edit User">
                            ✏
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No Users Found</h3>
              <p>No users have registered yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}