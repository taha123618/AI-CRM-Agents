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

2. **Commit Message Format**:
   - Write clear, concise, and imperative commit messages (present tense, as if giving an order).
   - Prefix commit messages:
     - `feat:` for new features (e.g. `feat: add email sentiment trigger for customer success`)
     - `fix:` for bug fixes (e.g. `fix: prevent potential division by zero in dashboard analytics`)
     - `chore:` for settings, config, dependencies (e.g. `chore: update database connection pool configurations`)
     - `docs:` for documentation changes (e.g. `docs: add deployment instructions to README`)

3. **Pre-commit Checklist**:
   - Format code using Black: `black .`
   - Run Flake8 linter: `flake8 .`
   - Run unit tests: `pytest`
   - Ensure the code builds and all tests pass before pushing.
