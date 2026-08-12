#!/usr/bin/env python3
"""
Sync Script for AI Agent Rules & Skills
Generates tool-specific instructions from the central .agents configuration.
"""

import re
from pathlib import Path


def main():
    # Paths
    agent_dir = Path(__file__).resolve().parent.parent
    workspace_dir = agent_dir.parent
    rules_file = agent_dir / "AGENTS.md"
    skills_dir = agent_dir / "skills"

    print("====================================================")
    print("  AI-Powered CRM - Synchronizing Agent Rules")
    print("====================================================")

    # 1. Load central rules
    if rules_file.exists():
        with open(rules_file, "r", encoding="utf-8") as f:
            rules_content = f.read()
        print(f"Loaded central rules from: {rules_file}")
    else:
        rules_content = "# AI-Powered CRM Guidelines"
        print(
            "WARNING: Central rules file "
            f"{rules_file} not found. "
            "Using default placeholder."
        )

    # 2. Load skills
    skills = []
    if skills_dir.exists():
        for skill_path in sorted(skills_dir.glob("**/SKILL.md")):
            with open(skill_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Parse YAML frontmatter (between first two --- blocks)
            match = re.match(
                r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL
            )  # noqa: E501
            if match:
                fm_text, body = match.groups()
                fm = {}
                for line in fm_text.strip().split("\n"):
                    if ":" in line:
                        key, val = line.split(":", 1)
                        fm[key.strip()] = val.strip()

                skills.append(
                    {
                        "name": fm.get("name", skill_path.parent.name),
                        "description": fm.get(
                            "description", "No description provided"
                        ),  # noqa: E501
                        "path": str(skill_path.relative_to(workspace_dir)),
                        "body": body.strip(),
                    }
                )
        print(f"Loaded {len(skills)} custom skills from: {skills_dir}")
    else:
        print("WARNING: Skills directory not found.")

    # 3. Create dynamic skills index markdown
    skills_md = "## 🛠️ Project-Specific Skills Index\n\n"
    if skills:
        for s in skills:
            skills_md += (
                f"* **{s['name']}**: {s['description']}\n"
                f"  - File Path: [`{s['path']}`]"
                f"(file:///{workspace_dir}/{s['path']})\n"
            )
    else:
        skills_md += "*No custom skills found.*\n"

    # 4. Define specific template generators

    # Cursorrules (.cursorrules)
    cursor_rules = f"""# Cursor Rules for AI-Powered CRM

{rules_content}

---

{skills_md}
"""

    # Claude Code (CLAUDE.md)
    claude_md = f"""# CLAUDE.md - AI-Powered CRM Developer Guide

## 🛠️ Build, Test, & Lint Commands
* Run server (FastAPI): `./.venv/bin/python3 run.py`
* Run tests (Pytest): `./.venv/bin/pytest`
* Code formatting (Black): `./.venv/bin/black .`
* Code linting (Flake8): `./.venv/bin/flake8 .`
* Static analysis (Mypy): `./.venv/bin/mypy .`
* Setup Database (Local development): `python3 -c "from database.models import Base; from database.connection import engine; Base.metadata.create_all(bind=engine)"`

## 📜 Coding Conventions & Style
* Follow PEP 8 style formatting.
* Explicit typing: All functions should use static typing annotations.
* Async/await: Use async/await for I/O operations (endpoints, DB interactions, external calls).
* Database models: SQLAlchemy ORM in `database/models.py`.
* Input validation: Use Pydantic models with compatible nested `class Config: from_attributes = True`.

{rules_content}

---

{skills_md}
"""  # noqa: E501

    # Copilot (.github/copilot-instructions.md)
    copilot_instructions = f"""# GitHub Copilot Instructions for AI-Powered CRM

{rules_content}

---

{skills_md}
"""

    # Cline / Roo Code (.clinerules)
    clinerules = f"""# Cline & Roo Code Custom Instructions for AI-Powered CRM

{rules_content}

---

{skills_md}
"""

    # Windsurf (.windsurfrules)
    windsurfrules = f"""# Windsurf Rules for AI-Powered CRM

{rules_content}

---

{skills_md}
"""

    # Targets map
    targets = {
        workspace_dir / ".cursorrules": cursor_rules,
        workspace_dir / "CLAUDE.md": claude_md,
        workspace_dir
        / ".github/copilot-instructions.md": copilot_instructions,  # noqa: E501
        workspace_dir / ".clinerules": clinerules,
        workspace_dir / ".windsurfrules": windsurfrules,
    }

    # Write target files
    for path, content in targets.items():
        # Ensure parent directories exist
        path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

        # Make root files match workspace root permissions
        print(f" -> Synchronized and updated: {path.name}")

    print()
    print(
        "SUCCESS: Rules and Skills synchronized "
        "across all AI tool configuration files!"
    )
    print("====================================================")


if __name__ == "__main__":
    main()
