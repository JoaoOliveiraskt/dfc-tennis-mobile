type LoginLifecycleEvent =
  | { name: "login_started" }
  | { name: "login_success" }
  | { name: "login_failed"; reason: string };

function emitLoginLifecycleEvent(event: LoginLifecycleEvent): void {
  const payload = JSON.stringify(event);
  // Keep only production-relevant, non-sensitive auth telemetry.
  console.info(`[auth] ${payload}`);
}

export { emitLoginLifecycleEvent };
