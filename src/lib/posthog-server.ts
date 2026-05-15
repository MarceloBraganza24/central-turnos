import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogServer() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    });
  }

  return posthogClient;
}

export async function captureServerEvent({
  distinctId,
  event,
  properties = {},
}: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}) {
  const client = getPostHogServer();

  if (!client) return;

  client.capture({
    distinctId,
    event,
    properties,
  });

  await client.shutdown();
}