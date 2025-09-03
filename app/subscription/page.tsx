'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Footer from '@/app/components/ui/Footer';
import '@/app/styles/pages/subscription.css';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'MONTHLY' | 'YEARLY';
  features: string[];
  isActive: boolean;
  isPopular?: boolean;
}

interface UserSubscription {
  id: string;
  planName: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  cancelAtPeriodEnd?: boolean;
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    loadPlans();
    if (session?.user?.id) {
      loadUserSubscription();
    }
  }, [session]);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/subscription-plans');
      if (response.ok) {
        const data = await response.json();
        // Add popular flag to middle plan
        const plansWithPopular = data.data.map((plan: SubscriptionPlan, index: number) => ({
          ...plan,
          isPopular: index === 1, // Make the second plan popular
        }));
        setPlans(plansWithPopular);
      } else if (response.status === 404) {
        // If no API endpoint, create default plans
        setPlans([
          {
            id: '1',
            name: 'Basic',
            price: 9.99,
            currency: 'USD',
            interval: 'MONTHLY',
            features: [
              'HD Quality',
              '2 Devices',
              'Mobile & Tablet Access',
              'Basic Movie Library'
            ],
            isActive: true,
            isPopular: false
          },
          {
            id: '2',
            name: 'Premium',
            price: 15.99,
            currency: 'USD',
            interval: 'MONTHLY',
            features: [
              '4K Ultra HD',
              '4 Devices',
              'All Device Access',
              'Full Movie Library',
              'Early Access',
              'No Ads'
            ],
            isActive: true,
            isPopular: true
          },
          {
            id: '3',
            name: 'Family',
            price: 19.99,
            currency: 'USD',
            interval: 'MONTHLY',
            features: [
              '4K Ultra HD',
              '6 Devices',
              'All Device Access',
              'Full Movie Library',
              'Family Profiles',
              'Parental Controls',
              'No Ads'
            ],
            isActive: true,
            isPopular: false
          }
        ]);
      }
    } catch (err) {
      // Fallback to default plans if API fails
      setPlans([
        {
          id: '1',
          name: 'Basic',
          price: 9.99,
          currency: 'USD',
          interval: 'MONTHLY',
          features: [
            'HD Quality',
            '2 Devices',
            'Mobile & Tablet Access',
            'Basic Movie Library'
          ],
          isActive: true,
          isPopular: false
        },
        {
          id: '2',
          name: 'Premium',
          price: 15.99,
          currency: 'USD',
          interval: 'MONTHLY',
          features: [
            '4K Ultra HD',
            '4 Devices',
            'All Device Access',
            'Full Movie Library',
            'Early Access',
            'No Ads'
          ],
          isActive: true,
          isPopular: true
        },
        {
          id: '3',
          name: 'Family',
          price: 19.99,
          currency: 'USD',
          interval: 'MONTHLY',
          features: [
            '4K Ultra HD',
            '6 Devices',
            'All Device Access',
            'Full Movie Library',
            'Family Profiles',
            'Parental Controls',
            'No Ads'
          ],
          isActive: true,
          isPopular: false
        }
      ]);
      console.error('Failed to load plans, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscription = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/users/${session.user.id}/subscriptions`);
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setUserSubscription(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load user subscription:', err);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!session?.user?.id) {
      window.location.href = '/auth';
      return;
    }

    setSubscribing(planId);
    setError(null);
    
    try {
      console.log('Starting subscription process for plan:', planId);
      
      // First, sync user to database if they don't exist (for OAuth users)
      try {
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (syncError) {
        console.log('User sync failed, continuing anyway:', syncError);
      }
      
      const response = await fetch(`/api/users/${session.user.id}/subscriptions/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      console.log('Checkout response status:', response.status);
      const data = await response.json();
      console.log('Checkout response data:', data);

      if (response.ok) {
        if (data.data?.checkout_url && !data.data.checkout_url.includes('demo')) {
          // Redirect to payment provider
          window.location.href = data.data.checkout_url;
        } else {
          // Handle offline/demo subscription success
          setError(null);
          setSuccessMessage(null);
          
          // Immediately refresh subscription status
          await loadUserSubscription();
          
          // Trigger navigation refresh for other components
          window.dispatchEvent(new Event('subscription-updated'));
          
          // Show success message
          setSuccessMessage(`Subscription activated successfully! Welcome to ${data.data?.plan || 'Premium'} - you now have access to all features.`);
          
          // Auto-dismiss success message after 5 seconds
          setTimeout(() => setSuccessMessage(null), 5000);
        }
      } else {
        console.error('Checkout failed:', data);
        setError(data.error || 'Failed to create subscription. Please try again.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Failed to process subscription. Please check your connection and try again.');
    } finally {
      setSubscribing(null);
    }
  };

  const handleSubscriptionAction = async (action: 'cancel' | 'resume') => {
    if (!session?.user?.id) return;
    
    setSubscribing('action');
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`/api/users/${session.user.id}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      
      if (response.ok) {
        // Immediately refresh subscription status
        await loadUserSubscription();
        
        // Trigger navigation refresh for other components
        window.dispatchEvent(new Event('subscription-updated'));
        
        // Show success message
        setSuccessMessage(action === 'cancel' ? 
          'Subscription cancelled successfully. You will have access until the end of your billing period.' : 
          'Subscription resumed successfully! Your subscription is now active again.'
        );
        
        // Auto-dismiss success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const data = await response.json();
        setError(data.error || `Failed to ${action} subscription.`);
      }
    } catch (err) {
      console.error(`${action} subscription error:`, err);
      setError(`Failed to ${action} subscription. Please check your connection and try again.`);
    } finally {
      setSubscribing(null);
    }
  };

  const handleUpgrade = async (planId: string, planName: string) => {
    if (!session?.user?.id) return;

    setSubscribing(planId);
    setError(null);
    
    try {
      console.log('Upgrading to plan:', planId, planName);
      
      const response = await fetch(`/api/users/${session.user.id}/subscriptions/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, isUpgrade: true }),
      });

      const data = await response.json();
      console.log('Upgrade response:', data);

      if (response.ok) {
        if (data.data?.checkout_url && !data.data.checkout_url.includes('demo')) {
          // Redirect to payment provider for upgrade
          window.location.href = data.data.checkout_url;
        } else {
          // Handle upgrade success
          setError(null);
          setSuccessMessage(null);
          
          // Immediately refresh subscription status
          await loadUserSubscription();
          
          // Trigger navigation refresh for other components
          window.dispatchEvent(new Event('subscription-updated'));
          
          // Show success message
          setSuccessMessage(`Successfully upgraded to ${planName}! Your new plan is now active.`);
          
          // Auto-dismiss success message after 5 seconds
          setTimeout(() => setSuccessMessage(null), 5000);
        }
      } else {
        console.error('Upgrade failed:', data);
        setError(data.error || 'Failed to upgrade subscription. Please try again.');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError('Failed to process upgrade. Please check your connection and try again.');
    } finally {
      setSubscribing(null);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!session?.user?.id) return;

    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your subscription? This action cannot be undone and you will lose access immediately.'
    );

    if (!confirmed) return;

    setSubscribing('delete');
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`/api/users/${session.user.id}/subscriptions`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Immediately refresh subscription status
        await loadUserSubscription();
        
        // Trigger navigation refresh for other components
        window.dispatchEvent(new Event('subscription-updated'));
        
        // Show success message
        setSuccessMessage('Subscription deleted successfully. You now have access to free features only.');
        
        // Auto-dismiss success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
        
        // Force a full page refresh to update all components
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete subscription.');
      }
    } catch (err) {
      console.error('Delete subscription error:', err);
      setError('Failed to delete subscription. Please check your connection and try again.');
    } finally {
      setSubscribing(null);
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    return `${formatter.format(price)}/${interval.toLowerCase()}`;
  };

  const isCurrentPlan = (planName: string) => {
    return userSubscription?.planName === planName && userSubscription?.status === 'active';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-white text-xl">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      {/* Hero Section */}
      <div className="subscription-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>Premium Experience</span>
          </div>
          <h1 className="hero-title">
            Choose Your Perfect Plan
          </h1>
          <p className="hero-subtitle">
            Unlimited movies, TV shows, and exclusive content.<br />
            Cancel anytime, no hidden fees.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="subscription-content">
        {/* Current Subscription Status */}
        {userSubscription && (
          <div className="current-subscription-status">
            <div className="subscription-status-card">
              <div className="status-header">
                <h3>Current Subscription</h3>
                <span className={`status-badge ${userSubscription.status}`}>
                  {userSubscription.status === 'active' ? 'Active' : 'Expired'}
                </span>
              </div>
              
              <div className="status-details">
                <div className="plan-info">
                  <span className="plan-name">{userSubscription.planName} Plan</span>
                  <span className="plan-date">
                    {userSubscription.status === 'active' ? 'Renews' : 'Expired'} on {' '}
                    {new Date(userSubscription.expiresAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="subscription-duration">
                    Subscribed since {new Date(userSubscription.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="status-actions">
                  {userSubscription.status === 'active' && !userSubscription.cancelAtPeriodEnd && (
                    <>
                      <button
                        onClick={() => setShowCancelDialog(true)}
                        className="btn-status-action cancel"
                        disabled={subscribing !== null}
                      >
                        Cancel Subscription
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription()}
                        className="btn-status-action delete"
                        disabled={subscribing !== null}
                      >
                        Delete Subscription
                      </button>
                    </>
                  )}
                  
                  {userSubscription.status === 'active' && userSubscription.cancelAtPeriodEnd && (
                    <>
                      <div className="cancel-notice-compact">
                        <p>⚠️ Subscription will end on {new Date(userSubscription.expiresAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleSubscriptionAction('resume')}
                        className="btn-status-action resume"
                        disabled={subscribing !== null}
                      >
                        Resume Subscription
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription()}
                        className="btn-status-action delete"
                        disabled={subscribing !== null}
                      >
                        Delete Now
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <div className="success-content">
              <span className="success-icon">✓</span>
              <p>{successMessage}</p>
              <button onClick={() => setSuccessMessage(null)} className="success-dismiss">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-content">
              <span className="error-icon">!</span>
              <p>{error}</p>
              <button onClick={() => setError(null)} className="error-dismiss">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="pricing-section">
          <div className="pricing-header">
            <h2>Select Your Plan</h2>
            <p>All plans include unlimited access to our entire library</p>
          </div>
          
          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`pricing-card ${plan.isPopular ? 'popular' : ''} ${isCurrentPlan(plan.name) ? 'current' : ''}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="popular-badge">
                    <span>Most Popular</span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan(plan.name) && (
                  <div className="current-badge">
                    <span>Your Plan</span>
                  </div>
                )}

                <div className="card-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price-amount">{formatPrice(plan.price, plan.currency, plan.interval)}</span>
                    <span className="price-period">per {plan.interval.toLowerCase()}</span>
                  </div>
                </div>

                <div className="card-features">
                  <ul>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>
                        <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-footer">
                  {isCurrentPlan(plan.name) ? (
                    <div className="current-plan-button">
                      <span>Current Plan</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => userSubscription ? handleUpgrade(plan.id, plan.name) : handleSubscribe(plan.id)}
                      disabled={subscribing === plan.id}
                      className={`subscribe-button ${plan.isPopular ? 'primary' : 'secondary'}`}
                    >
                      {subscribing === plan.id ? (
                        <div className="loading-state">
                          <div className="spinner"></div>
                          <span>Processing...</span>
                        </div>
                      ) : userSubscription ? (
                        `Upgrade to ${plan.name}`
                      ) : session ? (
                        `Subscribe to ${plan.name}`
                      ) : (
                        'Sign Up & Subscribe'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Plans Message */}
        {!loading && plans.length === 0 && (
          <div className="no-plans">
            <div className="no-plans-content">
              <h3>No plans available</h3>
              <p>Please check back later or contact support for assistance.</p>
            </div>
          </div>
        )}
        
        {/* FAQ Section */}
        <div className="faq-section">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about our subscription plans</p>
          </div>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Can I change my plan anytime?</h3>
              <p>Yes! Upgrade or downgrade at any time. Changes take effect at your next billing cycle.</p>
            </div>
            
            <div className="faq-item">
              <h3>Is there a free trial?</h3>
              <p>We offer a 7-day free trial for new subscribers. No credit card required to start.</p>
            </div>
            
            <div className="faq-item">
              <h3>Can I cancel anytime?</h3>
              <p>Absolutely! Cancel your subscription at any time with no cancellation fees.</p>
            </div>
            
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>All major credit cards, PayPal, and local payment methods in your region.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="cancel-dialog-overlay">
          <div className="cancel-dialog">
            <div className="dialog-header">
              <h3>Cancel Subscription</h3>
            </div>
            <div className="dialog-body">
              <p>Are you sure you want to cancel your subscription?</p>
              <ul className="cancel-consequences">
                <li>✓ You'll keep access until {userSubscription && new Date(userSubscription.expiresAt).toLocaleDateString()}</li>
                <li>✓ No immediate charges</li>
                <li>✓ You can resume anytime before the end date</li>
                <li>! After the end date, you'll lose access to premium features</li>
              </ul>
            </div>
            <div className="dialog-actions">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="btn-dialog-secondary"
                disabled={subscribing !== null}
              >
                Keep Subscription
              </button>
              <button
                onClick={() => {
                  handleSubscriptionAction('cancel');
                  setShowCancelDialog(false);
                }}
                className="btn-dialog-danger"
                disabled={subscribing !== null}
              >
                {subscribing === 'action' ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}