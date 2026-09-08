# Mandatory Git Policy: Never Push to Remote & Comment All Changes

## 1. Absolute Rule: Never Push to Remote
- **NEVER PUSH TO REMOTE**: Under NO circumstances should AI agents execute `git push` to GitHub, GitLab, or any remote repository, nor ask or propose pushing to remote.
- The user will **ALWAYS** review, verify, and push changes manually to GitHub.
- AI agents are strictly limited to local operations: creating local branches, staging files (`git add`), and creating clean atomic commits (`git commit`) with detailed comments.
- All remote synchronization (`git push`) is reserved exclusively for the user.

## 2. Mandatory Rule: Detailed Commit Comments & Code Documentation
- **Rich Commit Documentation**: Every git commit must feature a structured, detailed message with:
  - An imperative subject line (e.g., `feat(module): Short description`).
  - An itemized bulleted description detailing the rationale, specific modifications, and affected components.
- **Code Comments**: All modified or newly added code must be clearly commented with:
  - High-level architectural JSDoc/docstrings at the top of the file.
  - Inline comments explaining complex logic, constants, or platform-specific adaptations (iOS, Android, Web).
- **Remote Readability**: Ensure that when the user manually pushes commits to Remote GitHub, any collaborator or reviewer reading the commit log and code diff immediately understands the complete context, architectural reasoning, and impact of every change.
