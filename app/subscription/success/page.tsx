"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

          // Optional: perform a hard refresh as a fallback if components didn't update
          setTimeout(() => {
            try {
              const navHasPremium =
                !!document.querySelector(".ms-premium-badge");
              const navGetPremium = !!document.querySelector(".ms-get-premium");
              if (!navHasPremium && navGetPremium) {
                console.log(
                  "Fallback: hard reload to reflect subscription state"
                );
                window.location.reload();
              }
            } catch (_) {
              window.location.reload();
            }
          }, 2500);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-white text-base">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {success ? (
          <div className="bg-gray-800 rounded-xl p-6 text-center shadow-xl border border-gray-700/60">
            <div className="w-12 h-12 bg-green-500/90 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-xl font-bold text-white mb-2">
              Payment Successful!
            </h1>

            <p className="text-gray-300 mb-5 text-sm">
              Thank you for your subscription. Your account has been activated
              and you now have access to all premium features.
            </p>

            {subscriptionData && (
              <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded-lg p-5 mb-5 border border-gray-600/30 backdrop-filter backdrop-blur-xl text-left">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  Subscription Details
                </h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-medium text-sm">
                      Plan
                    </span>
                    <span className="text-white font-semibold text-base bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      {subscriptionData.planName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-medium text-sm">
                      Status
                    </span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-medium text-sm">
                      Next billing
                    </span>
                    <span className="text-white font-medium text-sm">
                      {new Date(
                        subscriptionData.expiresAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1m-6 0V7a4 4 0 018 0v3"
                    />
                  </svg>
                  Start Watching
                </span>
              </Link>
              <Link
                href="/subscription"
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center border border-gray-600/60"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Manage Subscription
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 text-center shadow-xl border border-gray-700/60">
            <div className="w-12 h-12 bg-red-500/90 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-xl font-bold text-white mb-2">
              Payment Failed
            </h1>

            <p className="text-gray-300 mb-5 text-sm">
              {error ||
                "There was an issue processing your payment. Please try again."}
            </p>

            <div className="space-y-3">
              <Link
                href="/subscription"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </span>
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center border border-gray-600/60"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Back to Home
                </span>
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
