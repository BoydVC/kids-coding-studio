#!/usr/bin/env python3
"""Kids Coding Studio — local creative studio for Kid A & Kid B on 127.0.0.1:4331.

Python stdlib only. Serves a single-page studio, JSON APIs for briefs/profiles/
projects, and persists kid shelves under data/state.json. No external network
calls; age-safe by design (see SAFETY.md).
"""
from __future__ import annotations

import json
import os
import re
import tempfile
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

HERE = Path(__file__).resolve().parent
PORT = int(os.environ.get("KCS_PORT", os.environ.get("PORT", "4331")))
HOST = "127.0.0.1"
STATE_PATH = HERE / "data" / "state.json"
_LOCK = threading.Lock()

# Local age-safe filters (also enforced in the browser). No personal probes.
BLOCKED_PATTERNS = [
    re.compile(p, re.I)
    for p in [
        # Identity / meetup / secrets (brief-006 §4.2)
        r"\b(address|phone|email|password|school name|full name)\b",
        r"\bwhere do you live\b",
        r"\bwhat(?:'s| is) your (real )?name\b",
        r"\bsend (me )?a photo\b",
        r"\bmeet (me |up )?in person\b",
        r"\b(credit card|ssn|social security)\b",
        # Companion jailbreaks — phrase-level, not single words
        r"\bsecret friend\b",
        r"\bdon'?t tell (my |our )?(parents|mom|dad)\b",
        r"\b(pretend|be) (you'?re|you are).{0,60}\b(no rules|secret friend)\b",
        # Instruction overrides (LLM01 spirit; phrase-level)
        r"\bignore (all |the |previous |prior )?(instructions|prompts|rules)\b",
        r"\b(developer mode|reveal (the )?system prompt)\b",
    ]
]
ASK_PARENT_TRIGGERS = [
    re.compile(p, re.I)
    for p in [
        r"\bask (a |my )?parent\b",
        r"\bi need (a )?grown-?up\b",
        r"\bhelp from (mom|dad|parent)\b",
    ]
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def load_state() -> dict:
    with _LOCK:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))


def save_state(state: dict) -> None:
    with _LOCK:
        STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
        raw = json.dumps(state, indent=2, ensure_ascii=False)
        fd, tmp = tempfile.mkstemp(dir=str(STATE_PATH.parent), suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                f.write(raw)
            os.replace(tmp, STATE_PATH)
        finally:
            if os.path.exists(tmp):
                try:
                    os.unlink(tmp)
                except OSError:
                    pass


def safety_check(text: str) -> dict:
    text = text or ""
    blocked = [p.pattern for p in BLOCKED_PATTERNS if p.search(text)]
    ask_parent = any(p.search(text) for p in ASK_PARENT_TRIGGERS)
    return {
        "ok": not blocked,
        "blocked": blocked,
        "ask_parent": ask_parent,
        "message": (
            "That prompt asks for something personal. Try a story idea instead — "
            "or tap Ask a Parent."
            if blocked
            else (
                "Got it — a parent can help with that."
                if ask_parent
                else "Looks age-safe for the studio."
            )
        ),
    }


def read_web(name: str) -> str:
    return (HERE / "web" / name).read_text(encoding="utf-8")


def page() -> str:
    html = read_web("index.html")
    html = html.replace("/*__CSS__*/", read_web("app.css"))
    # Escape </script in JS so inline embedding stays safe.
    js = read_web("app.js").replace("</script", "<\\/script")
    html = html.replace("/*__APP__*/", js)
    return html


class Handler(BaseHTTPRequestHandler):
    server_version = "KidsCodingStudio/1.0"

    def log_message(self, fmt: str, *args) -> None:
        print(f"[kids-coding-studio] {args[0] if args else fmt}", flush=True)

    def _send(self, code: int, body, ctype: str = "application/json") -> None:
        if isinstance(body, (dict, list)):
            raw = json.dumps(body, ensure_ascii=False).encode("utf-8")
            ctype = "application/json; charset=utf-8"
        elif isinstance(body, str):
            raw = body.encode("utf-8")
        else:
            raw = body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Kids-Coding-Studio", "1")
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        try:
            if path in ("/", "/index.html", "/studio"):
                self._send(200, page(), "text/html; charset=utf-8")
                return
            if path == "/healthz" or path == "/health":
                state = load_state()
                self._send(
                    200,
                    {
                        "ok": True,
                        "app": "kids-coding-studio",
                        "port": PORT,
                        "briefs": len(state.get("briefs", {})),
                        "projects": len(state.get("projects", {})),
                        "profiles": list(state.get("profiles", {}).keys()),
                        "ai_helper_enabled": state.get("ai_helper_enabled", False),
                    },
                )
                return
            if path == "/api/state":
                self._send(200, load_state())
                return
            if path == "/api/briefs":
                self._send(200, list(load_state().get("briefs", {}).values()))
                return
            if path.startswith("/api/briefs/"):
                bid = path.rsplit("/", 1)[-1]
                brief = load_state().get("briefs", {}).get(bid)
                if not brief:
                    self._send(404, {"error": "brief not found"})
                    return
                self._send(200, brief)
                return
            if path == "/api/profiles":
                self._send(200, load_state().get("profiles", {}))
                return
            if path.startswith("/api/kids/") and path.endswith("/projects"):
                kid = path.split("/")[3]
                state = load_state()
                if kid not in state.get("profiles", {}):
                    self._send(404, {"error": "unknown kid"})
                    return
                projects = [
                    p
                    for p in state.get("projects", {}).values()
                    if p.get("owner") == kid
                ]
                projects.sort(key=lambda p: p.get("updated", ""), reverse=True)
                self._send(200, projects)
                return
            if path == "/api/parent/overview":
                self._send(200, parent_overview(load_state()))
                return
            if path == "/api/safety/rules":
                self._send(
                    200,
                    {
                        "ai_helper_enabled_default": False,
                        "helper_mode_default": "off",
                        "no_external_chat": True,
                        "no_outbound_tools": True,
                        "filters_are_layer0_not_boundary": True,
                        "blocked_topics": [
                            "personal identity questions",
                            "addresses / phones / emails",
                            "meeting strangers / photos",
                            "passwords / financial data",
                            "companion jailbreaks (secret friend / no rules)",
                            "instruction-override phrases",
                        ],
                        "ask_parent_escape": True,
                        "helper_framing": "craft_tool_not_companion",
                        "on_device_vs_cloud": {
                            "v1": "no_model",
                            "next": "on_device_after_parent_enable",
                            "cloud": "parent_apply_plus_zdr_only",
                        },
                        "brief_fold": "brief-006",
                        "doc": "SAFETY.md",
                        "not_legal_advice": True,
                    },
                )
                return
            # Static fallbacks
            if path.startswith("/web/"):
                rel = path[len("/web/") :]
                fp = (HERE / "web" / rel).resolve()
                if not str(fp).startswith(str(HERE / "web")) or not fp.is_file():
                    self._send(404, "not found", "text/plain")
                    return
                ctype = {
                    ".js": "text/javascript; charset=utf-8",
                    ".css": "text/css; charset=utf-8",
                    ".json": "application/json",
                    ".html": "text/html; charset=utf-8",
                }.get(fp.suffix, "application/octet-stream")
                self._send(200, fp.read_bytes(), ctype)
                return
            self._send(404, {"error": "not found", "path": path})
        except Exception as ex:  # noqa: BLE001 — surface to client for local debug
            self._send(500, {"error": str(ex)})

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            body = json.loads(raw.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self._send(400, {"error": "invalid json"})
            return
        try:
            if path == "/api/safety/check":
                self._send(200, safety_check(body.get("text", "")))
                return
            if path == "/api/projects/save":
                self._send(200, save_project(body))
                return
            if path == "/api/projects/new":
                self._send(200, new_project(body))
                return
            if path == "/api/session/touch":
                self._send(200, touch_session(body))
                return
            if path == "/api/parent/ai-toggle":
                # Parent gate only — kids cannot enable AI helper from the UI.
                # brief-006: Disable clears helper session; mode stays local craft.
                state = load_state()
                enabled = bool(body.get("enabled", False))
                state["ai_helper_enabled"] = enabled
                if enabled:
                    state["helper_mode"] = body.get("helper_mode") or "local"
                else:
                    state["helper_mode"] = "off"
                    state["helper_session"] = None
                save_state(state)
                self._send(
                    200,
                    {
                        "ok": True,
                        "ai_helper_enabled": enabled,
                        "helper_mode": state["helper_mode"],
                    },
                )
                return
            self._send(404, {"error": "not found", "path": path})
        except ValueError as ex:
            self._send(400, {"error": str(ex)})
        except Exception as ex:  # noqa: BLE001
            self._send(500, {"error": str(ex)})


def parent_overview(state: dict) -> dict:
    kids = []
    for kid_id, profile in state.get("profiles", {}).items():
        projects = [
            p for p in state.get("projects", {}).values() if p.get("owner") == kid_id
        ]
        projects.sort(key=lambda p: p.get("updated", ""), reverse=True)
        active_id = profile.get("active_project_id")
        active = state.get("projects", {}).get(active_id) or (
            projects[0] if projects else None
        )
        sugg = state.get("briefs", {}).get(profile.get("suggested_next", ""), {})
        kids.append(
            {
                "profile": profile,
                "active_project": active,
                "shelf_count": len(projects),
                "projects": projects,
                "suggested_next": sugg,
                "last_session": profile.get("last_session"),
            }
        )
    return {
        "generated_at": _now_iso(),
        "ai_helper_enabled": state.get("ai_helper_enabled", False),
        "helper_mode": state.get("helper_mode")
        or ("local" if state.get("ai_helper_enabled") else "off"),
        "safety_mode": state.get("safety_mode", "strict"),
        "kids": kids,
        "brief_count": len(state.get("briefs", {})),
        "portable_controls": {
            "brief_fold": "brief-006",
            "helper_default": "off",
            "parent_gate_only": True,
            "ask_parent_escape": True,
            "filters_layer0_incomplete": True,
            "no_outbound_tools": True,
            "framing": "craft_tool_not_companion",
            "cloud": "off_until_parent_apply_zdr",
            "not_legal_advice": True,
        },
    }


def save_project(body: dict) -> dict:
    pid = body.get("id")
    if not pid:
        raise ValueError("project id required")
    state = load_state()
    existing = state.get("projects", {}).get(pid)
    if not existing:
        raise ValueError("unknown project")
    # Never allow kids to inject owner change mid-flight.
    owner = existing["owner"]
    for key in ("title", "status", "blocks", "lanes", "checklist", "domain", "brief_id"):
        if key in body:
            existing[key] = body[key]
    existing["owner"] = owner
    existing["updated"] = _now_iso()
    # Safety sweep over SAY / ASK_AI text
    for blk in existing.get("blocks") or []:
        text = ""
        if isinstance(blk.get("args"), dict):
            text = str(blk["args"].get("text") or blk["args"].get("prompt") or "")
        check = safety_check(text)
        if not check["ok"]:
            raise ValueError(f"blocked text in block {blk.get('id')}: {check['message']}")
    state["projects"][pid] = existing
    prof = state["profiles"].get(owner)
    if prof:
        prof["active_project_id"] = pid
    save_state(state)
    return {"ok": True, "project": existing}


def new_project(body: dict) -> dict:
    kid = body.get("owner")
    brief_id = body.get("brief_id")
    state = load_state()
    if kid not in state.get("profiles", {}):
        raise ValueError("unknown kid")
    brief = state.get("briefs", {}).get(brief_id)
    if not brief:
        raise ValueError("unknown brief")
    pid = f"{kid}-{brief_id}-{int(datetime.now().timestamp())}"
    project = {
        "id": pid,
        "owner": kid,
        "brief_id": brief_id,
        "title": body.get("title") or brief["title"],
        "status": "idea",
        "domain": brief["domain"],
        "created": _now_iso(),
        "updated": _now_iso(),
        "checklist": {item: False for item in brief.get("success", [])},
        "blocks": [],
        "lanes": {"setup": [], "path_a": [], "path_b": [], "wrap": []},
    }
    state["projects"][pid] = project
    state["profiles"][kid]["active_project_id"] = pid
    save_state(state)
    return {"ok": True, "project": project}


def touch_session(body: dict) -> dict:
    kid = body.get("kid")
    state = load_state()
    if kid not in state.get("profiles", {}):
        raise ValueError("unknown kid")
    note = (body.get("note") or "")[:240]
    check = safety_check(note)
    if not check["ok"]:
        raise ValueError(check["message"])
    state["profiles"][kid]["last_session"] = {
        "at": _now_iso(),
        "project_id": body.get("project_id")
        or state["profiles"][kid].get("active_project_id"),
        "minutes": int(body.get("minutes") or 0),
        "note": note or "Studio session saved.",
    }
    save_state(state)
    return {"ok": True, "last_session": state["profiles"][kid]["last_session"]}


def main() -> None:
    if not STATE_PATH.is_file():
        raise SystemExit(f"missing state: {STATE_PATH}")
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Kids Coding Studio http://{HOST}:{PORT}/", flush=True)
    print(f"  health  http://{HOST}:{PORT}/healthz", flush=True)
    print(f"  parent  http://{HOST}:{PORT}/#/parent", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
