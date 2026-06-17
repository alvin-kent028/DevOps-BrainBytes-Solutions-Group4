# Testing Documentation

## Testing Strategy

The project uses two layers of automated checks:

1. Backend Jest tests cover utility logic and API behavior.
2. Frontend Jest tests cover React component behavior and basic rendering.

The backend suite focuses on deterministic logic in `aiHelpers` and request/response behavior for the chat API. The frontend suite focuses on user input handling, loading state, and error rendering.

## What Is Automated

- Backend unit and API tests in `backend/__tests__`
- Frontend component tests in `frontend/__tests__`
- ESLint checks in both app folders
- GitHub Actions CI workflow in `.github/workflows/ci.yml`

## Current Validation

- `backend`: Jest passes
- `frontend`: Jest passes
- ESLint: configured for both apps and ready to run in CI or locally

## Challenges Encountered

- The original backend tests expected an `app` export and chat routes that were not present in the current server entry point.
- The frontend tests referenced missing `Chat` and `ChatInput` components, so lightweight test-friendly components had to be added.
- The repository did not include ESLint configuration or a GitHub Actions workflow, so both had to be added before the submission evidence could be collected.

## Evidence To Capture For Submission

- Successful GitHub Actions workflow run
- Backend test output
- Frontend test output
- ESLint output from both app folders