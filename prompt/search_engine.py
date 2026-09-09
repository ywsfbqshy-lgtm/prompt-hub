# ==============================================================================
# 🚀 PROMPT HUB - SEARCH ENGINE (search_engine.py)
# ==============================================================================
# هذا الملف يحتوي على خوارزمية البحث الخاصة بالمنصة باستخدام القوائم والحلقات التكرارية.
# يبحث النظام داخل:
# 1. عنوان الأمر (title)
# 2. وصف الأمر (description)
# 3. نص الأمر الأصلي (prompt_text)
# 4. اسم الناشر (author_name)
# ==============================================================================

def search_prompts(query, prompts):
    """
    دالة البحث في قائمة الأوامر بناءً على الكلمة المدخلة من المستخدم.
    
    المعاملات:
    - query: كلمة البحث النصية (مثل "Python" أو "تسويق")
    - prompts: قائمة الأوامر (قائمة من القواميس List of Dicts)
    
    تُعيد:
    - قائمة الأوامر المطابقة لشرط البحث
    """
    # إذا كانت كلمة البحث فارغة أو تحتوي مسافات فقط، نعيد جميع الأوامر
    if not query or query.strip() == "":
        return prompts

    # تحويل نص البحث إلى حروف صغيرة لمنع المشاكل مع الكلمات الإنجليزية
    clean_query = query.strip().lower()
    results = []

    # المرور بالحلقة التكرارية على كل أمر في القائمة
    for prompt in prompts:
        title = prompt.get('title', '').lower()
        description = prompt.get('description', '').lower()
        prompt_text = prompt.get('prompt_text', '').lower()
        author_name = prompt.get('author_name', '').lower()
        category = prompt.get('category', '').lower()

        # فحص وجود الكلمة في أي من الحقول المطلوبة
        if (clean_query in title or
            clean_query in description or
            clean_query in prompt_text or
            clean_query in author_name or
            clean_query in category):
            
            # إضافة الأمر إلى قائمة النتائج
            results.append(prompt)

    return results


# دالة تجربة مباشرة للاختبار المحلي
if __name__ == '__main__':
    sample_prompts = [
        {'id': 1, 'title': 'كود Python', 'description': 'مصلح ثغرات', 'prompt_text': 'print("hello")', 'author_name': 'أحمد'},
        {'id': 2, 'title': 'خطة تسويق', 'description': 'اعلان تجاري', 'prompt_text': 'اريد خطة تسويق', 'author_name': 'سارة'}
    ]

    res = search_prompts("Python", sample_prompts)
    print(f"🔍 عُثر على {len(res)} نتيجة تجريبية للبحث عن Python")
