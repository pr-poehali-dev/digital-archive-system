"""
Авторизация через Steam OpenID 2.0.
GET /login — редирект на Steam
GET /callback — обработка ответа от Steam, создание сессии
GET /logout — удаление сессии
"""

import os
import json
import uuid
import urllib.parse
import urllib.request
import psycopg2
from datetime import datetime, timedelta


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}

STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"
STEAM_API_URL = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    path = event.get("path", "/")
    params = event.get("queryStringParameters") or {}

    if path.endswith("/login"):
        return handle_login()
    elif path.endswith("/callback"):
        return handle_callback(params)
    elif path.endswith("/logout"):
        return handle_logout(event)
    else:
        return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}


def handle_login():
    site_url = os.environ.get("SITE_URL", "")
    callback_url = f"{site_url}/api/steam-auth/callback"

    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": callback_url,
        "openid.realm": site_url,
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    }

    redirect_url = STEAM_OPENID_URL + "?" + urllib.parse.urlencode(params)
    return {
        "statusCode": 302,
        "headers": {**CORS_HEADERS, "Location": redirect_url},
        "body": "",
    }


def handle_callback(params: dict):
    if not verify_openid(params):
        return {
            "statusCode": 401,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "OpenID verification failed"}),
        }

    claimed_id = params.get("openid.claimed_id", "")
    steam_id = claimed_id.split("/")[-1]

    profile = fetch_steam_profile(steam_id)

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO users (steam_id, username, avatar_url, profile_url)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (steam_id) DO UPDATE
          SET username = EXCLUDED.username,
              avatar_url = EXCLUDED.avatar_url,
              profile_url = EXCLUDED.profile_url,
              updated_at = NOW()
        RETURNING id
        """,
        (steam_id, profile.get("personaname"), profile.get("avatarfull"), profile.get("profileurl")),
    )
    user_id = cur.fetchone()[0]

    session_id = str(uuid.uuid4())
    expires_at = datetime.now() + timedelta(days=30)

    cur.execute(
        "INSERT INTO sessions (id, user_id, expires_at) VALUES (%s, %s, %s)",
        (session_id, user_id, expires_at),
    )
    conn.commit()
    cur.close()
    conn.close()

    site_url = os.environ.get("SITE_URL", "")
    redirect_url = f"{site_url}/profile?session={session_id}"

    return {
        "statusCode": 302,
        "headers": {**CORS_HEADERS, "Location": redirect_url},
        "body": "",
    }


def handle_logout(event: dict):
    headers = event.get("headers") or {}
    session_id = headers.get("X-Session-Id") or (event.get("queryStringParameters") or {}).get("session")

    if session_id:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("UPDATE sessions SET expires_at = NOW() WHERE id = %s", (session_id,))
        conn.commit()
        cur.close()
        conn.close()

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"ok": True}),
    }


def verify_openid(params: dict) -> bool:
    verify_params = dict(params)
    verify_params["openid.mode"] = "check_authentication"

    data = urllib.parse.urlencode(verify_params).encode("utf-8")
    req = urllib.request.Request(STEAM_OPENID_URL, data=data, method="POST")
    with urllib.request.urlopen(req) as resp:
        body = resp.read().decode("utf-8")
    return "is_valid:true" in body


def fetch_steam_profile(steam_id: str) -> dict:
    api_key = os.environ.get("STEAM_API_KEY", "")
    url = f"{STEAM_API_URL}?key={api_key}&steamids={steam_id}"
    with urllib.request.urlopen(url) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    players = data.get("response", {}).get("players", [])
    return players[0] if players else {}
