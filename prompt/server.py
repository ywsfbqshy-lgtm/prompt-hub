# ==============================================================================
# 🚀 PROMPT HUB - SERVER (server.py)
# ==============================================================================
# خادم الويب والمستقبل الرئيسي للطلبات باستخدام المكتبة القياسية Python http.server
# ==============================================================================

import http.server
import socketserver
import json
import urllib.parse
import os

import database_manager
import search_engine

PORT = 8000

class PromptHubRequestHandler(http.server.SimpleHTTPRequestHandler):
    
    def do_GET(self):
        """
        معالجة طلبات الجلب GET
        """
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        # 1. API: جلب قائمة الأوامر
        if path == '/api/prompts':
            prompts = database_manager.get_prompts()
            category = query_params.get('category', [None])[0]
            if category and category != 'all':
                prompts = [p for p in prompts if p['category'].lower() == category.lower()]
            self.send_json_response(prompts)
            return

        # 2. API: جلب أمر محدد بالـ ID
        elif path == '/api/prompt':
            prompt_id_str = query_params.get('id', [None])[0]
            if prompt_id_str and prompt_id_str.isdigit():
                prompt_id = int(prompt_id_str)
                prompt = database_manager.get_prompt_by_id(prompt_id)
                if prompt:
                    self.send_json_response(prompt)
                else:
                    self.send_json_response({'error': 'Prompt not found'}, 404)
            else:
                self.send_json_response({'error': 'Invalid ID'}, 400)
            return

        # 3. API: تنفيذ البحث المباشر بواسطة search_engine.py
        elif path == '/api/search':
            search_query = query_params.get('q', [''])[0]
            all_prompts = database_manager.get_prompts()
            matching_results = search_engine.search_prompts(search_query, all_prompts)
            self.send_json_response(matching_results)
            return

        # 4. توجيه المسارات للصفحات الرئيسية
        if path == '/' or path == '/index.html':
            self.path = '/index.html'
        elif path == '/prompt':
            self.path = '/prompt.html'
        elif path == '/studio':
            self.path = '/studio.html'

        return super().do_GET()

    def do_POST(self):
        """
        معالجة طلبات الإرسال POST
        """
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(content_length)
        
        try:
            body_data = json.loads(body_bytes.decode('utf-8'))
        except Exception:
            body_data = {}

        # 1. API: تحديث عدد الإعجابات
        if path == '/api/like':
            prompt_id = body_data.get('prompt_id')
            if prompt_id:
                new_likes = database_manager.update_likes(int(prompt_id))
                self.send_json_response({'success': True, 'likes': new_likes})
            else:
                self.send_json_response({'error': 'Prompt ID required'}, 400)
            return

        # 2. API: إضافة أمر جديد إلى SQLite
        elif path == '/api/add_prompt':
            title = body_data.get('title')
            description = body_data.get('description')
            prompt_text = body_data.get('prompt_text')
            author_name = body_data.get('author_name')
            category = body_data.get('category', 'AI')

            if title and description and prompt_text and author_name:
                new_id = database_manager.add_prompt(title, description, prompt_text, author_name, category)
                self.send_json_response({
                    'success': True, 
                    'message': 'تم نشر الـ Prompt بنجاح 🚀', 
                    'id': new_id
                })
            else:
                self.send_json_response({'error': 'جميع الحقول مطلوبة'}, 400)
            return

        else:
            self.send_json_response({'error': 'Not Found'}, 404)

    def send_json_response(self, data, status=200):
        """
        إرسال استجابة بصيغة JSON إلى المتصفح
        """
        json_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(json_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json_bytes)

def run_server():
    database_manager.seed_data()
    server_address = ('', PORT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(server_address, PromptHubRequestHandler) as httpd:
        print("==================================================================")
        print(f"Prompt Hub Server running at http://localhost:{PORT}")
        print("==================================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == '__main__':
    run_server()
