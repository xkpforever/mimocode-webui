"""
SPA-compatible static file server for MiMo Code WebUI.
Falls back to index.html for unmatched routes (SPA routing).
"""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3457
DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
INDEX = os.path.join(DIST, 'index.html')

MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
}

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST, **kwargs)

    def do_GET(self):
        # Strip query string
        path = self.path.split('?')[0]
        file_path = os.path.join(DIST, path.lstrip('/'))

        # Try to serve the actual file
        if path != '/' and os.path.isfile(file_path):
            ext = os.path.splitext(file_path)[1].lower()
            mime = MIME.get(ext, 'application/octet-stream')
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            # SPA fallback: serve index.html
            with open(INDEX, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)

    def log_message(self, format, *args):
        pass  # Suppress logs

if __name__ == '__main__':
    server = http.server.HTTPServer(('127.0.0.1', PORT), SPAHandler)
    print(f'MiMo Code WebUI SPA server running at http://localhost:{PORT}')
    server.serve_forever()
