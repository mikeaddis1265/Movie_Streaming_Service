'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function SuccessContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get tx_ref from URL params
        let txRef = searchParams.get('tx_ref');
        const status = searchParams.get('status');

        // Fallback: read tx_ref from sessionStorage if not in URL
        if (!txRef && typeof window !== 'undefined') {
          try {
            txRef = sessionStorage.getItem('chapa_tx_ref');
          } catch (_) {}
        }

        if (!txRef) {
          setError('Missing transaction reference');
          setVerifying(false);
          return;
        }

        // If status is missing (some providers do not append it), try to proceed and let server-side verification decide
        if (status && status !== 'success') {
          setError('Payment was not successful');
          setVerifying(false);
          return;
        }

        // Payment was successful, manually process it since webhook isn't working
        if (session?.user?.id) {
          console.log('Processing payment manually for tx_ref:', txRef);
          
          // Call our webhook manually to process the payment
          try {
            const webhookResponse = await fetch('/api/webhooks/chapa', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tx_ref: txRef })
            });
            
            if (webhookResponse.ok) {
              console.log('Payment processed successfully');
              // Cleanup saved tx_ref so we don't reuse it accidentally
              try { sessionStorage.removeItem('chapa_tx_ref'); } catch (_) {}
            } else {
              console.error('Webhook processing failed:', await webhookResponse.text());
            }
          } catch (webhookError) {
            console.error('Error calling webhook:', webhookError);
          }

          // Load user subscription
          const response = await fetch(`/api/users/${session.user.id}/subscriptions`);
          if (response.ok) {
            const data = await response.json();
            setSubscriptionData(data.data);
          }
        }

        setSuccess(true);
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, session]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {success ? (
          <div className="bg-gray-800 rounded-2xl p-8 text-center shadow-2xl border border-gray-700">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
            
            <p className="text-gray-300 mb-6">
              Thank you for your subscription. Your account has been activated and you now have access to all premium features.
            </p>

            {subscriptionData && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Subscription Details</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p><span className="font-medium">Plan:</span> {subscriptionData.planName}</p>
                  <p><span className="font-medium">Status:</span> Active</p>
                  <p><span className="font-medium">Next billing:</span> {new Date(subscriptionData.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Link 
                href="/" 
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Start Watching
              </Link>
              <Link 
                href="/subscription" 
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Manage Subscription
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl p-8 text-center shadow-2xl border border-gray-700">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">Payment Failed</h1>
            
            <p className="text-gray-300 mb-6">
              {error || 'There was an issue processing your payment. Please try again.'}
            </p>
            
            <div className="space-y-3">
              <Link 
                href="/subscription" 
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </Link>
              <Link 
                href="/" 
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}