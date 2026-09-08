---
name: git-workflow
description: Repository branching, commit styling, and pull request conventions.
---

# Git Workflow Skill

Use this skill when staging changes, making git commits, creating branches, or proposing pull requests.

## 🚀 Guidelines

1. **Branch Naming Conventions**:
   - `feature/your-feature-name` for new features or capabilities.
   - `bugfix/issue-description` for bug fixes.
   - `chore/update-dependencies` for routine tasks or configuration updates.

2. **Commit Message Format & Rich Comments**:
   - Write clear, concise, and imperative commit subject lines (present tense, as if giving an order).
   - Provide an itemized, descriptive commit body detailing:
     - What changed.
     - The rationale behind the changes.
     - Impacted files and components.
   - Prefix commit messages:
     - `feat:` for new features (e.g. `feat: add email sentiment trigger for customer success`)
     - `fix:` for bug fixes (e.g. `fix: prevent potential division by zero in dashboard analytics`)
     - `chore:` for settings, config, dependencies (e.g. `chore: update database connection pool configurations`)
     - `docs:` for documentation changes (e.g. `docs: add deployment instructions to README`)

3. **Pre-commit Checklist**:
   - Format code using Black: `black .`
   - Run Flake8 linter: `flake8 .`
   - Run unit tests: `pytest`
   - Ensure the code builds and all tests pass before committing.

4. **NEVER Push to Remote**:
   - Under NO circumstances should AI agents execute `git push` to remote repositories (GitHub/GitLab/etc.) or ask/propose to push.
   - The user will ALWAYS review and push changes to GitHub manually.
   - Agents may prepare branches, stage files, and commit locally with clean, detailed messages, but the final `git push` is reserved exclusively for the user.
   - All code and commit messages must be thoroughly commented so that when the user pushes to Remote, the remote repository history and PR review are crystal clear.
