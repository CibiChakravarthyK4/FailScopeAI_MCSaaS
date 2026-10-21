"""Minimal stand-in for the OpenAI chat-completions endpoint, used only by the
E2E suite (docker-compose.e2e.yml) so "Investigate with AI" is testable without
a real OPENAI_API_KEY. Always returns the same deterministic classification -
this proves our code's plumbing (request/response handling, storage, review
workflow), not real model behavior. See CLAUDE.md 10.3 for what a real AI
evaluation requires instead.
"""

import json
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

STUB_DIAGNOSIS = {
    "category": "application_bug",
    "confidence": 0.87,
    "evidence": ["Stub AI response for E2E testing - deterministic, not a real model call."],
}


class Handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", 0))
        self.rfile.read(length)  # drain the request body; its content doesn't change the canned reply

        body = json.dumps(
            {
                "id": "chatcmpl-e2e-stub",
                "object": "chat.completion",
                "created": int(time.time()),
                "model": "e2e-stub",
                "choices": [
                    {
                        "index": 0,
                        "message": {"role": "assistant", "content": json.dumps(STUB_DIAGNOSIS)},
                        "finish_reason": "stop",
                    }
                ],
                "usage": {"prompt_tokens": 10, "completion_tokens": 10, "total_tokens": 20},
            }
        ).encode()

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        pass  # this is test-only infrastructure; keep container logs quiet


if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
