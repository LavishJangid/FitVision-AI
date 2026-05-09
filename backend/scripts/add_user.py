"""Utility script to add a user to the local AuthStore.

Usage:
  python add_user.py "Full Name" email@example.com "PlainTextPassword"

This script uses the project's `AuthStore.register` which hashes the password
before writing to `database/users.json`.
"""
import sys
from pathlib import Path


def main(argv: list[str]) -> int:
    if len(argv) != 4:
        print("Usage: python add_user.py \"Full Name\" email@example.com \"Password\"")
        return 2

    _, name, email, password = argv

    # Ensure project package imports resolve when running from scripts dir
    # Put the `backend` folder on sys.path so `import app` works
    repo_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(repo_root))

    try:
        from app.services.auth_store import AuthStore
    except Exception as exc:
        print("Failed to import AuthStore:", exc)
        return 1

    store = AuthStore()
    try:
        user = store.register(name, email, password)
        print("User created:")
        print(f"  id: {user.id}")
        print(f"  name: {user.name}")
        print(f"  email: {user.email}")
    except ValueError as exc:
        print("Could not create user:", exc)
        return 3

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
