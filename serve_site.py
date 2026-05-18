import http.server, socketserver, os
os.chdir(r'C:\Users\Art-E Mediatech\AppData\Local\Teneo CLI\peaq-human-node-chain\dist')
class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True
with ReusableTCPServer(('127.0.0.1', 8787), http.server.SimpleHTTPRequestHandler) as httpd:
    httpd.serve_forever()
