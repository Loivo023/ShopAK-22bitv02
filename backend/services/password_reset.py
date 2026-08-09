import hashlib
import secrets


def generate_reset_token():
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    return token, token_hash


def hash_reset_token(token: str):
    return hashlib.sha256(token.encode()).hexdigest()