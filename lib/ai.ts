import { API_BASE } from "./constants";

export async function callAI(
  system: string,
  userMsg: string,
  maxTokens: number = 1000
) {
  const res = await fetch(`${API_BASE}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, message: userMsg, maxTokens }),
  });
  if (!res.ok) throw new Error(`AI proxy error: ${res.status}`);
  return res.json();
}
