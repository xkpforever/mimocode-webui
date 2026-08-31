"""
Message reorder proxy v6: MiMo Code -> proxy (8081) -> llama-server (8082)
Key fixes:
1. REPLACES entire system prompt with minimal one for local model
2. Strips ALL tool definitions (local model can't use tools)
3. Removes "MAXIMUM STEPS REACHED" injected assistant messages
4. Does NOT change stream parameter - passes through as-is
5. Forwards SSE chunks in real-time (no buffering)
"""
import http.server
import http.client
import json
import sys

UPSTREAM_HOST = "127.0.0.1"
UPSTREAM_PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8082
PROXY_PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8081

LOCAL_SYSTEM_PROMPT = "You are a helpful AI assistant. Answer the user's questions directly and concisely."


def transform_request(body_bytes):
    """Strip MiMo Code agent cruft, replace system prompt."""
    try:
        data = json.loads(body_bytes)

        # Strip tools
        data.pop('tools', None)
        data.pop('tool_choice', None)

        # Process messages
        messages = data.get('messages', [])
        cleaned = []
        system_added = False

        for m in messages:
            role = m.get('role', '')
            content = m.get('content', '')

            # Replace ALL system messages with minimal prompt
            if role == 'system':
                if not system_added:
                    cleaned.append({'role': 'system', 'content': LOCAL_SYSTEM_PROMPT})
                    system_added = True
                continue

            # Skip injected "MAXIMUM STEPS REACHED"
            if role == 'assistant' and isinstance(content, str) and 'MAXIMUM STEPS REACHED' in content:
                continue

            cleaned.append(m)

        if cleaned:
            data['messages'] = cleaned

        # DO NOT modify stream parameter - let it pass through
        # DO NOT modify stream_options

        return json.dumps(data).encode('utf-8')
    except Exception as e:
        print(f"Transform error: {e}", flush=True)
        return body_bytes


class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b''

        if self.path == '/v1/chat/completions' and body:
            body = transform_request(body)

        self._forward('POST', body)

    def do_GET(self):
        self._forward('GET', b'')

    def _forward(self, method, body):
        try:
            conn = http.client.HTTPConnection(UPSTREAM_HOST, UPSTREAM_PORT, timeout=600)

            headers = {}
            skip = {'host', 'transfer-encoding', 'connection'}
            for k, v in self.headers.items():
                if k.lower() not in skip:
                    headers[k] = v
            headers['Connection'] = 'close'
            if body:
                headers['Content-Length'] = str(len(body))

            conn.request(method, self.path, body=body or None, headers=headers)
            resp = conn.getresponse()

            self.send_response(resp.status)
            for key, val in resp.getheaders():
                kl = key.lower()
                if kl not in ('transfer-encoding', 'connection'):
                    self.send_header(key, val)
            self.send_header('Connection', 'close')
            self.end_headers()

            # Forward body in small chunks for SSE streaming
            while True:
                chunk = resp.read(4096)
                if not chunk:
                    break
                self.wfile.write(chunk)
                self.wfile.flush()

            conn.close()
        except Exception as e:
            try:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Connection', 'close')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            except:
                pass

    def log_message(self, format, *args):
        pass


if __name__ == '__main__':
    print(f"Proxy v6: :{PROXY_PORT} -> :{UPSTREAM_PORT} (replace system, passthrough stream)", flush=True)
    server = http.server.HTTPServer(('127.0.0.1', PROXY_PORT), ProxyHandler)
    server.serve_forever()
