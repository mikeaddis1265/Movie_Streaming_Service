"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentSuccessNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const txRef = searchParams.get("tx_ref");

    if (paymentStatus === "success" && txRef) {
      setShowNotification(true);
      
      // Process the payment webhook manually if needed
      processPaymentWebhook(txRef);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete("payment");
        url.searchParams.delete("tx_ref");
        router.replace(url.pathname + url.search);
      }, 5000);
    }
  }, [searchParams, router]);

  const processPaymentWebhook = async (txRef: string) => {
    try {
      // Call our webhook manually to process the payment
      await fetch("/api/webhooks/chapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx_ref: txRef }),
      });
      
      // Clean up any saved tx_ref
      try {
        sessionStorage.removeItem("chapa_tx_ref");
      } catch (_) {}
    } catch (error) {
      console.error("Error processing payment webhook:", error);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    // Clean up URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete("payment");
    url.searchParams.delete("tx_ref");
    router.replace(url.pathname + url.search);
  };

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-gradient-to-r from-green-500/90 to-green-600/90 backdrop-filter backdrop-blur-xl border border-green-400/30 rounded-2xl p-4 shadow-2xl animate-slide-in-right">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">Payment Successful!</h3>
            <p className="text-green-100 text-sm">
              Your subscription is now active. Enjoy unlimited streaming!
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-green-100 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}