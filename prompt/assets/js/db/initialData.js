/* Prompt Hub - Realistic Arabic AI Prompts Demo Dataset */

export const INITIAL_CATEGORIES = [
  { id: 'all', name: 'الكل', icon: '🌟', count: 42 },
  { id: 'trending', name: '🔥 الشائعة', icon: '🔥', count: 12 },
  { id: 'programming', name: '💻 البرمجة', icon: '💻', count: 15 },
  { id: 'education', name: '📚 التعليم والطلاب', icon: '📚', count: 18 },
  { id: 'marketing', name: '📈 التسويق والأعمال', icon: '📈', count: 10 },
  { id: 'design', name: '🎨 التصميم والذكاء', icon: '🎨', count: 8 },
  { id: 'writing', name: '✍️ الكتابة وصناعة المحتوى', icon: '✍️', count: 14 },
  { id: 'ai', name: '🤖 هندسة الأوامر AI', icon: '🤖', count: 20 },
  { id: 'research', name: '🔬 البحوث والتحليل', icon: '🔬', count: 7 }
];

export const INITIAL_USERS = [
  {
    id: 'user_1',
    full_name: 'أحمد المتولي',
    username: 'ahmed_ai',
    email: 'ahmed@prompthub.dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'مهندس ذكاء اصطناعي ومطور برمجيات 🚀 مهتم بهندسة الأوامر Prompt Engineering وتحسين الإنتاجية.',
    followers_count: 1420,
    following_count: 380,
    prompts_count: 24,
    total_likes: 4890,
    date_of_birth: '1998-05-14',
    auth_provider: 'email'
  },
  {
    id: 'user_2',
    full_name: 'سارة العلمي',
    username: 'sara_code',
    email: 'sara@prompthub.dev',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bio: 'باحثة دكتوراة ومصممة واجهات UI/UX 🎨 أشارك أفضل أوامر ChatGPT وClaude للتصميم الأكاديمي.',
    followers_count: 2850,
    following_count: 420,
    prompts_count: 31,
    total_likes: 8320,
    date_of_birth: '2001-09-20',
    auth_provider: 'google'
  },
  {
    id: 'user_3',
    full_name: 'محمد الشمري',
    username: 'm_marketing',
    email: 'm.shammari@prompthub.dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'مستشار تسويق رقمي ورواد أعمال 📈 أساعدك على تحويل أفكارك إلى حملات تسويقية ناجحة بـ AI.',
    followers_count: 980,
    following_count: 150,
    prompts_count: 16,
    total_likes: 2150,
    date_of_birth: '1995-11-03',
    auth_provider: 'email'
  }
];

export const INITIAL_PROMPTS = [
  {
    id: 'prompt_1',
    author: INITIAL_USERS[0],
    title: '🚀 أمر متكامل لإنشاء خطة مذاكرة لمدة 30 يومًا لأي مادة جامعية',
    description: 'يقوم النموذج بتأدية دور استشاري أكاديمي محترف وتقسيم المنهج الجامعي إلى جدول يومي مرن يشمل المراجعة والتطبيقات العملية.',
    prompt_text: `تصرف كـ "مستشار أكاديمي وخبير في طرق التعلم السريع". 
أريد منك إنشاء خطة دراسية متكاملة لمدة 30 يومًا للمادة التالية: [اسم المادة الجامعية].

شروط الخطة:
1. تقسيم المنهج إلى 4 أسابيع متوازنة (الأساسيات، التعمق، التطبيقات العملية، والمراجعة الشاملة).
2. تحديد 3 أهداف تعليمية واضحة لكل يوم مع جدول زمني (مثال: 45 دقيقة مذاكرة + 15 دقيقة استراحة بأسلوب Pomodoro).
3. إعطاء أسئلة تقييم ذاتي بنهاية كل أسبوع للتأكد من الفهم.
4. اقتراح أفضل الطرق لتلخيص المفاهيم المعقدة في هذه المادة.

يرجى تنظيم الإجابة في جداول منسقة بأسلوب Markdown.`,
    category: 'Education',
    category_id: 'education',
    tags: ['#جامعة', '#خطة_مذاكرة', '#ChatGPT', '#طلاب'],
    ai_model: 'ChatGPT',
    difficulty: 'Beginner',
    likes_count: 348,
    copies_count: 187,
    views_count: 2450,
    comments_count: 24,
    is_trending: true,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    comments: [
      {
        id: 'c1',
        author: { full_name: 'عمر الخالد', username: 'omar_k', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
        text: 'أمر خرافي! جربته في مادة خوارزميات البرمجة وأعطاني خطة مذهلة جدًا 👏',
        created_at: new Date(Date.now() - 1800000 * 2).toISOString()
      },
      {
        id: 'c2',
        author: { full_name: 'ريم منصور', username: 'reem_design', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
        text: 'تم الحفظ والنسخ، شكرًا جزيلًا لك على هذا المجهود!',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  },
  {
    id: 'prompt_2',
    author: INITIAL_USERS[1],
    title: '💻 أمر كاشف ومصلح الثغرات البرمجية في كود Python / JS',
    description: 'مساعد برمجي متقدم يقوم بتحليل الكود واستخراج الثغرات والمشاكل الأداء وإعادة كتابته بأفضل ممارسات Clean Code.',
    prompt_text: `أنت Senior Software Architect وخبير في أمن البرمجيات.
قم بمراجعة الكود التالي المكتوب بلغة [Python/JavaScript]:

\`\`\`
[ضع الكود الخاص بك هنا]
\`\`\`

يرجى إعطاء تقرير شامل يحتوي على:
1. الثغرات الأمنية (Security Vulnerabilities) مع مستوى خطورتها (Low, Medium, High).
2. اختناقات الأداء (Performance Bottlenecks) وكيفية تحسين الزمان والمكان (Time & Space Complexity).
3. إعادة كتابة الكود كاملاً بناءً على مبادئ Clean Code و SOLID Principles.
4. إرسال اختبارات وحدة (Unit Tests) مغطية للحالات الحرج (Edge Cases).`,
    category: 'Programming',
    category_id: 'programming',
    tags: ['#Python', '#CleanCode', '#Claude', '#برمجة'],
    ai_model: 'Claude',
    difficulty: 'Advanced',
    likes_count: 512,
    copies_count: 310,
    views_count: 4120,
    comments_count: 42,
    is_trending: true,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    comments: [
      {
        id: 'c3',
        author: INITIAL_USERS[0],
        text: 'استخدمته مع Claude 3.5 Sonnet والنتائج أفضل من أي أداة Static Analysis قمت بتجربتها!',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ]
  },
  {
    id: 'prompt_3',
    author: INITIAL_USERS[2],
    title: '📈 أمر بناء استراتيجية تسويق رقمي واستسقاء الجمهور المستهدف',
    description: 'يستخرج كتل الجماهير الاستهدافية ويكتب الإعلانات المناسبة لمنصات التواصل الاجتماعي لمنتجك أو مشروعك الناشئ.',
    prompt_text: `أنت رئيس قطاع التسويق الرقمي (CMO) في شركة تك ناشئة.
أريد إنشاء خطة إطلاق تسويقية لمنتجنا الجديد وهو: [وصف المنتج وميزته التنافسية].

المطلوب:
1. تحديد 3 شخصيات للمشتري (Buyer Personas) بالتفصيل (العمر، الاهتمامات، المشاكل الدفينة Pain Points).
2. صياغة 5 أفكار إعلانات مبتكرة لـ TikTok و Instagram Reel تشمل (Hook قوي، النص الشارح، الـ Call to Action).
3. جدول للنشر على مدار أسبوعين مع نوع المحتوى (تعليمي، ترفيهي، ترويجي مباشر).
4. اقتراح مؤشرات الأداء الرئيسية (KPIs) لتقييم نجاح الحملة.`,
    category: 'Marketing',
    category_id: 'marketing',
    tags: ['#تسويق', '#مشاريع_ناشئة', '#Gemini', '#Business'],
    ai_model: 'Gemini',
    difficulty: 'Intermediate',
    likes_count: 289,
    copies_count: 145,
    views_count: 1890,
    comments_count: 18,
    is_trending: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    comments: []
  },
  {
    id: 'prompt_4',
    author: INITIAL_USERS[1],
    title: '🎨 أمر توليد صور واجهات استخدام احترافية Glassmorphism لـ Midjourney',
    description: 'أمر دقيق موجه لنموذج Midjourney توليد تصميم واجهات تطبيقات جوال بستايل زجاجي عصري ودقة عالية.',
    prompt_text: `Mobile app UI dashboard design, modern fintech application, sleek glassmorphism style, dark violet and cyan gradients, clean typography, hyper-realistic smooth lighting, interactive charts, frosted glass cards, UI/UX concept, Figma design style, 8k resolution, photorealistic, neutral background, --ar 9:16 --v 6.0`,
    category: 'Design',
    category_id: 'design',
    tags: ['#Midjourney', '#UIUX', '#Design', '#Glassmorphism'],
    ai_model: 'Midjourney',
    difficulty: 'Intermediate',
    likes_count: 670,
    copies_count: 420,
    views_count: 5300,
    comments_count: 35,
    is_trending: true,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    comments: []
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'like',
    actor: INITIAL_USERS[1],
    prompt_id: 'prompt_1',
    text: 'أعجبت بالـ Prompt الخاص بك: "أمر متكامل لإنشاء خطة مذاكرة"',
    time: new Date(Date.now() - 1800000).toISOString(),
    is_read: false
  },
  {
    id: 'n2',
    type: 'comment',
    actor: INITIAL_USERS[2],
    prompt_id: 'prompt_1',
    text: 'علّق على Prompt الخاص بك: "أمر خرافي! جربته في مادة الخوارزميات"',
    time: new Date(Date.now() - 3600000 * 2).toISOString(),
    is_read: false
  },
  {
    id: 'n3',
    type: 'copy',
    actor: { full_name: 'مستخدم جديد', username: 'user_99' },
    prompt_id: 'prompt_1',
    text: 'قام بنسخ الـ Prompt الخاص بك 📋',
    time: new Date(Date.now() - 3600000 * 5).toISOString(),
    is_read: true
  }
];
