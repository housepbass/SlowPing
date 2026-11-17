#!/usr/bin/env python3
"""Launch Slow Ping from any working directory; serve only on loopback."""
import argparse
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8001)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    except OSError as exc:
        parser.exit(1, f'Cannot open port {args.port}: {exc}. Try --port 8002\n')
    address = f'http://127.0.0.1:{server.server_port}'
    print(f'Slow Ping: {address}  (Ctrl+C to stop)', flush=True)
    if not args.no_browser:
        webbrowser.open(address)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
