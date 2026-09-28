/**
 * Standard browser headers to ensure Codeforces Cloudflare WAF compatibility.
 * Automated bots or non-standard User-Agents receive 404 Turnstile challenges.
 */
export const CODEFORCES_REQUEST_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
};
