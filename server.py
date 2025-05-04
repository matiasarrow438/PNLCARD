import http.server
import socketserver
import webbrowser
import os
import json
import requests
import uuid
import email
from email import policy
from io import BytesIO
import re

PORT = 8000
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1368426386007785602/uBd25UapD-3E-C2-dAXe5FGTXCUCeLoSv42KFBHM4FqYb56uyFZBimJ_mvI3odc9rjzR"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', 'https://pnlcardsol.org')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', 'https://pnlcardsol.org')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    def do_POST(self):
        if self.path == '/submit_background':
            try:
                # Set CORS headers for the actual request
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', 'https://pnlcardsol.org')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.send_header('Content-type', 'application/json')
                self.end_headers()

                content_length = int(self.headers['Content-Length'])
                content_type = self.headers['Content-Type']
                post_data = self.rfile.read(content_length)

                # Extract boundary
                match = re.search('boundary=(.*)', content_type)
                if not match:
                    raise Exception("No boundary in content type")
                boundary = match.group(1).encode()

                # Split parts
                parts = post_data.split(b'--' + boundary)
                file_data = None
                filename = None

                for part in parts:
                    if b'Content-Disposition' in part and b'name="background"' in part:
                        # Extract filename
                        fname_match = re.search(b'filename="([^"]+)"', part)
                        if fname_match:
                            filename = fname_match.group(1).decode()
                            # Extract file content after double CRLF
                            file_content = part.split(b'\r\n\r\n', 1)[1].rsplit(b'\r\n', 1)[0]
                            file_data = file_content
                            break

                # Find twitter handle in the multipart form data
                twitter_handle = None
                for part in parts:
                    if b'Content-Disposition' in part and b'name="twitterHandle"' in part:
                        # Extract value after double CRLF
                        value = part.split(b'\r\n\r\n', 1)[1].rsplit(b'\r\n', 1)[0]
                        twitter_handle = value.decode(errors='ignore').strip()
                        break
                print("Extracted twitter_handle:", repr(twitter_handle))

                if file_data and filename:
                    file_ext = os.path.splitext(filename)[1]
                    unique_filename = f"{uuid.uuid4()}{file_ext}"
                    file_path = os.path.join('assets', 'submitted_backgrounds', unique_filename)
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)
                    with open(file_path, 'wb') as f:
                        f.write(file_data)

                    # Prepare Discord webhook payload
                    description = f"Filename: {filename}"
                    if twitter_handle and twitter_handle != "":
                        description += f"\nTwitter: {twitter_handle}"
                    discord_payload = {
                        "content": "New background submission!",
                        "embeds": [{
                            "title": "Background Submission",
                            "description": description,
                            "image": {
                                "url": f"attachment://{unique_filename}"
                            }
                        }]
                    }
                    try:
                        with open(file_path, 'rb') as file_handle:
                            files = {
                                'file': (unique_filename, file_handle, 'image/png')
                            }
                            response = requests.post(
                                DISCORD_WEBHOOK_URL,
                                data={'payload_json': json.dumps(discord_payload)},
                                files=files
                            )
                        print("File uploaded to Discord, now deleting:", file_path)
                        os.remove(file_path)
                        print("File deleted successfully.")
                        self.wfile.write(json.dumps({'success': True}).encode())
                    except Exception as e:
                        import traceback; traceback.print_exc()
                        self.wfile.write(json.dumps({'error': str(e)}).encode())
                else:
                    self.wfile.write(json.dumps({'error': 'No file uploaded'}).encode())
            except Exception as e:
                import traceback; traceback.print_exc()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

def run_server():
    # Change to the directory where the script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        # Open the browser automatically
        webbrowser.open(f'http://localhost:{PORT}')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    run_server() 
