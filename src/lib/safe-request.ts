type SafeRequestOptions = {
  retries?: number;
  timeoutMs?: number;
  retryDelayMs?: number;
};

export async function safeRequest<T>(
  fn: () => Promise<T>,
  options: SafeRequestOptions = {}
): Promise<{ success: true; data: T } | { success: false; error: unknown }> {
  const { retries = 2, timeoutMs = 10000, retryDelayMs = 800 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
      });

      const data = await Promise.race([fn(), timeoutPromise]);

      return { success: true, data };
    } catch (error) {
      if (attempt === retries) {
        return { success: false, error };
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return { success: false, error: "Unknown error" };
}