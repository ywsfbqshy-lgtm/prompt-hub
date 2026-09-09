# ==============================================================================
# 🚀 PROMPT HUB - DATABASE MANAGER (database_manager.py)
# ==============================================================================
# هذا الملف مسؤول عن إدارة قاعدة البيانات SQLite وإنشاء الجداول والجداول التلقائية
# وتنفيذ دوال الإضافة والاسترجاع والتحديث المعتمدة للمشروع الجامعي.
# ==============================================================================

import sqlite3
import os

# المسار المباشر لملف قاعدة البيانات
DB_DIR = os.path.join(os.path.dirname(__file__), 'database')
DB_PATH = os.path.join(DB_DIR, 'prompts.db')

def get_connection():
    """
    دالة مساعدة لفتح الاتصال بقاعدة البيانات SQLite
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # لإعادة النتائج على شكل القواميس Dictionaries
    return conn

def create_database():
    """
    دالة إنشاء المجلد الرئيسي لقاعدة البيانات إذا لم يكن موجوداً
    """
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)

def create_tables():
    """
    دالة إنشاء الجداول الرئيسية في قاعدة البيانات:
    1. جدول prompts (الأوامر)
    2. جدول users (المستخدمين والناشرين)
    """
    create_database()
    conn = get_connection()
    cursor = conn.cursor()

    # إنشاء جدول المستخدمين users
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            prompts_count INTEGER DEFAULT 0,
            join_date TEXT NOT NULL
        )
    ''')

    # إنشاء جدول الأوامر prompts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS prompts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            prompt_text TEXT NOT NULL,
            author_name TEXT NOT NULL,
            category TEXT DEFAULT 'AI',
            likes INTEGER DEFAULT 0
        )
    ''')

    conn.commit()
    conn.close()

def seed_data():
    """
    دالة إدخال البيانات التجريبية الأولية باللغة العربية
    لضمان ظهور محتوى واقعي واحترافي عند عرض المشروع أمام الدكتورة.
    """
    create_tables()
    conn = get_connection()
    cursor = conn.cursor()

    # التأكد ما إذا كانت الجداول فارغة قبل إدخال البيانات
    cursor.execute("SELECT COUNT(*) FROM prompts")
    count = cursor.fetchone()[0]

    if count == 0:
        # 1. إدخال مستخدمين تجريبين
        initial_users = [
            ('أحمد المتولي', 'حاسبات ومعلومات - هندسة برمجيات', 3, '2026-01-15'),
            ('سارة العلمي', 'ذكاء اصطناعي وعلم بيانات', 2, '2026-02-01'),
            ('محمد الشمري', 'تسويق وإدارة أعمال', 2, '2026-02-10'),
            ('ريم المنصوري', 'تصميم جرافيك وواجهات UI/UX', 1, '2026-02-20')
        ]

        cursor.executemany('''
            INSERT INTO users (name, specialization, prompts_count, join_date)
            VALUES (?, ?, ?, ?)
        ''', initial_users)

        # 2. إدخال Prompts تجريبية بواقعية عالية
        initial_prompts = [
            (
                '🚀 خطة مذاكرة متكاملة لمدة 30 يومًا لأي مادة جامعية',
                'أمر مذهل يقسم المنهج الدراسي الجامعي إلى جدول يومي مرن بأسلوب Pomodoro مع أسئلة مراجعة نهاية كل أسبوع.',
                '''تصرف كـ "مستشار أكاديمي وخبير في طرق التعلم السريع". 
أريد منك إنشاء خطة دراسية متكاملة لمدة 30 يومًا للمادة التالية: [اسم المادة الجامعية].

شروط الخطة:
1. تقسيم المنهج إلى 4 أسابيع متوازنة (الأساسيات، التعمق، التطبيقات العملية، والمراجعة الشاملة).
2. تحديد 3 أهداف تعليمية واضحة لكل يوم مع جدول زمني (مثال: 45 دقيقة مذاكرة + 15 دقيقة استراحة بأسلوب Pomodoro).
3. إعطاء أسئلة تقييم ذاتي بنهاية كل أسبوع للتأكد من الفهم.
4. اقتراح أفضل الطرق لتلخيص المفاهيم المعقدة في هذه المادة.

يرجى تنظيم الإجابة في جداول منسقة بأسلوب Markdown.''',
                'أحمد المتولي',
                'Education',
                248
            ),
            (
                '💻 أمر كاشف ومصلح الثغرات البرمجية في كود Python',
                'يقوم النموذج بمراجعة الكود البرمجي واستخراج الأخطاء الأمنية ومشاكل الأداء وإعادة كتابته وفق Clean Code.',
                '''أنت Senior Software Architect وخبير في أمن البرمجيات.
قم بمراجعة الكود البرمجي التالي المكتوب بلغة [Python]:

```python
[ضع كود Python الخاص بك هنا]
```

يرجى تقديم تقرير مفصل يشمل:
1. الأخطاء والثغرات البرمجية الأمنية إن وجدت.
2. اختناقات الأداء وكيفية تحسين تعقيد الزمان والمكان (Time & Space Complexity).
3. إعادة كتابة الكود كاملاً وفق مبادئ Clean Code.
4. كتابة اختبارات وحدة (Unit Tests) لتأكيد صحة العمل.''',
                'أحمد المتولي',
                'Programming',
                382
            ),
            (
                '📈 أمر صياغة استراتيجية تسويق رقمي وإعلانات مبتكرة',
                'أمر مخصص لاستخراج شخصيات الجمهور المستهدف وصياغة إعلانات جذابة لـ TikTok و Instagram.',
                '''أنت خبير تسويق رقمي (CMO) لمنتجات وخدمات تقنية.
أريد إنشاء حملة تسويقية لمنتجي الجديد وهو: [اسم ووصف المنتج].

المطلوب:
1. تحديد 3 شخصيات للمشتري (Buyer Personas) تشمل الاهتمامات والمشاكل التي يعانون منها.
2. كتابة 3 نصوص إعلانية قصيرة وجذابة لمنصات التواصل تشمل Hook قوي و Call to Action.
3. خطة محتوى ترويجية وتثقيفية لمدة أسبوعين.''',
                'محمد الشمري',
                'Marketing',
                195
            ),
            (
                '🎨 أمر توليد واجهات تطبيقات زجاجية Glassmorphism لـ Midjourney',
                'أمر دقيق موجه لـ Midjourney لتوليد تصميم واجهات تطبيقات جوال بستايل زجاجي عصري ودقة فائقة.',
                '''Mobile app UI dashboard design, modern fintech application, sleek glassmorphism style, dark violet and cyan gradients, clean typography, hyper-realistic smooth lighting, interactive charts, frosted glass cards, UI/UX concept, Figma design style, 8k resolution, photorealistic, neutral background, --ar 9:16 --v 6.0''',
                'ريم المنصوري',
                'Design',
                420
            ),
            (
                '🔬 أمر تلخيص وصياغة الأوراق والبحوث العلمية المعقدة',
                'يساعد الطلاب والباحثين على تلخيص البحث وتحديد مشكلة البحث والدراسات السابقة بأسلوب أكاديمي دقيق.',
                '''تصرف كـ "باحث أكاديمي ومحكم علمي محترف".
قم بقراءة وتحليل البحث العلمي التالي:
[ضع نص أو ملخص البحث العلمي هنا]

المطلوب:
1. إعطاء تلخيص شامل في 5 نقاط رئيسية.
2. تحديد مشكلة البحث (Research Problem) والمنهجية المستخدمة (Methodology).
3. صياغة أهم التوصيات والنتائج المستخلصة بأسلوب أكاديمي محكم.''',
                'سارة العلمي',
                'Research',
                310
            )
        ]

        cursor.executemany('''
            INSERT INTO prompts (title, description, prompt_text, author_name, category, likes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', initial_prompts)

        conn.commit()

    conn.close()

def get_prompts():
    """
    دالة جلب جميع الأوامر من قاعدة البيانات وتنسيقها في قائمة القواميس List of Dicts
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM prompts ORDER BY id DESC")
    rows = cursor.fetchall()
    
    prompts = []
    for row in rows:
        prompts.append({
            'id': row['id'],
            'title': row['title'],
            'description': row['description'],
            'prompt_text': row['prompt_text'],
            'author_name': row['author_name'],
            'category': row['category'],
            'likes': row['likes']
        })
    
    conn.close()
    return prompts

def get_prompt_by_id(prompt_id):
    """
    دالة جلب أمر محدد بوسطة الرقم التعريفي ID
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM prompts WHERE id = ?", (prompt_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            'id': row['id'],
            'title': row['title'],
            'description': row['description'],
            'prompt_text': row['prompt_text'],
            'author_name': row['author_name'],
            'category': row['category'],
            'likes': row['likes']
        }
    return None

def add_prompt(title, description, prompt_text, author_name, category='AI'):
    """
    دالة إضافة أمر جديد إلى جدول prompts وحفظه في SQLite
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO prompts (title, description, prompt_text, author_name, category, likes)
        VALUES (?, ?, ?, ?, ?, 0)
    ''', (title, description, prompt_text, author_name, category))

    new_id = cursor.lastrowid

    # تحديث عدد الأوامر للناشر في جدول users إذا كان موجودًا
    cursor.execute("UPDATE users SET prompts_count = prompts_count + 1 WHERE name = ?", (author_name,))

    conn.commit()
    conn.close()
    return new_id

def get_users():
    """
    دالة جلب قائمة جميع الناشرين والمستخدمين
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    
    users = []
    for row in rows:
        users.append({
            'id': row['id'],
            'name': row['name'],
            'specialization': row['specialization'],
            'prompts_count': row['prompts_count'],
            'join_date': row['join_date']
        })
    
    conn.close()
    return users

def get_user_by_id(user_id):
    """
    دالة جلب معلومات مستخدم محدد
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            'id': row['id'],
            'name': row['name'],
            'specialization': row['specialization'],
            'prompts_count': row['prompts_count'],
            'join_date': row['join_date']
        }
    return None

def add_user(name, specialization):
    """
    دالة إضافة مستخدم/ناشر جديد
    """
    conn = get_connection()
    cursor = conn.cursor()
    import datetime
    today = datetime.date.today().strftime("%Y-%m-%d")

    cursor.execute('''
        INSERT INTO users (name, specialization, prompts_count, join_date)
        VALUES (?, ?, 0, ?)
    ''', (name, specialization, today))

    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def update_likes(prompt_id):
    """
    دالة زيادة عدد الإعجابات بمقدار 1 وإعادة العدد الجديد
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE prompts SET likes = likes + 1 WHERE id = ?", (prompt_id,))
    conn.commit()

    cursor.execute("SELECT likes FROM prompts WHERE id = ?", (prompt_id,))
    row = cursor.fetchone()
    new_likes = row['likes'] if row else 0

    conn.close()
    return new_likes

# تهيئة وبذر البيانات فور استدعاء الملف لأول مرة
if __name__ == '__main__':
    seed_data()
    print("Database SQLite initialized successfully.")
