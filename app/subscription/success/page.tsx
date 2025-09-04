"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Footer from "@/app/components/ui/Footer";

function SuccessContent() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);


  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get tx_ref from URL params
        let txRef = searchParams.get("tx_ref");
        const status = searchParams.get("status");

        // Also try to parse from hash fragment if present
        if (!txRef && typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(
            window.location.hash.replace(/^#/, "")
          );
          txRef = hashParams.get("tx_ref") || txRef;
        }

        // Fallback: read tx_ref from sessionStorage if not in URL
        if (!txRef && typeof window !== "undefined") {
          try {
            txRef = sessionStorage.getItem("chapa_tx_ref");
          } catch (_) {}
        }

        if (!txRef) {
          setError("Missing transaction reference");
          setVerifying(false);
          return;
        }

        // If status is missing (some providers do not append it), try to proceed and let server-side verification decide
        if (status && status !== "success") {
          setError("Payment was not successful");
          setVerifying(false);
          return;
        }

        // Payment was successful, manually process it since webhook isn't working
        // Process regardless of session presence; server validates using tx_ref and meta
        if (true) {
          console.log("Processing payment manually for tx_ref:", txRef);

          // Call our webhook manually to process the payment
          try {
            const webhookResponse = await fetch("/api/webhooks/chapa", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tx_ref: txRef }),
            });

            if (webhookResponse.ok) {
              console.log("Payment processed successfully");
              // Cleanup saved tx_ref so we don't reuse it accidentally
              try {
                sessionStorage.removeItem("chapa_tx_ref");
              } catch (_) {}
            } else {
              console.error(
                "Webhook processing failed:",
                await webhookResponse.text()
              );
            }
          } catch (webhookError) {
            console.error("Error calling webhook:", webhookError);
          }

          // Wait for database operations to fully complete
          await new Promise((resolve) => setTimeout(resolve, 1200));

          // Force a NextAuth session refresh so UI reflects new subscription immediately
          try {
            await update?.();
          } catch (e) {
            console.warn("Session update failed, continuing:", e);
          }

          // Try to load user subscription if session exists
          if (session?.user?.id) {
            const response = await fetch(
              `/api/users/${session.user.id}/subscriptions?_t=${Date.now()}`
            );
            if (response.ok) {
              const data = await response.json();
              setSubscriptionData(data.data);
            }
          }
        }

        setSuccess(true);

        // Trigger global subscription update event and force refresh
        if (typeof window !== "undefined") {
          console.log("Dispatching subscription update events...");
          window.dispatchEvent(new Event("subscription-updated"));
          window.dispatchEvent(new CustomEvent("force-subscription-refresh"));

          // Give components time to update instead of force reloading
          // This prevents the reload loop that was causing users to get stuck
          setTimeout(() => {
            console.log("Subscription update events dispatched, components should be updated");
          }, 1000);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify payment");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, session]);

  if (verifying) {
    return (
      <div className="min-h-screen">
        <div className="container">
          <div className="subscription-status-page">
            <div className="status-card">
              <div className="loading-spinner"></div>
              <p>Verifying your payment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container">
        <div className="subscription-status-page">
          {success ? (
            <div className="status-card success">
              <div className="status-icon success">
                <span>✓</span>
              </div>

              <h1 className="status-title">Payment Successful!</h1>

              <p className="status-message">
                Thank you for your subscription. Your account has been activated
                and you now have access to all premium features.
              </p>

              {subscriptionData && (
                <div className="subscription-details">
                  <h3>Subscription Details</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Plan</span>
                      <span className="detail-value">{subscriptionData.planName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className="detail-value status-active">Active</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Next billing</span>
                      <span className="detail-value">
                        {new Date(subscriptionData.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="status-actions">
                <Link href="/" className="button primary">
                  Start Watching
                </Link>
                <Link href="/subscription" className="button secondary">
                  Manage Subscription
                </Link>
              </div>
          </div>
          ) : (
            <div className="status-card error">
              <div className="status-icon error">
                <span>✕</span>
              </div>

              <h1 className="status-title">Payment Failed</h1>

              <p className="status-message">
                {error ||
                  "There was an issue processing your payment. Please try again."}
              </p>

              <div className="status-actions">
                <Link href="/subscription" className="button primary">
                  Try Again
                </Link>
                <Link href="/" className="button secondary">
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <div className="container">
            <div className="subscription-status-page">
              <div className="status-card">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
