"""Simple test to verify AuthStore.login works for a given email/password.

Usage:
  python test_login.py email password
"""
import sys
from pathlib import Path

def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("Usage: python test_login.py email password")
        return 2
    _, email, password = argv

    repo_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(repo_root))

    try:
        from app.services.auth_store import AuthStore
    except Exception as exc:
        print("Failed to import AuthStore:", exc)
        return 1

    store = AuthStore()
    try:
        token, user = store.login(email, password)
        print("Login successful")
        print("Token:", token)
        print("User:", user.model_dump())
    except ValueError as exc:
        print("Login failed:", exc)
        return 3
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
