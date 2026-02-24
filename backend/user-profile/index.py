"""
Профиль пользователя по сессии.
GET / — возвращает данные текущего пользователя
"""

import os
import json
import psycopg2
from datetime import datetime


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    headers = event.get("headers") or {}
    params = event.get("queryStringParameters") or {}
    session_id = headers.get("X-Session-Id") or params.get("session")

    if not session_id:
        return {
            "statusCode": 401,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "No session"}),
        }

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT u.id, u.steam_id, u.username, u.avatar_url, u.profile_url, u.plan, u.created_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = %s AND s.expires_at > NOW()
        """,
        (session_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {
            "statusCode": 401,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Session expired or not found"}),
        }

    user = {
        "id": row[0],
        "steam_id": row[1],
        "username": row[2],
        "avatar_url": row[3],
        "profile_url": row[4],
        "plan": row[5],
        "created_at": row[6].isoformat() if row[6] else None,
    }

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"user": user}),
    }
