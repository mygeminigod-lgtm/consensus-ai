export class InMemoryRateLimiter {
  private static requests: Map<string, number[]> = new Map();
  private static readonly WINDOW_MS = 60 * 1000; // 1 minute
  private static readonly MAX_REQUESTS = 20; // 20 requests per minute

  public static check(ip: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const timestamps = this.requests.get(ip) || [];

    // Filter out timestamps outside the window
    const validTimestamps = timestamps.filter((t) => now - t < this.WINDOW_MS);

    if (validTimestamps.length >= this.MAX_REQUESTS) {
      this.requests.set(ip, validTimestamps);
      return { allowed: false, remaining: 0 };
    }

    validTimestamps.push(now);
    this.requests.set(ip, validTimestamps);

    return {
      allowed: true,
      remaining: this.MAX_REQUESTS - validTimestamps.length,
    };
  }
}
