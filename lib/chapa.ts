import { env } from "@/lib/env";

const CHAPA_BASE = "https://api.chapa.co/v1";

interface InitializePayload {
  amount: number | string;
  currency: string;
  email: string;
  first_name?: string;
  last_name?: string;
  tx_ref: string; // unique per transaction
  callback_url?: string;
  return_url?: string;
  custom_fields?: Record<string, string>;
}

export async function chapaInitialize(payload: InitializePayload) {
  const res = await fetch(`${CHAPA_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CHAPA_SECRET_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chapa init failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function chapaVerify(txRef: string) {
  const res = await fetch(`${CHAPA_BASE}/transaction/verify/${txRef}`, {
    headers: { Authorization: `Bearer ${env.CHAPA_SECRET_KEY}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chapa verify failed: ${res.status} ${text}`);
  }
  return res.json();
}
