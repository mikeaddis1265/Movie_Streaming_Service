"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/app/styles/pages/admin.css";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

export default function AdminSubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: 0,
    currency: 'USD',
    interval: 'MONTHLY',
    features: ['']
  });

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

    fetchPlans();
  }, [session, status, router]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/subscription-plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data || []);
      } else {
        setError("Failed to load subscription plans");
      }
    } catch (err) {
      setError("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/admin/subscription-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newPlan,
          features: newPlan.features.filter(f => f.trim() !== '')
        }),
      });

      if (response.ok) {
        await fetchPlans(); // Refresh the list
        setShowCreateDialog(false);
        setNewPlan({
          name: '',
          price: 0,
          currency: 'USD',
          interval: 'MONTHLY',
          features: ['']
        });
      } else {
        setError("Failed to create subscription plan");
      }
    } catch (err) {
      setError("Failed to create subscription plan");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPlans(); // Refresh the list
      } else {
        setError("Failed to delete subscription plan");
      }
    } catch (err) {
      setError("Failed to delete subscription plan");
    }
  };

  const addFeature = () => {
    setNewPlan(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="admin-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-error">
            <div className="error-content">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={fetchPlans} className="btn-primary">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-left">
              <h1 className="admin-title">Subscription Plans</h1>
              <p className="admin-subtitle">Manage subscription plans and pricing</p>
            </div>
            <div className="admin-header-right">
              <div className="admin-actions">
                <Link href="/admin" className="admin-action-btn">
                  ← Back to Dashboard
                </Link>
                <button 
                  onClick={() => setShowCreateDialog(true)}
                  className="admin-action-btn"
                >
                  + Create Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Table */}
        <div className="recent-users-section">
          <div className="section-header">
            <div className="section-title">Subscription Plans ({plans.length})</div>
          </div>
          
          {plans.length > 0 ? (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Price</th>
                    <th>Interval</th>
                    <th>Features</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td>
                        <div className="user-name">{plan.name}</div>
                      </td>
                      <td>
                        <div className="user-name">${plan.price.toFixed(2)} {plan.currency}</div>
                      </td>
                      <td>
                        <span className="role-badge user">
                          {plan.interval}
                        </span>
                      </td>
                      <td>
                        <div className="plan-features-preview">
                          {plan.features.slice(0, 2).map((feature, index) => (
                            <span key={index} className="feature-tag">
                              {feature}
                            </span>
                          ))}
                          {plan.features.length > 2 && (
                            <span className="feature-tag more">
                              +{plan.features.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${plan.isActive ? 'verified' : 'unverified'}`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="user-date">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="user-actions">
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="action-btn edit"
                            title="Delete Plan"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Subscription Plans</h3>
              <p>Create your first subscription plan to get started.</p>
              <button 
                onClick={() => setShowCreateDialog(true)}
                className="btn-primary"
              >
                Create Plan
              </button>
            </div>
          )}
        </div>

        {/* Create Plan Dialog */}
        {showCreateDialog && (
          <div className="dialog-overlay">
            <div className="dialog">
              <div className="dialog-header">
                <h3>Create New Subscription Plan</h3>
                <button 
                  onClick={() => setShowCreateDialog(false)}
                  className="dialog-close"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreatePlan}>
                <div className="dialog-body">
                  <div className="form-group">
                    <label>Plan Name</label>
                    <input
                      type="text"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g., Premium"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newPlan.price}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        required
                        placeholder="9.99"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={newPlan.currency}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, currency: e.target.value }))}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Interval</label>
                      <select
                        value={newPlan.interval}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, interval: e.target.value }))}
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Features</label>
                    {newPlan.features.map((feature, index) => (
                      <div key={index} className="feature-input">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                        />
                        {newPlan.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="remove-feature-btn"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="add-feature-btn"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>
                
                <div className="dialog-actions">
                  <button
                    type="button"
                    onClick={() => setShowCreateDialog(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}