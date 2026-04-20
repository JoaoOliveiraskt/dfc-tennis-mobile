const MANUAL_QA_AUTHENTICATED_ENTRY_ROUTE = "/(public)/onboarding" as const;
const MANUAL_QA_COMPLETION_EXIT_ROUTE = "/(app)/(shell)/home" as const;

/**
 * Temporary manual QA mode for onboarding.
 *
 * Important:
 * - This is intentionally disabled while backend onboarding integration is in progress.
 * - To re-enable onboarding route for authenticated users, set this to true.
 * - Keep overrides isolated in this single boundary for easy future removal.
 */
const IS_ONBOARDING_MANUAL_QA_MODE_ENABLED = false;

function getManualQaAuthenticatedEntryRouteOverride():
  | typeof MANUAL_QA_AUTHENTICATED_ENTRY_ROUTE
  | null {
  return IS_ONBOARDING_MANUAL_QA_MODE_ENABLED
    ? MANUAL_QA_AUTHENTICATED_ENTRY_ROUTE
    : null;
}

function getManualQaOnboardingCompletionExitRouteOverride():
  | typeof MANUAL_QA_COMPLETION_EXIT_ROUTE
  | null {
  return IS_ONBOARDING_MANUAL_QA_MODE_ENABLED
    ? MANUAL_QA_COMPLETION_EXIT_ROUTE
    : null;
}

export {
  IS_ONBOARDING_MANUAL_QA_MODE_ENABLED,
  MANUAL_QA_AUTHENTICATED_ENTRY_ROUTE,
  MANUAL_QA_COMPLETION_EXIT_ROUTE,
  getManualQaAuthenticatedEntryRouteOverride,
  getManualQaOnboardingCompletionExitRouteOverride,
};
