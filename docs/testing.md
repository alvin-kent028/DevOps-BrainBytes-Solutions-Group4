# Testing Documentation

## Screenshot Links

Add your captured evidence here before submission:

- Backend & Frontend test screenshot: https://drive.google.com/drive/folders/1abq3wNguP8k7tWo3dOXrcQr5Z24SPrmP?usp=drive_link 
- GitHub Actions workflow screenshot: https://drive.google.com/drive/folders/14AU3VHofriBGxurz8_N-pQb-IWk1_Oow?usp=drive_link
- ESLint screenshot: https://drive.google.com/drive/folders/1LgQJZU1CuJ98P7AYoTirHjT6RahUpqxT?usp=drive_link 

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
- The repo initially had no screenshot artifacts, so the submission guide now includes placeholders for you to link the captured evidence.

## Evidence To Capture For Submission

- Successful GitHub Actions workflow run
- Backend test output
- Frontend test output
- ESLint output from both app folders