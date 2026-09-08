# Mandatory Git Policy: Never Push to Remote

## Absolute Rule
- **NEVER PUSH TO REMOTE**: Under NO circumstances should AI agents execute `git push` to GitHub, GitLab, or any remote repository, nor ask or propose pushing to remote.
- The user will **ALWAYS** review, verify, and push changes manually to GitHub.
- AI agents are strictly limited to local operations: creating local branches, staging files (`git add`), and creating clean atomic commits (`git commit`) with conventional messages.
- All remote synchronization (`git push`) is reserved exclusively for the user.
