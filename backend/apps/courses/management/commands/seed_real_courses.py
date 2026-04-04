"""
Seed two real educational courses: HTML5 Essentials (free) and CSS Mastery (paid).
"""
import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.courses.models import (
    Course, Module, Lesson, Quiz, Question, Choice,
    CoursePrerequisite, CourseBadge, CourseFAQ, DripSchedule,
    CourseConcept, CourseExercise,
)
from apps.assignments.models import Assignment
from apps.coupons.models import Coupon, SmartCouponConfig


def p(msg):
    print(f"  ✓ {msg}")


class Command(BaseCommand):
    help = "Seed two real courses with full educational content"

    def handle(self, *args, **options):
        print("\n🚀 Seeding real courses...\n")
        html_course = self.create_html_course()
        css_course = self.create_css_course(html_course)
        self.create_coupons(html_course, css_course)
        print("\n✅ Done! Both courses seeded successfully.\n")

    # ─────────────────────────────────────────────
    # COURSE 1: HTML5 Essentials
    # ─────────────────────────────────────────────
    def create_html_course(self):
        course, created = Course.objects.update_or_create(
            slug='html5-essentials',
            defaults=dict(
                title={'en': 'Basic Web Development with HTML5'},
                description={'en': 'Learn HTML5 from scratch. This comprehensive course covers everything from basic tags to modern HTML5 APIs. Perfect for absolute beginners who want to build real web pages.'},
                price=Decimal('0.00'),
                is_free=True,
                category='Web Development',
                level='beginner',
                duration=480,
                thumbnail='https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=800',
                is_featured=True,
                enable_certificates=True,
                enable_discussions=True,
                enable_drip=True,
                enable_quizzes=True,
                enable_assignments=True,
                enable_prerequisites=False,
                drip_enabled=True,
                drip_type='timed',
                what_youll_learn=[
                    'Write clean, semantic HTML5 markup',
                    'Build forms with validation',
                    'Embed multimedia content',
                    'Use modern HTML5 APIs',
                    'Create accessible web pages',
                    'Structure documents with semantic elements',
                ],
                who_should_take={'en': 'Complete beginners who want to learn web development from scratch.'},
            ),
        )
        action = "Created" if created else "Updated"
        print(f"📘 {action} course: HTML5 Essentials")

        # Clear old data
        course.modules.all().delete()
        course.quizzes.all().delete()
        course.assignments.all().delete()
        course.badges.all().delete()
        course.faqs.all().delete()
        course.drip_schedules.all().delete()
        course.concepts.all().delete()

        modules_data = self._html_modules_data()
        for mi, mdata in enumerate(modules_data):
            mod = Module.objects.create(course=course, title={'en': mdata['title']}, order=mi)
            p(f"Module {mi+1}: {mdata['title']}")
            for li, ldata in enumerate(mdata['lessons']):
                lesson = Lesson.objects.create(
                    module=mod,
                    title={'en': ldata['title']},
                    content={'en': ldata.get('content', '')},
                    lesson_type=ldata.get('type', 'text'),
                    video_url=ldata.get('video_url', ''),
                    video_source=ldata.get('video_source', ''),
                    video_duration=ldata.get('video_duration', ''),
                    duration=ldata.get('duration', 10),
                    order=li,
                    slides_data=ldata.get('slides_data', []),
                    is_free_preview=ldata.get('is_free_preview', False),
                    drip_days_after_enrollment=ldata.get('drip_days', None),
                )
                # Create quiz if lesson is quiz type
                if ldata.get('type') == 'quiz' and 'quiz_data' in ldata:
                    qd = ldata['quiz_data']
                    quiz = Quiz.objects.create(
                        course=course, module=mod,
                        title={'en': qd['title']},
                        quiz_type='module_quiz',
                        passing_grade=qd.get('passing_grade', 60),
                        time_limit=qd.get('time_limit', 15),
                        show_correct_answers=True,
                        randomize_questions=True,
                        order=li,
                    )
                    for qi, question in enumerate(qd['questions']):
                        q = Question.objects.create(
                            quiz=quiz,
                            text=question['text'],
                            question_type=question['type'],
                            order=qi,
                            explanation=question.get('explanation', ''),
                            correct_text=question.get('correct_text', ''),
                            points=question.get('points', 1),
                        )
                        for ci, choice in enumerate(question.get('choices', [])):
                            Choice.objects.create(
                                question=q,
                                text=choice['text'],
                                is_correct=choice.get('correct', False),
                                order=ci,
                            )
                    quiz.questions_count = len(qd['questions'])
                    quiz.save()
                    lesson.quiz = quiz
                    lesson.save()
                    p(f"  Quiz: {qd['title']} ({len(qd['questions'])} questions)")

                # Create assignment if lesson is assignment type
                if ldata.get('type') == 'assignment' and 'assignment_data' in ldata:
                    ad = ldata['assignment_data']
                    Assignment.objects.create(
                        course=course, lesson=lesson,
                        title=ad['title'],
                        description=ad['description'],
                        submission_type=ad.get('submission_type', 'text'),
                        answer_type=ad.get('answer_type', 'essay'),
                        points=ad.get('points', 100),
                        rubric=ad.get('rubric', ''),
                        starter_code=ad.get('starter_code', ''),
                        max_attempts=ad.get('max_attempts', 3),
                    )
                    p(f"  Assignment: {ad['title']}")

        # Exercises (CourseExercise via CourseConcept)
        self._create_html_exercises(course)

        # Badges
        for b in [
            ('html-beginner', 'HTML Beginner', 'Complete your first HTML module', 'first_exercise'),
            ('form-master', 'Form Master', 'Complete all form exercises', 'concept_complete'),
            ('semantic-pro', 'Semantic Pro', 'Master semantic HTML elements', 'all_exercises'),
        ]:
            CourseBadge.objects.create(course=course, slug=b[0], name=b[1], description=b[2], criteria_type=b[3])
        p("Badges created")

        # FAQs
        for i, faq in enumerate([
            ("Do I need any prior programming experience?", "No! This course is designed for absolute beginners. You just need a computer and a web browser."),
            ("What software do I need?", "Just a text editor (we recommend VS Code, which is free) and a modern web browser like Chrome or Firefox."),
            ("How long will it take to complete?", "The course is about 8 hours of content, but most students complete it in 2-3 weeks studying a few hours per week."),
            ("Will I get a certificate?", "Yes! Upon completing all modules and passing the quizzes, you'll receive a certificate of completion."),
        ]):
            CourseFAQ.objects.create(course=course, question=faq[0], answer=faq[1], order=i)
        p("FAQs created")

        # Drip schedules: first 3 modules immediate, rest weekly
        for mod in course.modules.all():
            days = 0 if mod.order < 3 else (mod.order - 2) * 7
            DripSchedule.objects.create(
                course=course, module=mod,
                drip_type='days_after_enrollment',
                days_after=days,
            )
        p("Drip schedules created")

        return course

    def _html_modules_data(self):
        return [
            # ── Module 1: Getting Started ──
            {
                'title': 'Getting Started with HTML',
                'lessons': [
                    {
                        'title': 'What is HTML?',
                        'type': 'text',
                        'is_free_preview': True,
                        'content': '''<h2>What is HTML?</h2>
<p><strong>HTML</strong> (HyperText Markup Language) is the standard language for creating web pages. It describes the structure of a web page using a series of elements (tags).</p>

<h3>Key Concepts</h3>
<ul>
<li><strong>HyperText</strong> — text that links to other text (hyperlinks)</li>
<li><strong>Markup</strong> — annotations that define the structure and meaning of content</li>
<li><strong>Language</strong> — a standardized set of rules browsers understand</li>
</ul>

<h3>A Simple Example</h3>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My First Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello, World!&lt;/h1&gt;
    &lt;p&gt;This is my first web page.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

<p>Every HTML document starts with <code>&lt;!DOCTYPE html&gt;</code> which tells the browser this is an HTML5 document. The <code>&lt;html&gt;</code> element is the root, containing <code>&lt;head&gt;</code> (metadata) and <code>&lt;body&gt;</code> (visible content).</p>''',
                        'duration': 10,
                    },
                    {
                        'title': 'Setting Up Your Editor (VS Code)',
                        'type': 'video',
                        'video_url': 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
                        'video_source': 'youtube',
                        'video_duration': '12m 30s',
                        'content': '<p>In this video, we set up Visual Studio Code for HTML development. You\'ll install the Live Server extension and learn essential shortcuts.</p>',
                        'duration': 13,
                    },
                    {
                        'title': 'Your First HTML Page',
                        'type': 'text',
                        'content': '''<h2>Creating Your First HTML Page</h2>
<p>Let's create a complete HTML page step by step.</p>

<h3>Step 1: Create the file</h3>
<p>Create a new file called <code>index.html</code> in your project folder.</p>

<h3>Step 2: Add the boilerplate</h3>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;My First Page&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Welcome to My Website&lt;/h1&gt;
    &lt;p&gt;This is a paragraph of text.&lt;/p&gt;
    &lt;p&gt;HTML is &lt;strong&gt;easy&lt;/strong&gt; to learn!&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

<h3>Step 3: Open in browser</h3>
<p>Right-click the file and select "Open with Live Server" (if using VS Code) or simply double-click the file to open it in your browser.</p>

<h3>Understanding the boilerplate</h3>
<ul>
<li><code>&lt;!DOCTYPE html&gt;</code> — Declares HTML5</li>
<li><code>&lt;html lang="en"&gt;</code> — Root element with language attribute</li>
<li><code>&lt;meta charset="UTF-8"&gt;</code> — Character encoding for international characters</li>
<li><code>&lt;meta name="viewport"...&gt;</code> — Makes the page responsive on mobile</li>
<li><code>&lt;title&gt;</code> — Text shown in the browser tab</li>
</ul>''',
                        'duration': 15,
                    },
                    {
                        'title': 'Understanding HTML Structure',
                        'type': 'text',
                        'content': '''<h2>HTML Document Structure</h2>
<p>Every HTML element has an <strong>opening tag</strong>, <strong>content</strong>, and a <strong>closing tag</strong>.</p>

<pre><code>&lt;tagname&gt;Content goes here&lt;/tagname&gt;</code></pre>

<h3>Nesting Elements</h3>
<p>Elements can contain other elements. This creates a tree-like structure called the <strong>DOM</strong> (Document Object Model).</p>

<pre><code>&lt;div&gt;
    &lt;h2&gt;Section Title&lt;/h2&gt;
    &lt;p&gt;A paragraph with &lt;strong&gt;bold text&lt;/strong&gt; inside.&lt;/p&gt;
&lt;/div&gt;</code></pre>

<h3>Self-Closing Tags</h3>
<p>Some elements don't have content and don't need a closing tag:</p>
<pre><code>&lt;br&gt;       &lt;!-- Line break --&gt;
&lt;hr&gt;       &lt;!-- Horizontal rule --&gt;
&lt;img src="photo.jpg" alt="A photo"&gt;
&lt;input type="text"&gt;</code></pre>

<h3>Attributes</h3>
<p>Attributes provide additional information about elements:</p>
<pre><code>&lt;a href="https://example.com" target="_blank"&gt;Visit Example&lt;/a&gt;
&lt;img src="logo.png" alt="Company Logo" width="200"&gt;</code></pre>''',
                        'duration': 12,
                    },
                ],
            },
            # ── Module 2: Text & Formatting ──
            {
                'title': 'HTML Text & Formatting',
                'lessons': [
                    {
                        'title': 'Headings and Paragraphs',
                        'type': 'text',
                        'content': '''<h2>Headings</h2>
<p>HTML has six levels of headings, from <code>&lt;h1&gt;</code> (most important) to <code>&lt;h6&gt;</code> (least important).</p>

<pre><code>&lt;h1&gt;Main Title&lt;/h1&gt;
&lt;h2&gt;Section Title&lt;/h2&gt;
&lt;h3&gt;Subsection Title&lt;/h3&gt;
&lt;h4&gt;Sub-subsection&lt;/h4&gt;
&lt;h5&gt;Minor heading&lt;/h5&gt;
&lt;h6&gt;Smallest heading&lt;/h6&gt;</code></pre>

<p><strong>Best Practice:</strong> Use only one <code>&lt;h1&gt;</code> per page. Don't skip heading levels (e.g., don't go from h2 to h4).</p>

<h2>Paragraphs</h2>
<pre><code>&lt;p&gt;This is a paragraph. Browsers add space before and after paragraphs automatically.&lt;/p&gt;
&lt;p&gt;This is another paragraph. Notice the spacing between them.&lt;/p&gt;</code></pre>

<h2>Line Breaks &amp; Horizontal Rules</h2>
<pre><code>&lt;p&gt;Line one&lt;br&gt;Line two (forced break)&lt;/p&gt;
&lt;hr&gt;  &lt;!-- Horizontal divider --&gt;</code></pre>''',
                        'duration': 10,
                    },
                    {
                        'title': 'Bold, Italic, and Underline',
                        'type': 'text',
                        'content': '''<h2>Text Formatting Elements</h2>

<h3>Bold Text</h3>
<pre><code>&lt;strong&gt;Important text&lt;/strong&gt;  &lt;!-- Semantic: important --&gt;
&lt;b&gt;Bold text&lt;/b&gt;              &lt;!-- Visual only --&gt;</code></pre>

<h3>Italic Text</h3>
<pre><code>&lt;em&gt;Emphasized text&lt;/em&gt;      &lt;!-- Semantic: emphasis --&gt;
&lt;i&gt;Italic text&lt;/i&gt;            &lt;!-- Visual only --&gt;</code></pre>

<h3>Other Formatting</h3>
<pre><code>&lt;u&gt;Underlined text&lt;/u&gt;
&lt;s&gt;Strikethrough text&lt;/s&gt;
&lt;mark&gt;Highlighted text&lt;/mark&gt;
&lt;small&gt;Smaller text&lt;/small&gt;
&lt;sub&gt;Subscript&lt;/sub&gt; H&lt;sub&gt;2&lt;/sub&gt;O
&lt;sup&gt;Superscript&lt;/sup&gt; x&lt;sup&gt;2&lt;/sup&gt;
&lt;code&gt;Inline code&lt;/code&gt;
&lt;pre&gt;Preformatted text (preserves whitespace)&lt;/pre&gt;</code></pre>

<p><strong>Tip:</strong> Use <code>&lt;strong&gt;</code> and <code>&lt;em&gt;</code> instead of <code>&lt;b&gt;</code> and <code>&lt;i&gt;</code> for better accessibility and SEO.</p>''',
                        'duration': 8,
                    },
                    {
                        'title': 'Lists: Ordered and Unordered',
                        'type': 'text',
                        'content': '''<h2>HTML Lists</h2>

<h3>Unordered List (Bullet Points)</h3>
<pre><code>&lt;ul&gt;
    &lt;li&gt;HTML&lt;/li&gt;
    &lt;li&gt;CSS&lt;/li&gt;
    &lt;li&gt;JavaScript&lt;/li&gt;
&lt;/ul&gt;</code></pre>

<h3>Ordered List (Numbered)</h3>
<pre><code>&lt;ol&gt;
    &lt;li&gt;Learn HTML&lt;/li&gt;
    &lt;li&gt;Learn CSS&lt;/li&gt;
    &lt;li&gt;Learn JavaScript&lt;/li&gt;
&lt;/ol&gt;</code></pre>

<h3>Nested Lists</h3>
<pre><code>&lt;ul&gt;
    &lt;li&gt;Frontend
        &lt;ul&gt;
            &lt;li&gt;HTML&lt;/li&gt;
            &lt;li&gt;CSS&lt;/li&gt;
        &lt;/ul&gt;
    &lt;/li&gt;
    &lt;li&gt;Backend
        &lt;ul&gt;
            &lt;li&gt;Python&lt;/li&gt;
            &lt;li&gt;Node.js&lt;/li&gt;
        &lt;/ul&gt;
    &lt;/li&gt;
&lt;/ul&gt;</code></pre>

<h3>Description Lists</h3>
<pre><code>&lt;dl&gt;
    &lt;dt&gt;HTML&lt;/dt&gt;
    &lt;dd&gt;HyperText Markup Language — the structure of web pages&lt;/dd&gt;
    &lt;dt&gt;CSS&lt;/dt&gt;
    &lt;dd&gt;Cascading Style Sheets — the presentation of web pages&lt;/dd&gt;
&lt;/dl&gt;</code></pre>''',
                        'duration': 10,
                    },
                    {
                        'title': 'Blockquotes and Preformatted Text',
                        'type': 'text',
                        'content': '''<h2>Blockquotes</h2>
<pre><code>&lt;blockquote cite="https://www.w3.org/html/"&gt;
    &lt;p&gt;HTML is the standard markup language for creating web pages.&lt;/p&gt;
    &lt;footer&gt;— &lt;cite&gt;W3C&lt;/cite&gt;&lt;/footer&gt;
&lt;/blockquote&gt;</code></pre>

<h2>Preformatted Text</h2>
<p>The <code>&lt;pre&gt;</code> tag preserves both spaces and line breaks:</p>
<pre><code>&lt;pre&gt;
    This    text    preserves
    all     spacing and
    line breaks exactly as written.
&lt;/pre&gt;</code></pre>

<h2>Code Blocks</h2>
<p>Combine <code>&lt;pre&gt;</code> and <code>&lt;code&gt;</code> for code blocks:</p>
<pre><code>&lt;pre&gt;&lt;code&gt;
function greet(name) {
    return "Hello, " + name + "!";
}
&lt;/code&gt;&lt;/pre&gt;</code></pre>''',
                        'duration': 8,
                    },
                ],
            },
            # ── Module 3: Links & Images ──
            {
                'title': 'Links & Images',
                'lessons': [
                    {
                        'title': 'Anchor Tags and Hyperlinks',
                        'type': 'text',
                        'content': '''<h2>Creating Links with &lt;a&gt;</h2>

<h3>Basic Link</h3>
<pre><code>&lt;a href="https://www.example.com"&gt;Visit Example&lt;/a&gt;</code></pre>

<h3>Open in New Tab</h3>
<pre><code>&lt;a href="https://www.example.com" target="_blank" rel="noopener noreferrer"&gt;
    Visit Example (new tab)
&lt;/a&gt;</code></pre>
<p><strong>Security tip:</strong> Always add <code>rel="noopener noreferrer"</code> when using <code>target="_blank"</code>.</p>

<h3>Link to Email / Phone</h3>
<pre><code>&lt;a href="mailto:hello@example.com"&gt;Email us&lt;/a&gt;
&lt;a href="tel:+1234567890"&gt;Call us&lt;/a&gt;</code></pre>

<h3>Page Anchors (Jump Links)</h3>
<pre><code>&lt;a href="#section2"&gt;Jump to Section 2&lt;/a&gt;

&lt;!-- Somewhere on the page: --&gt;
&lt;h2 id="section2"&gt;Section 2&lt;/h2&gt;</code></pre>''',
                        'duration': 10,
                    },
                    {
                        'title': 'Relative vs Absolute URLs',
                        'type': 'text',
                        'content': '''<h2>URL Types</h2>

<h3>Absolute URLs</h3>
<p>Full path including protocol and domain:</p>
<pre><code>&lt;a href="https://www.example.com/about.html"&gt;About&lt;/a&gt;
&lt;img src="https://www.example.com/images/logo.png"&gt;</code></pre>

<h3>Relative URLs</h3>
<p>Path relative to the current file:</p>
<pre><code>&lt;!-- Same folder --&gt;
&lt;a href="about.html"&gt;About&lt;/a&gt;

&lt;!-- Subfolder --&gt;
&lt;a href="pages/contact.html"&gt;Contact&lt;/a&gt;

&lt;!-- Parent folder --&gt;
&lt;a href="../index.html"&gt;Home&lt;/a&gt;

&lt;!-- Root-relative (from domain root) --&gt;
&lt;a href="/about.html"&gt;About&lt;/a&gt;</code></pre>

<h3>When to Use Which?</h3>
<table>
<tr><th>Use Case</th><th>URL Type</th></tr>
<tr><td>Linking to external sites</td><td>Absolute</td></tr>
<tr><td>Linking within your site</td><td>Relative</td></tr>
<tr><td>CDN resources</td><td>Absolute</td></tr>
<tr><td>Local images/files</td><td>Relative</td></tr>
</table>''',
                        'duration': 8,
                    },
                    {
                        'title': 'Images in HTML',
                        'type': 'text',
                        'content': '''<h2>The &lt;img&gt; Element</h2>

<pre><code>&lt;img src="photo.jpg" alt="Description of the photo" width="600" height="400"&gt;</code></pre>

<h3>Essential Attributes</h3>
<ul>
<li><code>src</code> — Path to the image file (required)</li>
<li><code>alt</code> — Alternative text for accessibility and SEO (required)</li>
<li><code>width</code> / <code>height</code> — Dimensions (prevents layout shift)</li>
<li><code>loading="lazy"</code> — Lazy load images below the fold</li>
</ul>

<h3>Responsive Images</h3>
<pre><code>&lt;img src="small.jpg"
     srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
     sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
     alt="Responsive image example"&gt;</code></pre>

<h3>Image Formats</h3>
<ul>
<li><strong>JPEG</strong> — Photos, complex images</li>
<li><strong>PNG</strong> — Transparency, screenshots, graphics</li>
<li><strong>WebP</strong> — Modern format, smaller file sizes</li>
<li><strong>SVG</strong> — Vector graphics, logos, icons</li>
<li><strong>GIF</strong> — Simple animations</li>
</ul>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Figure and Figcaption',
                        'type': 'text',
                        'content': '''<h2>Semantic Image Containers</h2>

<p>Use <code>&lt;figure&gt;</code> and <code>&lt;figcaption&gt;</code> to add captions to images:</p>

<pre><code>&lt;figure&gt;
    &lt;img src="sunset.jpg" alt="A beautiful sunset over the ocean"&gt;
    &lt;figcaption&gt;Sunset at Malibu Beach, California&lt;/figcaption&gt;
&lt;/figure&gt;</code></pre>

<p><code>&lt;figure&gt;</code> can also wrap other content like code blocks, quotes, or diagrams:</p>

<pre><code>&lt;figure&gt;
    &lt;pre&gt;&lt;code&gt;
    const greeting = "Hello, World!";
    console.log(greeting);
    &lt;/code&gt;&lt;/pre&gt;
    &lt;figcaption&gt;A simple JavaScript greeting&lt;/figcaption&gt;
&lt;/figure&gt;</code></pre>''',
                        'duration': 6,
                    },
                ],
            },
            # ── Module 4: HTML Tables ──
            {
                'title': 'HTML Tables',
                'lessons': [
                    {
                        'title': 'Table Structure',
                        'type': 'text',
                        'content': '''<h2>Building HTML Tables</h2>

<pre><code>&lt;table&gt;
    &lt;thead&gt;
        &lt;tr&gt;
            &lt;th&gt;Name&lt;/th&gt;
            &lt;th&gt;Age&lt;/th&gt;
            &lt;th&gt;City&lt;/th&gt;
        &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
        &lt;tr&gt;
            &lt;td&gt;Alice&lt;/td&gt;
            &lt;td&gt;25&lt;/td&gt;
            &lt;td&gt;New York&lt;/td&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
            &lt;td&gt;Bob&lt;/td&gt;
            &lt;td&gt;30&lt;/td&gt;
            &lt;td&gt;London&lt;/td&gt;
        &lt;/tr&gt;
    &lt;/tbody&gt;
    &lt;tfoot&gt;
        &lt;tr&gt;
            &lt;td colspan="3"&gt;Total: 2 people&lt;/td&gt;
        &lt;/tr&gt;
    &lt;/tfoot&gt;
&lt;/table&gt;</code></pre>

<h3>Key Elements</h3>
<ul>
<li><code>&lt;table&gt;</code> — The table container</li>
<li><code>&lt;thead&gt;</code>, <code>&lt;tbody&gt;</code>, <code>&lt;tfoot&gt;</code> — Table sections</li>
<li><code>&lt;tr&gt;</code> — Table row</li>
<li><code>&lt;th&gt;</code> — Header cell (bold, centered by default)</li>
<li><code>&lt;td&gt;</code> — Data cell</li>
</ul>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Spanning Rows and Columns',
                        'type': 'text',
                        'content': '''<h2>Merging Cells</h2>

<h3>Column Span</h3>
<pre><code>&lt;table border="1"&gt;
    &lt;tr&gt;
        &lt;th colspan="2"&gt;Full Name&lt;/th&gt;
        &lt;th&gt;Age&lt;/th&gt;
    &lt;/tr&gt;
    &lt;tr&gt;
        &lt;td&gt;First&lt;/td&gt;
        &lt;td&gt;Last&lt;/td&gt;
        &lt;td&gt;25&lt;/td&gt;
    &lt;/tr&gt;
&lt;/table&gt;</code></pre>

<h3>Row Span</h3>
<pre><code>&lt;table border="1"&gt;
    &lt;tr&gt;
        &lt;th rowspan="2"&gt;Name&lt;/th&gt;
        &lt;td&gt;Morning&lt;/td&gt;
    &lt;/tr&gt;
    &lt;tr&gt;
        &lt;td&gt;Afternoon&lt;/td&gt;
    &lt;/tr&gt;
&lt;/table&gt;</code></pre>

<p><strong>Tip:</strong> When using <code>colspan</code> or <code>rowspan</code>, count your cells carefully — the total cells per row must be consistent.</p>''',
                        'duration': 10,
                    },
                    {
                        'title': 'HTML Tables Quiz',
                        'type': 'quiz',
                        'duration': 15,
                        'quiz_data': {
                            'title': 'HTML Tables Quiz',
                            'passing_grade': 60,
                            'time_limit': 10,
                            'questions': [
                                {
                                    'text': 'Which tag defines a table header cell?',
                                    'type': 'single_choice',
                                    'explanation': '<th> is used for header cells, while <td> is for data cells.',
                                    'choices': [
                                        {'text': '<th>', 'correct': True},
                                        {'text': '<td>', 'correct': False},
                                        {'text': '<thead>', 'correct': False},
                                        {'text': '<header>', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'The <thead>, <tbody>, and <tfoot> elements are required in every HTML table.',
                                    'type': 'true_false',
                                    'explanation': 'These are optional but recommended for accessibility and styling.',
                                    'choices': [
                                        {'text': 'True', 'correct': False},
                                        {'text': 'False', 'correct': True},
                                    ],
                                },
                                {
                                    'text': 'What attribute is used to merge cells horizontally?',
                                    'type': 'fill_blank',
                                    'correct_text': 'colspan',
                                    'explanation': 'colspan="2" merges two columns into one cell.',
                                },
                                {
                                    'text': 'Which elements can be direct children of <table>? (Select all that apply)',
                                    'type': 'multi_choice',
                                    'explanation': 'Valid direct children of <table> include thead, tbody, tfoot, tr, caption, and colgroup.',
                                    'choices': [
                                        {'text': '<thead>', 'correct': True},
                                        {'text': '<tr>', 'correct': True},
                                        {'text': '<td>', 'correct': False},
                                        {'text': '<caption>', 'correct': True},
                                        {'text': '<div>', 'correct': False},
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
            # ── Module 5: HTML Forms ──
            {
                'title': 'HTML Forms',
                'lessons': [
                    {
                        'title': 'Form Basics',
                        'type': 'text',
                        'content': '''<h2>HTML Forms</h2>
<p>Forms collect user input and send it to a server for processing.</p>

<pre><code>&lt;form action="/submit" method="POST"&gt;
    &lt;label for="name"&gt;Name:&lt;/label&gt;
    &lt;input type="text" id="name" name="name" required&gt;

    &lt;label for="email"&gt;Email:&lt;/label&gt;
    &lt;input type="email" id="email" name="email" required&gt;

    &lt;button type="submit"&gt;Submit&lt;/button&gt;
&lt;/form&gt;</code></pre>

<h3>Form Attributes</h3>
<ul>
<li><code>action</code> — URL where form data is sent</li>
<li><code>method</code> — HTTP method: GET (in URL) or POST (in body)</li>
<li><code>enctype</code> — Encoding type (use <code>multipart/form-data</code> for file uploads)</li>
</ul>

<h3>Labels</h3>
<p>Always use <code>&lt;label&gt;</code> with the <code>for</code> attribute matching the input's <code>id</code>. This improves accessibility and makes the label clickable.</p>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Input Types',
                        'type': 'text',
                        'content': '''<h2>HTML5 Input Types</h2>

<pre><code>&lt;!-- Text inputs --&gt;
&lt;input type="text" placeholder="Your name"&gt;
&lt;input type="email" placeholder="you@example.com"&gt;
&lt;input type="password" placeholder="••••••"&gt;
&lt;input type="url" placeholder="https://..."&gt;
&lt;input type="tel" placeholder="+1 234 567 890"&gt;
&lt;input type="search" placeholder="Search..."&gt;

&lt;!-- Number inputs --&gt;
&lt;input type="number" min="0" max="100" step="1"&gt;
&lt;input type="range" min="0" max="100" value="50"&gt;

&lt;!-- Date/Time inputs --&gt;
&lt;input type="date"&gt;
&lt;input type="time"&gt;
&lt;input type="datetime-local"&gt;
&lt;input type="month"&gt;
&lt;input type="week"&gt;

&lt;!-- Other --&gt;
&lt;input type="color" value="#ff0000"&gt;
&lt;input type="file" accept="image/*"&gt;
&lt;input type="hidden" name="token" value="abc123"&gt;</code></pre>

<p>HTML5 input types provide built-in validation and mobile-friendly keyboards!</p>''',
                        'duration': 10,
                    },
                    {
                        'title': 'Select, Textarea, Radio & Checkbox',
                        'type': 'text',
                        'content': '''<h2>Other Form Controls</h2>

<h3>Select (Dropdown)</h3>
<pre><code>&lt;label for="country"&gt;Country:&lt;/label&gt;
&lt;select id="country" name="country"&gt;
    &lt;option value=""&gt;Choose...&lt;/option&gt;
    &lt;option value="us"&gt;United States&lt;/option&gt;
    &lt;option value="uk"&gt;United Kingdom&lt;/option&gt;
    &lt;option value="ae"&gt;UAE&lt;/option&gt;
&lt;/select&gt;</code></pre>

<h3>Textarea</h3>
<pre><code>&lt;label for="message"&gt;Message:&lt;/label&gt;
&lt;textarea id="message" name="message" rows="5" cols="40"
          placeholder="Write your message..."&gt;&lt;/textarea&gt;</code></pre>

<h3>Radio Buttons (Choose one)</h3>
<pre><code>&lt;fieldset&gt;
    &lt;legend&gt;Gender:&lt;/legend&gt;
    &lt;label&gt;&lt;input type="radio" name="gender" value="male"&gt; Male&lt;/label&gt;
    &lt;label&gt;&lt;input type="radio" name="gender" value="female"&gt; Female&lt;/label&gt;
    &lt;label&gt;&lt;input type="radio" name="gender" value="other"&gt; Other&lt;/label&gt;
&lt;/fieldset&gt;</code></pre>

<h3>Checkboxes (Choose multiple)</h3>
<pre><code>&lt;fieldset&gt;
    &lt;legend&gt;Skills:&lt;/legend&gt;
    &lt;label&gt;&lt;input type="checkbox" name="skills" value="html"&gt; HTML&lt;/label&gt;
    &lt;label&gt;&lt;input type="checkbox" name="skills" value="css"&gt; CSS&lt;/label&gt;
    &lt;label&gt;&lt;input type="checkbox" name="skills" value="js"&gt; JavaScript&lt;/label&gt;
&lt;/fieldset&gt;</code></pre>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Form Validation',
                        'type': 'video',
                        'video_url': 'https://www.youtube.com/watch?v=fNcJuPIZ2WE',
                        'video_source': 'youtube',
                        'video_duration': '15m 20s',
                        'content': '''<p>HTML5 provides built-in form validation without JavaScript:</p>
<pre><code>&lt;form&gt;
    &lt;input type="text" required minlength="2" maxlength="50"&gt;
    &lt;input type="email" required&gt;
    &lt;input type="number" min="18" max="120"&gt;
    &lt;input type="text" pattern="[A-Za-z]{3,}" title="At least 3 letters"&gt;
    &lt;button type="submit"&gt;Submit&lt;/button&gt;
&lt;/form&gt;</code></pre>''',
                        'duration': 15,
                    },
                    {
                        'title': 'Build a Contact Form',
                        'type': 'assignment',
                        'content': '<p>In this assignment, you will build a complete contact form using HTML5.</p>',
                        'duration': 30,
                        'assignment_data': {
                            'title': 'Build a Contact Form',
                            'description': '''Build a complete HTML contact form with the following requirements:

1. Full name (text input, required, min 2 characters)
2. Email address (email input, required)
3. Phone number (tel input, optional)
4. Subject (select dropdown with at least 4 options)
5. Message (textarea, required, min 10 characters)
6. Preferred contact method (radio buttons: Email, Phone, Either)
7. Subscribe to newsletter (checkbox)
8. Submit button

Requirements:
- Use proper <label> elements with `for` attributes
- Use <fieldset> and <legend> where appropriate
- Add HTML5 validation attributes (required, minlength, pattern, etc.)
- Use semantic structure
- The form should have action="/contact" and method="POST"''',
                            'submission_type': 'code',
                            'answer_type': 'code_any',
                            'points': 100,
                            'max_attempts': 3,
                            'rubric': 'Labels: 15pts | Input types: 20pts | Validation: 20pts | Fieldset/Legend: 15pts | Structure: 15pts | Completeness: 15pts',
                        },
                    },
                ],
            },
            # ── Module 6: Semantic HTML5 ──
            {
                'title': 'Semantic HTML5',
                'lessons': [
                    {
                        'title': 'Introduction to Semantic HTML',
                        'type': 'slides',
                        'duration': 15,
                        'slides_data': [
                            {'title': 'What is Semantic HTML?', 'content': 'Semantic HTML uses meaningful tags that describe their content. Instead of <div> for everything, use <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>.'},
                            {'title': 'Why Semantic HTML Matters', 'content': '1. Accessibility — Screen readers understand page structure\n2. SEO — Search engines understand content hierarchy\n3. Maintainability — Code is self-documenting\n4. Consistency — Standard way to structure pages'},
                            {'title': 'Semantic vs Non-Semantic', 'content': 'Non-semantic: <div class="header">, <div class="nav">, <div class="footer">\n\nSemantic: <header>, <nav>, <footer>\n\nBoth look the same visually, but semantic HTML tells browsers and screen readers what each section means.'},
                            {'title': 'The Semantic Elements', 'content': '<header> — Page or section header\n<nav> — Navigation links\n<main> — Main content (one per page)\n<article> — Independent, self-contained content\n<section> — Thematic grouping of content\n<aside> — Sidebar, related content\n<footer> — Page or section footer'},
                            {'title': 'A Complete Semantic Page', 'content': '<header>\n  <nav>...</nav>\n</header>\n<main>\n  <article>\n    <section>...</section>\n    <section>...</section>\n  </article>\n  <aside>...</aside>\n</main>\n<footer>...</footer>'},
                        ],
                        'content': '<p>Slide-based overview of semantic HTML5 elements.</p>',
                    },
                    {
                        'title': 'Header, Nav, Main, and Footer',
                        'type': 'text',
                        'content': '''<h2>Page Structure Elements</h2>

<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;My Website&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;header&gt;
        &lt;h1&gt;My Website&lt;/h1&gt;
        &lt;nav&gt;
            &lt;ul&gt;
                &lt;li&gt;&lt;a href="/"&gt;Home&lt;/a&gt;&lt;/li&gt;
                &lt;li&gt;&lt;a href="/about"&gt;About&lt;/a&gt;&lt;/li&gt;
                &lt;li&gt;&lt;a href="/contact"&gt;Contact&lt;/a&gt;&lt;/li&gt;
            &lt;/ul&gt;
        &lt;/nav&gt;
    &lt;/header&gt;

    &lt;main&gt;
        &lt;h2&gt;Welcome&lt;/h2&gt;
        &lt;p&gt;This is the main content area.&lt;/p&gt;
    &lt;/main&gt;

    &lt;footer&gt;
        &lt;p&gt;&amp;copy; 2024 My Website. All rights reserved.&lt;/p&gt;
    &lt;/footer&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

<h3>Rules</h3>
<ul>
<li>Use only <strong>one</strong> <code>&lt;main&gt;</code> per page</li>
<li><code>&lt;header&gt;</code> and <code>&lt;footer&gt;</code> can appear multiple times (page-level and within articles)</li>
<li><code>&lt;nav&gt;</code> is for major navigation blocks, not every link</li>
</ul>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Section, Article, and Aside',
                        'type': 'text',
                        'content': '''<h2>Content Grouping Elements</h2>

<h3>&lt;article&gt;</h3>
<p>Self-contained content that could be independently distributed:</p>
<pre><code>&lt;article&gt;
    &lt;h2&gt;How to Learn HTML&lt;/h2&gt;
    &lt;p&gt;Published on &lt;time datetime="2024-01-15"&gt;January 15, 2024&lt;/time&gt;&lt;/p&gt;
    &lt;p&gt;HTML is the foundation of web development...&lt;/p&gt;
&lt;/article&gt;</code></pre>

<h3>&lt;section&gt;</h3>
<p>Thematic grouping of content, typically with a heading:</p>
<pre><code>&lt;section&gt;
    &lt;h2&gt;Our Services&lt;/h2&gt;
    &lt;p&gt;We offer web development, design, and consulting.&lt;/p&gt;
&lt;/section&gt;</code></pre>

<h3>&lt;aside&gt;</h3>
<p>Content tangentially related to the main content (sidebars, pull quotes):</p>
<pre><code>&lt;aside&gt;
    &lt;h3&gt;Related Articles&lt;/h3&gt;
    &lt;ul&gt;
        &lt;li&gt;&lt;a href="#"&gt;CSS Basics&lt;/a&gt;&lt;/li&gt;
        &lt;li&gt;&lt;a href="#"&gt;JavaScript Introduction&lt;/a&gt;&lt;/li&gt;
    &lt;/ul&gt;
&lt;/aside&gt;</code></pre>''',
                        'duration': 10,
                    },
                    {
                        'title': 'Accessibility Basics',
                        'type': 'text',
                        'content': '''<h2>Web Accessibility with HTML</h2>

<h3>ARIA Roles and Attributes</h3>
<pre><code>&lt;button aria-label="Close menu"&gt;✕&lt;/button&gt;
&lt;div role="alert"&gt;Form submitted successfully!&lt;/div&gt;
&lt;img src="chart.png" alt="Sales increased 25% in Q4 2024"&gt;</code></pre>

<h3>Accessibility Best Practices</h3>
<ul>
<li><strong>Always use alt text</strong> on images (empty <code>alt=""</code> for decorative images)</li>
<li><strong>Use semantic elements</strong> — they have built-in ARIA roles</li>
<li><strong>Proper heading hierarchy</strong> — h1 → h2 → h3, no skipping</li>
<li><strong>Label all form inputs</strong> with <code>&lt;label&gt;</code></li>
<li><strong>Ensure keyboard navigation</strong> works (tab order)</li>
<li><strong>Sufficient color contrast</strong> (4.5:1 ratio for text)</li>
<li><strong>Use <code>lang</code> attribute</strong> on <code>&lt;html&gt;</code></li>
</ul>

<h3>Skip Navigation</h3>
<pre><code>&lt;a href="#main-content" class="skip-link"&gt;Skip to main content&lt;/a&gt;

&lt;main id="main-content"&gt;
    ...
&lt;/main&gt;</code></pre>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Explain Semantic HTML',
                        'type': 'assignment',
                        'content': '<p>Write an essay explaining the importance of semantic HTML.</p>',
                        'duration': 45,
                        'assignment_data': {
                            'title': 'Explain Semantic HTML',
                            'description': '''Write a 500-800 word essay explaining:

1. What semantic HTML is and why it matters
2. The difference between semantic and non-semantic elements (give examples)
3. How semantic HTML improves accessibility for screen reader users
4. How semantic HTML affects SEO
5. At least 5 semantic HTML5 elements with their proper use cases

Your essay should include code examples to illustrate your points.''',
                            'submission_type': 'text',
                            'answer_type': 'essay',
                            'points': 100,
                            'max_attempts': 2,
                            'rubric': 'Understanding: 25pts | Examples: 25pts | Accessibility discussion: 20pts | SEO discussion: 15pts | Writing quality: 15pts',
                        },
                    },
                ],
            },
            # ── Module 7: Multimedia & Embedding ──
            {
                'title': 'Multimedia & Embedding',
                'lessons': [
                    {
                        'title': 'Audio and Video Elements',
                        'type': 'text',
                        'content': '''<h2>HTML5 Audio</h2>
<pre><code>&lt;audio controls&gt;
    &lt;source src="song.mp3" type="audio/mpeg"&gt;
    &lt;source src="song.ogg" type="audio/ogg"&gt;
    Your browser does not support the audio element.
&lt;/audio&gt;</code></pre>

<h3>Audio Attributes</h3>
<ul>
<li><code>controls</code> — Show play/pause/volume controls</li>
<li><code>autoplay</code> — Start playing automatically (blocked by most browsers)</li>
<li><code>loop</code> — Repeat the audio</li>
<li><code>muted</code> — Start muted</li>
<li><code>preload</code> — none | metadata | auto</li>
</ul>

<h2>HTML5 Video</h2>
<pre><code>&lt;video controls width="640" height="360" poster="thumbnail.jpg"&gt;
    &lt;source src="video.mp4" type="video/mp4"&gt;
    &lt;source src="video.webm" type="video/webm"&gt;
    &lt;track src="captions.vtt" kind="subtitles" srclang="en" label="English"&gt;
    Your browser does not support the video element.
&lt;/video&gt;</code></pre>

<p><strong>Tip:</strong> Always provide multiple source formats for browser compatibility, and include captions with <code>&lt;track&gt;</code> for accessibility.</p>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Embedding with iframe',
                        'type': 'text',
                        'content': '''<h2>The &lt;iframe&gt; Element</h2>

<h3>Embedding YouTube Videos</h3>
<pre><code>&lt;iframe width="560" height="315"
    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
    title="YouTube video"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen&gt;
&lt;/iframe&gt;</code></pre>

<h3>Embedding Google Maps</h3>
<pre><code>&lt;iframe src="https://www.google.com/maps/embed?pb=!1m18..."
    width="600" height="450" style="border:0;"
    allowfullscreen="" loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"&gt;
&lt;/iframe&gt;</code></pre>

<h3>Security with iframe</h3>
<pre><code>&lt;iframe src="https://example.com"
    sandbox="allow-scripts allow-same-origin"
    loading="lazy"&gt;
&lt;/iframe&gt;</code></pre>
<p>The <code>sandbox</code> attribute restricts what the embedded content can do.</p>''',
                        'duration': 10,
                    },
                    {
                        'title': 'Introduction to HTML (Audio Lesson)',
                        'type': 'text',
                        'content': '''<h2>🎧 Audio Lesson: The Story of HTML</h2>
<p><em>This is a podcast-style audio lesson. Listen to the audio below while following along with the notes.</em></p>

<p><strong>Audio:</strong> <a href="https://www.w3.org/2008/site/audio/wai-aria-intro.mp3">Listen to the lesson</a></p>

<h3>Episode Notes</h3>
<ul>
<li><strong>0:00</strong> — Introduction: How the web began</li>
<li><strong>2:00</strong> — Tim Berners-Lee and the invention of HTML in 1991</li>
<li><strong>5:00</strong> — Evolution: HTML 2.0 → 3.2 → 4.01 → XHTML → HTML5</li>
<li><strong>8:00</strong> — What makes HTML5 special</li>
<li><strong>10:00</strong> — The future of HTML and the living standard</li>
</ul>

<h3>Key Takeaways</h3>
<ol>
<li>HTML was created by Tim Berners-Lee at CERN in 1991</li>
<li>HTML5 was finalized in 2014 and is now a "living standard"</li>
<li>The W3C and WHATWG maintain the HTML specification</li>
<li>HTML5 introduced semantic elements, multimedia, and powerful APIs</li>
</ol>''',
                        'duration': 15,
                    },
                ],
            },
            # ── Module 8: HTML5 APIs & Modern Features ──
            {
                'title': 'HTML5 APIs & Modern Features',
                'lessons': [
                    {
                        'title': 'Canvas Basics',
                        'type': 'text',
                        'content': '''<h2>The HTML5 Canvas</h2>
<p>The <code>&lt;canvas&gt;</code> element lets you draw graphics using JavaScript.</p>

<pre><code>&lt;canvas id="myCanvas" width="400" height="300"&gt;
    Your browser does not support Canvas.
&lt;/canvas&gt;

&lt;script&gt;
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Draw a rectangle
ctx.fillStyle = '#3498db';
ctx.fillRect(50, 50, 200, 100);

// Draw a circle
ctx.beginPath();
ctx.arc(300, 150, 50, 0, Math.PI * 2);
ctx.fillStyle = '#e74c3c';
ctx.fill();

// Draw text
ctx.font = '24px Arial';
ctx.fillStyle = '#2c3e50';
ctx.fillText('Hello Canvas!', 50, 250);
&lt;/script&gt;</code></pre>

<p>Canvas is powerful for games, data visualizations, image manipulation, and animations.</p>''',
                        'duration': 15,
                    },
                    {
                        'title': 'Local Storage',
                        'type': 'text',
                        'content': '''<h2>Web Storage API</h2>

<h3>localStorage vs sessionStorage</h3>
<ul>
<li><code>localStorage</code> — persists even after browser is closed</li>
<li><code>sessionStorage</code> — cleared when browser tab is closed</li>
</ul>

<pre><code>&lt;script&gt;
// Save data
localStorage.setItem('username', 'Alice');
localStorage.setItem('theme', 'dark');

// Read data
const username = localStorage.getItem('username');
console.log(username); // "Alice"

// Remove one item
localStorage.removeItem('theme');

// Clear all
localStorage.clear();

// Store objects (must stringify)
const user = { name: 'Alice', age: 25 };
localStorage.setItem('user', JSON.stringify(user));
const stored = JSON.parse(localStorage.getItem('user'));
console.log(stored.name); // "Alice"
&lt;/script&gt;</code></pre>

<p><strong>Limits:</strong> ~5MB per domain. Only stores strings. Not suitable for sensitive data.</p>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Geolocation and Drag & Drop',
                        'type': 'text',
                        'content': '''<h2>Geolocation API</h2>
<pre><code>&lt;button onclick="getLocation()"&gt;Get My Location&lt;/button&gt;
&lt;p id="location"&gt;&lt;/p&gt;

&lt;script&gt;
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                document.getElementById('location').textContent =
                    `Lat: ${lat}, Lon: ${lon}`;
            },
            (error) => {
                console.error('Geolocation error:', error.message);
            }
        );
    } else {
        alert('Geolocation not supported');
    }
}
&lt;/script&gt;</code></pre>

<h2>Drag and Drop API</h2>
<pre><code>&lt;div id="drag1" draggable="true" ondragstart="drag(event)"&gt;
    Drag me!
&lt;/div&gt;
&lt;div id="dropzone" ondrop="drop(event)" ondragover="allowDrop(event)"&gt;
    Drop here
&lt;/div&gt;

&lt;script&gt;
function allowDrop(e) { e.preventDefault(); }
function drag(e) { e.dataTransfer.setData("text", e.target.id); }
function drop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData("text");
    e.target.appendChild(document.getElementById(data));
}
&lt;/script&gt;</code></pre>''',
                        'duration': 15,
                    },
                    {
                        'title': 'HTML5 Comprehensive Quiz',
                        'type': 'quiz',
                        'duration': 20,
                        'quiz_data': {
                            'title': 'HTML5 Comprehensive Assessment',
                            'passing_grade': 70,
                            'time_limit': 20,
                            'questions': [
                                {
                                    'text': 'What does the <!DOCTYPE html> declaration do?',
                                    'type': 'single_choice',
                                    'explanation': '<!DOCTYPE html> tells the browser to render the page in HTML5 standards mode.',
                                    'choices': [
                                        {'text': 'It defines the document as HTML5', 'correct': True},
                                        {'text': 'It creates the html element', 'correct': False},
                                        {'text': 'It is a comment', 'correct': False},
                                        {'text': 'It links to a stylesheet', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'HTML5 is a programming language.',
                                    'type': 'true_false',
                                    'explanation': 'HTML is a markup language, not a programming language. It structures content but cannot perform logic or calculations.',
                                    'choices': [
                                        {'text': 'True', 'correct': False},
                                        {'text': 'False', 'correct': True},
                                    ],
                                },
                                {
                                    'text': 'Which of the following are semantic HTML5 elements? (Select all)',
                                    'type': 'multi_choice',
                                    'explanation': '<header>, <article>, and <nav> are semantic. <div> and <span> are non-semantic.',
                                    'choices': [
                                        {'text': '<header>', 'correct': True},
                                        {'text': '<div>', 'correct': False},
                                        {'text': '<article>', 'correct': True},
                                        {'text': '<span>', 'correct': False},
                                        {'text': '<nav>', 'correct': True},
                                    ],
                                },
                                {
                                    'text': 'The attribute used to provide alternative text for an image is ______.',
                                    'type': 'fill_blank',
                                    'correct_text': 'alt',
                                    'explanation': 'The alt attribute provides text that describes the image for screen readers and when the image cannot load.',
                                },
                                {
                                    'text': 'Which input type is used for email addresses with built-in validation?',
                                    'type': 'single_choice',
                                    'explanation': 'type="email" provides built-in email format validation.',
                                    'choices': [
                                        {'text': 'type="text"', 'correct': False},
                                        {'text': 'type="email"', 'correct': True},
                                        {'text': 'type="mail"', 'correct': False},
                                        {'text': 'type="address"', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'Which method stores data that persists after the browser is closed?',
                                    'type': 'single_choice',
                                    'explanation': 'localStorage persists until explicitly cleared. sessionStorage is cleared when the tab closes.',
                                    'choices': [
                                        {'text': 'sessionStorage', 'correct': False},
                                        {'text': 'localStorage', 'correct': True},
                                        {'text': 'cookies only', 'correct': False},
                                        {'text': 'cache', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'The <canvas> element can be used to draw graphics using CSS.',
                                    'type': 'true_false',
                                    'explanation': '<canvas> uses JavaScript (via the Canvas API/getContext) to draw graphics, not CSS.',
                                    'choices': [
                                        {'text': 'True', 'correct': False},
                                        {'text': 'False', 'correct': True},
                                    ],
                                },
                                {
                                    'text': 'What element should you use to embed a YouTube video?',
                                    'type': 'fill_blank',
                                    'correct_text': 'iframe',
                                    'explanation': 'The <iframe> element is used to embed external content like YouTube videos.',
                                },
                            ],
                        },
                    },
                    {
                        'title': 'HTML5 Course Wrap-Up',
                        'type': 'video',
                        'video_url': 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
                        'video_source': 'youtube',
                        'video_duration': '8m 15s',
                        'content': '<p>Congratulations on completing the HTML5 course! In this final video, we recap everything you\'ve learned and discuss next steps — learning CSS!</p>',
                        'duration': 9,
                    },
                ],
            },
        ]

    def _create_html_exercises(self, course):
        concept_nav = CourseConcept.objects.create(
            course=course, title='Navigation', slug='navigation', order=0,
            description='Build navigation bars with HTML',
        )
        concept_tables = CourseConcept.objects.create(
            course=course, title='Tables', slug='tables', order=1,
            description='Create data tables in HTML',
        )
        concept_forms = CourseConcept.objects.create(
            course=course, title='Forms', slug='forms', order=2,
            description='Build interactive forms',
        )

        CourseExercise.objects.create(
            course=course, concept=concept_nav, title='Create a Navigation Bar',
            slug='create-nav-bar', difficulty='easy', order=0, points=10,
            language='javascript',
            description='Build a responsive navigation bar using semantic HTML.',
            instructions='Create a <nav> element with an unordered list containing 5 links: Home, About, Services, Blog, Contact. Each link should use an anchor tag with href="#".',
            starter_code='<!-- Create your navigation bar here -->\n',
            solution='''<nav>
    <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Blog</a></li>
        <li><a href="#">Contact</a></li>
    </ul>
</nav>''',
            test_code='// Check nav element exists\nassert(document.querySelector("nav"));\nassert(document.querySelectorAll("nav li").length >= 5);',
        )
        CourseExercise.objects.create(
            course=course, concept=concept_tables, title='Build a Data Table',
            slug='build-data-table', difficulty='medium', order=1, points=15,
            language='javascript',
            description='Build a product pricing table with headers, data rows, and a footer.',
            instructions='Create a table with columns: Product, Price, Quantity. Add at least 3 products. Include thead, tbody, tfoot. The footer should show the total using colspan.',
            starter_code='<!-- Build your table here -->\n',
            solution='''<table>
    <thead><tr><th>Product</th><th>Price</th><th>Quantity</th></tr></thead>
    <tbody>
        <tr><td>Widget</td><td>$9.99</td><td>100</td></tr>
        <tr><td>Gadget</td><td>$24.99</td><td>50</td></tr>
        <tr><td>Doohickey</td><td>$4.99</td><td>200</td></tr>
    </tbody>
    <tfoot><tr><td colspan="3">Total: 350 items</td></tr></tfoot>
</table>''',
            test_code='assert(document.querySelector("thead"));\nassert(document.querySelector("tbody"));\nassert(document.querySelectorAll("tbody tr").length >= 3);',
        )
        CourseExercise.objects.create(
            course=course, concept=concept_forms, title='Form Validation Exercise',
            slug='form-validation', difficulty='hard', order=2, points=20,
            language='javascript',
            description='Create a registration form with comprehensive HTML5 validation.',
            instructions='Build a registration form with: username (required, 3-20 chars, letters/numbers only via pattern), email (required), password (required, min 8 chars), confirm password, age (number, 13-120), terms checkbox (required). Use proper labels and validation attributes.',
            starter_code='<form id="registration">\n    <!-- Build your form here -->\n</form>\n',
            solution='''<form id="registration">
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required minlength="3" maxlength="20" pattern="[A-Za-z0-9]+">

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>

    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required minlength="8">

    <label for="age">Age:</label>
    <input type="number" id="age" name="age" min="13" max="120">

    <label><input type="checkbox" name="terms" required> I agree to the terms</label>

    <button type="submit">Register</button>
</form>''',
            test_code='const form = document.querySelector("#registration");\nassert(form);\nassert(document.querySelector("input[type=email][required]"));\nassert(document.querySelector("input[type=password][required]"));',
        )
        p("Exercises created (3)")

    # ─────────────────────────────────────────────
    # COURSE 2: CSS Mastery
    # ─────────────────────────────────────────────
    def create_css_course(self, html_course):
        course, created = Course.objects.update_or_create(
            slug='css-mastery',
            defaults=dict(
                title={'en': 'CSS Mastery: From Basics to Advanced'},
                description={'en': 'Master CSS from fundamentals to advanced techniques. Learn Flexbox, Grid, animations, responsive design, and modern CSS features. Build beautiful, responsive websites.'},
                price=Decimal('29.99'),
                is_free=False,
                category='Web Development',
                level='intermediate',
                duration=600,
                thumbnail='https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
                is_featured=True,
                enable_certificates=True,
                enable_discussions=True,
                enable_drip=True,
                enable_quizzes=True,
                enable_assignments=True,
                enable_prerequisites=True,
                drip_enabled=True,
                drip_type='timed',
                what_youll_learn=[
                    'Write clean, maintainable CSS',
                    'Build layouts with Flexbox and Grid',
                    'Create responsive designs for all devices',
                    'Implement animations and transitions',
                    'Use CSS custom properties (variables)',
                    'Apply BEM methodology',
                    'Master specificity and the cascade',
                ],
                who_should_take={'en': 'Web developers who know HTML and want to master styling and layout.'},
            ),
        )
        action = "Created" if created else "Updated"
        print(f"\n📗 {action} course: CSS Mastery")

        course.modules.all().delete()
        course.quizzes.all().delete()
        course.assignments.all().delete()
        course.badges.all().delete()
        course.faqs.all().delete()
        course.drip_schedules.all().delete()
        course.concepts.all().delete()

        # Prerequisite
        CoursePrerequisite.objects.filter(course=course).delete()
        CoursePrerequisite.objects.create(course=course, required_course=html_course)
        p("Prerequisite set: requires HTML5 Essentials")

        modules_data = self._css_modules_data()
        for mi, mdata in enumerate(modules_data):
            mod = Module.objects.create(course=course, title={'en': mdata['title']}, order=mi)
            p(f"Module {mi+1}: {mdata['title']}")
            for li, ldata in enumerate(mdata['lessons']):
                lesson = Lesson.objects.create(
                    module=mod,
                    title={'en': ldata['title']},
                    content={'en': ldata.get('content', '')},
                    lesson_type=ldata.get('type', 'text'),
                    video_url=ldata.get('video_url', ''),
                    video_source=ldata.get('video_source', ''),
                    video_duration=ldata.get('video_duration', ''),
                    duration=ldata.get('duration', 10),
                    order=li,
                    slides_data=ldata.get('slides_data', []),
                    is_free_preview=ldata.get('is_free_preview', False),
                    drip_days_after_enrollment=ldata.get('drip_days', None),
                )
                if ldata.get('type') == 'quiz' and 'quiz_data' in ldata:
                    qd = ldata['quiz_data']
                    quiz = Quiz.objects.create(
                        course=course, module=mod,
                        title={'en': qd['title']},
                        quiz_type='module_quiz',
                        passing_grade=qd.get('passing_grade', 60),
                        time_limit=qd.get('time_limit', 15),
                        show_correct_answers=True,
                        randomize_questions=True,
                        order=li,
                    )
                    for qi, question in enumerate(qd['questions']):
                        q = Question.objects.create(
                            quiz=quiz, text=question['text'],
                            question_type=question['type'], order=qi,
                            explanation=question.get('explanation', ''),
                            correct_text=question.get('correct_text', ''),
                            points=question.get('points', 1),
                        )
                        for ci, choice in enumerate(question.get('choices', [])):
                            Choice.objects.create(
                                question=q, text=choice['text'],
                                is_correct=choice.get('correct', False), order=ci,
                            )
                    quiz.questions_count = len(qd['questions'])
                    quiz.save()
                    lesson.quiz = quiz
                    lesson.save()
                    p(f"  Quiz: {qd['title']}")

                if ldata.get('type') == 'assignment' and 'assignment_data' in ldata:
                    ad = ldata['assignment_data']
                    Assignment.objects.create(
                        course=course, lesson=lesson,
                        title=ad['title'], description=ad['description'],
                        submission_type=ad.get('submission_type', 'text'),
                        answer_type=ad.get('answer_type', 'essay'),
                        points=ad.get('points', 100),
                        rubric=ad.get('rubric', ''),
                        starter_code=ad.get('starter_code', ''),
                        max_attempts=ad.get('max_attempts', 3),
                    )
                    p(f"  Assignment: {ad['title']}")

        # Exercises
        self._create_css_exercises(course)

        # Badges
        for b in [
            ('css-beginner', 'CSS Beginner', 'Complete the CSS Fundamentals module', 'first_exercise'),
            ('flexbox-master', 'Flexbox Master', 'Complete all Flexbox exercises', 'concept_complete'),
            ('grid-guru', 'Grid Guru', 'Master CSS Grid layouts', 'concept_complete'),
            ('animation-wizard', 'Animation Wizard', 'Complete all animation exercises', 'all_exercises'),
        ]:
            CourseBadge.objects.create(course=course, slug=b[0], name=b[1], description=b[2], criteria_type=b[3])
        p("Badges created")

        # FAQs
        for i, faq in enumerate([
            ("Do I need to know HTML first?", "Yes! HTML5 Essentials is a prerequisite. You need to understand HTML structure before styling with CSS."),
            ("Is this course suitable for beginners?", "Yes, if you know HTML. We start with CSS basics and gradually move to advanced topics like Grid and animations."),
            ("Can I access this course with a membership?", "Yes! Pro Membership members get full access to this course as part of their subscription."),
            ("How much practice is included?", "The course includes hands-on exercises, coding assignments, quizzes, and real-world projects in every module."),
        ]):
            CourseFAQ.objects.create(course=course, question=faq[0], answer=faq[1], order=i)
        p("FAQs created")

        # Drip: first 2 modules immediate, rest biweekly
        for mod in course.modules.all():
            days = 0 if mod.order < 2 else (mod.order - 1) * 14
            DripSchedule.objects.create(
                course=course, module=mod,
                drip_type='days_after_enrollment',
                days_after=days,
            )
        p("Drip schedules created")

        return course

    def _css_modules_data(self):
        return [
            # ── Module 1: CSS Fundamentals ──
            {
                'title': 'CSS Fundamentals',
                'lessons': [
                    {
                        'title': 'What is CSS?',
                        'type': 'text',
                        'is_free_preview': True,
                        'content': '''<h2>What is CSS?</h2>
<p><strong>CSS</strong> (Cascading Style Sheets) controls the visual presentation of HTML elements — colors, fonts, layout, spacing, animations, and more.</p>

<h3>How CSS Works</h3>
<p>CSS uses <strong>selectors</strong> to target HTML elements and <strong>declarations</strong> to define styles:</p>

<pre><code>selector {
    property: value;
    property: value;
}

/* Example */
h1 {
    color: #2c3e50;
    font-size: 2rem;
    text-align: center;
}</code></pre>

<h3>The Cascade</h3>
<p>When multiple rules target the same element, CSS uses these factors to determine which wins:</p>
<ol>
<li><strong>Importance</strong> — <code>!important</code> overrides everything</li>
<li><strong>Specificity</strong> — More specific selectors win</li>
<li><strong>Source order</strong> — Later rules override earlier ones</li>
</ol>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Inline, Internal, and External CSS',
                        'type': 'text',
                        'content': '''<h2>Three Ways to Add CSS</h2>

<h3>1. Inline CSS</h3>
<pre><code>&lt;p style="color: red; font-size: 18px;"&gt;Red text&lt;/p&gt;</code></pre>
<p>❌ Not recommended — mixes content with presentation.</p>

<h3>2. Internal CSS (in &lt;style&gt; tag)</h3>
<pre><code>&lt;head&gt;
    &lt;style&gt;
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        h1 {
            color: navy;
        }
    &lt;/style&gt;
&lt;/head&gt;</code></pre>
<p>⚠️ OK for single pages, but doesn't scale.</p>

<h3>3. External CSS (recommended ✅)</h3>
<pre><code>&lt;!-- In HTML --&gt;
&lt;head&gt;
    &lt;link rel="stylesheet" href="styles.css"&gt;
&lt;/head&gt;</code></pre>
<pre><code>/* In styles.css */
body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
}
h1 {
    color: navy;
}</code></pre>
<p>✅ Reusable, cacheable, separation of concerns.</p>''',
                        'duration': 10,
                    },
                    {
                        'title': 'CSS Selectors',
                        'type': 'text',
                        'content': '''<h2>CSS Selectors</h2>

<h3>Basic Selectors</h3>
<pre><code>/* Element selector */
p { color: gray; }

/* Class selector */
.highlight { background: yellow; }

/* ID selector */
#header { background: navy; }

/* Universal selector */
* { margin: 0; padding: 0; box-sizing: border-box; }</code></pre>

<h3>Combinators</h3>
<pre><code>/* Descendant (any depth) */
article p { line-height: 1.6; }

/* Direct child */
nav > ul { list-style: none; }

/* Adjacent sibling */
h2 + p { font-size: 1.1em; }

/* General sibling */
h2 ~ p { color: #555; }</code></pre>

<h3>Attribute Selectors</h3>
<pre><code>/* Has attribute */
[required] { border-color: red; }

/* Exact value */
[type="email"] { width: 300px; }

/* Starts with */
[href^="https"] { color: green; }

/* Ends with */
[src$=".png"] { border: 1px solid #ccc; }

/* Contains */
[class*="btn"] { cursor: pointer; }</code></pre>''',
                        'duration': 15,
                    },
                    {
                        'title': 'Colors and Units',
                        'type': 'text',
                        'content': '''<h2>CSS Colors</h2>
<pre><code>/* Named colors */
color: red;
color: cornflowerblue;

/* Hex */
color: #ff0000;
color: #f00;        /* shorthand */
color: #ff000080;   /* with alpha */

/* RGB / RGBA */
color: rgb(255, 0, 0);
color: rgba(255, 0, 0, 0.5);

/* HSL / HSLA */
color: hsl(0, 100%, 50%);
color: hsla(0, 100%, 50%, 0.5);

/* Modern CSS */
color: oklch(0.7 0.15 30);  /* perceptually uniform */</code></pre>

<h2>CSS Units</h2>
<table>
<tr><th>Unit</th><th>Type</th><th>Description</th></tr>
<tr><td>px</td><td>Absolute</td><td>Pixels (most common)</td></tr>
<tr><td>rem</td><td>Relative</td><td>Relative to root font-size (recommended)</td></tr>
<tr><td>em</td><td>Relative</td><td>Relative to parent font-size</td></tr>
<tr><td>%</td><td>Relative</td><td>Relative to parent element</td></tr>
<tr><td>vw/vh</td><td>Viewport</td><td>1% of viewport width/height</td></tr>
<tr><td>ch</td><td>Relative</td><td>Width of the "0" character</td></tr>
</table>

<p><strong>Best practice:</strong> Use <code>rem</code> for font sizes, <code>px</code> for borders/shadows, <code>%</code> or viewport units for layout.</p>''',
                        'duration': 12,
                    },
                ],
            },
            # ── Module 2: Box Model & Layout ──
            {
                'title': 'Box Model & Layout',
                'lessons': [
                    {
                        'title': 'The CSS Box Model',
                        'type': 'text',
                        'content': '''<h2>The Box Model</h2>
<p>Every HTML element is a rectangular box consisting of four layers:</p>

<pre><code>┌─────────────────────────── margin ───┐
│ ┌─────────────────────── border ───┐ │
│ │ ┌─────────────────── padding ──┐ │ │
│ │ │                              │ │ │
│ │ │         CONTENT              │ │ │
│ │ │                              │ │ │
│ │ └──────────────────────────────┘ │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘</code></pre>

<pre><code>.box {
    width: 300px;
    padding: 20px;
    border: 2px solid #333;
    margin: 10px;
}
/* Total width = 300 + 40 + 4 + 20 = 364px (content-box) */</code></pre>

<h3>box-sizing: border-box</h3>
<pre><code>/* ALWAYS use this — makes width include padding + border */
*, *::before, *::after {
    box-sizing: border-box;
}

.box {
    width: 300px;    /* Total width IS 300px */
    padding: 20px;   /* Included in 300px */
    border: 2px solid #333; /* Included in 300px */
}</code></pre>''',
                        'duration': 15,
                    },
                    {
                        'title': 'Margin, Padding, and Border',
                        'type': 'text',
                        'content': '''<h2>Spacing Properties</h2>

<h3>Padding (inside the border)</h3>
<pre><code>/* Individual sides */
padding-top: 10px;
padding-right: 20px;
padding-bottom: 10px;
padding-left: 20px;

/* Shorthand */
padding: 10px;              /* all sides */
padding: 10px 20px;         /* vertical | horizontal */
padding: 10px 20px 15px;    /* top | horizontal | bottom */
padding: 10px 20px 15px 5px;/* top | right | bottom | left */</code></pre>

<h3>Margin (outside the border)</h3>
<pre><code>margin: 20px auto;  /* Center a block element horizontally */

/* Margin collapse: vertical margins of adjacent elements overlap */
/* The larger margin wins, they don't add up */</code></pre>

<h3>Border</h3>
<pre><code>border: 2px solid #333;
border-radius: 8px;        /* Rounded corners */
border-radius: 50%;        /* Perfect circle */

/* Individual sides */
border-bottom: 3px dashed blue;
border-left: none;</code></pre>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Display Property',
                        'type': 'text',
                        'content': '''<h2>The Display Property</h2>

<pre><code>/* Block — takes full width, starts new line */
display: block;    /* div, p, h1-h6, section, etc. */

/* Inline — flows with text, no width/height */
display: inline;   /* span, a, strong, em, etc. */

/* Inline-block — inline flow + accepts width/height */
display: inline-block;

/* None — completely removes from layout */
display: none;

/* Flex — creates flex container */
display: flex;

/* Grid — creates grid container */
display: grid;</code></pre>

<h3>Common Use Cases</h3>
<pre><code>/* Horizontal nav with inline-block */
nav a {
    display: inline-block;
    padding: 10px 20px;
    text-decoration: none;
}

/* Hide elements */
.hidden { display: none; }
.invisible { visibility: hidden; } /* Still takes space */</code></pre>''',
                        'duration': 10,
                    },
                ],
            },
            # ── Module 3: Typography & Text ──
            {
                'title': 'Typography & Text',
                'lessons': [
                    {
                        'title': 'Font Properties',
                        'type': 'text',
                        'content': '''<h2>CSS Typography</h2>

<pre><code>body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 16px;      /* Base size */
    font-weight: 400;     /* normal=400, bold=700 */
    font-style: normal;   /* or italic */
    line-height: 1.6;     /* Unitless is best */
    letter-spacing: 0.02em;
}

h1 {
    font-size: 2.5rem;    /* 40px if base is 16px */
    font-weight: 700;
    line-height: 1.2;
}

/* Shorthand */
p {
    font: italic 400 1rem/1.6 'Inter', sans-serif;
}</code></pre>

<h3>Font Stacks</h3>
<pre><code>/* System font stack (fastest) */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Serif stack */
font-family: Georgia, 'Times New Roman', serif;

/* Monospace */
font-family: 'Fira Code', 'Courier New', monospace;</code></pre>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Google Fonts',
                        'type': 'video',
                        'video_url': 'https://www.youtube.com/watch?v=0ohtVzCSHqs',
                        'video_source': 'youtube',
                        'video_duration': '10m 45s',
                        'content': '''<p>Learn how to add Google Fonts to your website.</p>
<pre><code>&lt;!-- In HTML head --&gt;
&lt;link rel="preconnect" href="https://fonts.googleapis.com"&gt;
&lt;link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"&gt;</code></pre>
<pre><code>/* In CSS */
body {
    font-family: 'Inter', sans-serif;
}</code></pre>''',
                        'duration': 11,
                    },
                    {
                        'title': 'Text Styling Properties',
                        'type': 'text',
                        'content': '''<h2>Text Properties</h2>

<pre><code>/* Alignment */
text-align: left | center | right | justify;

/* Decoration */
text-decoration: none;              /* Remove underline from links */
text-decoration: underline wavy red;/* Fancy underline */

/* Transform */
text-transform: uppercase;
text-transform: capitalize;
text-transform: lowercase;

/* Spacing */
letter-spacing: 0.05em;
word-spacing: 0.1em;

/* Indent */
text-indent: 2em;

/* Shadow */
text-shadow: 2px 2px 4px rgba(0,0,0,0.3);

/* Overflow */
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;  /* Shows "..." for truncated text */

/* Multi-line truncation */
display: -webkit-box;
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;
overflow: hidden;</code></pre>''',
                        'duration': 10,
                    },
                ],
            },
            # ── Module 4: Flexbox ──
            {
                'title': 'Flexbox',
                'lessons': [
                    {
                        'title': 'Introduction to Flexbox',
                        'type': 'text',
                        'is_free_preview': True,
                        'content': '''<h2>CSS Flexbox</h2>
<p>Flexbox is a one-dimensional layout system for arranging items in rows or columns.</p>

<pre><code>.container {
    display: flex;           /* Activate flexbox */
    flex-direction: row;     /* row | column | row-reverse | column-reverse */
    flex-wrap: wrap;         /* nowrap | wrap | wrap-reverse */
}

/* Shorthand */
.container {
    display: flex;
    flex-flow: row wrap;
}</code></pre>

<h3>Main Axis vs Cross Axis</h3>
<p>When <code>flex-direction: row</code>:</p>
<ul>
<li><strong>Main axis</strong> = horizontal (left → right)</li>
<li><strong>Cross axis</strong> = vertical (top → bottom)</li>
</ul>
<p>When <code>flex-direction: column</code>, they swap.</p>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Justify-Content and Align-Items',
                        'type': 'text',
                        'content': '''<h2>Alignment in Flexbox</h2>

<h3>justify-content (Main Axis)</h3>
<pre><code>.container {
    display: flex;
    justify-content: flex-start;    /* Default */
    justify-content: flex-end;
    justify-content: center;
    justify-content: space-between; /* Equal space between items */
    justify-content: space-around;  /* Equal space around items */
    justify-content: space-evenly;  /* Equal space everywhere */
}</code></pre>

<h3>align-items (Cross Axis)</h3>
<pre><code>.container {
    display: flex;
    align-items: stretch;     /* Default — fill container height */
    align-items: flex-start;
    align-items: flex-end;
    align-items: center;
    align-items: baseline;    /* Align text baselines */
}</code></pre>

<h3>Perfect Centering</h3>
<pre><code>/* Center anything horizontally AND vertically */
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}</code></pre>''',
                        'duration': 15,
                    },
                    {
                        'title': 'Flex Item Properties',
                        'type': 'text',
                        'content': '''<h2>Flex Items</h2>

<pre><code>.item {
    flex-grow: 1;    /* How much item should grow (0 = don't grow) */
    flex-shrink: 1;  /* How much item should shrink (0 = don't shrink) */
    flex-basis: 200px; /* Initial size before growing/shrinking */

    /* Shorthand */
    flex: 1;          /* flex: 1 1 0% */
    flex: 0 0 300px;  /* Don't grow/shrink, fixed 300px */
}

/* Override alignment for single item */
.item {
    align-self: center;
}

/* Change order */
.item:first-child {
    order: 2;  /* Default is 0; higher = later */
}</code></pre>

<h3>Common Patterns</h3>
<pre><code>/* Equal-width columns */
.col { flex: 1; }

/* Sidebar + main content */
.sidebar { flex: 0 0 250px; }
.main    { flex: 1; }

/* Push last item to the right */
.nav-item:last-child { margin-left: auto; }</code></pre>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Building Layouts with Flexbox',
                        'type': 'video',
                        'video_url': 'https://www.youtube.com/watch?v=fYq5PXgSsbE',
                        'video_source': 'youtube',
                        'video_duration': '18m 30s',
                        'content': '<p>Build a complete page layout using Flexbox — header, sidebar, main content, and footer.</p>',
                        'duration': 19,
                    },
                    {
                        'title': 'Flexbox Quiz',
                        'type': 'quiz',
                        'duration': 15,
                        'quiz_data': {
                            'title': 'Flexbox Quiz',
                            'passing_grade': 60,
                            'time_limit': 10,
                            'questions': [
                                {
                                    'text': 'Which property activates Flexbox on a container?',
                                    'type': 'single_choice',
                                    'explanation': 'display: flex turns an element into a flex container.',
                                    'choices': [
                                        {'text': 'display: flex', 'correct': True},
                                        {'text': 'position: flex', 'correct': False},
                                        {'text': 'flex: 1', 'correct': False},
                                        {'text': 'flex-direction: row', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'justify-content aligns items along the cross axis.',
                                    'type': 'true_false',
                                    'explanation': 'justify-content aligns along the MAIN axis. align-items aligns along the cross axis.',
                                    'choices': [
                                        {'text': 'True', 'correct': False},
                                        {'text': 'False', 'correct': True},
                                    ],
                                },
                                {
                                    'text': 'To center an element both horizontally and vertically, use justify-content: center and align-items: ______.',
                                    'type': 'fill_blank',
                                    'correct_text': 'center',
                                    'explanation': 'justify-content: center + align-items: center perfectly centers content.',
                                },
                                {
                                    'text': 'Which flex shorthand means "grow equally, don\'t shrink, auto basis"?',
                                    'type': 'single_choice',
                                    'explanation': 'flex: 1 means flex: 1 1 0%, which grows equally.',
                                    'choices': [
                                        {'text': 'flex: 1', 'correct': True},
                                        {'text': 'flex: auto', 'correct': False},
                                        {'text': 'flex: 0 1 auto', 'correct': False},
                                        {'text': 'flex: none', 'correct': False},
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
            # ── Module 5: CSS Grid ──
            {
                'title': 'CSS Grid',
                'lessons': [
                    {
                        'title': 'Introduction to CSS Grid',
                        'type': 'text',
                        'content': '''<h2>CSS Grid Layout</h2>
<p>Grid is a two-dimensional layout system — it handles both rows AND columns simultaneously.</p>

<pre><code>.container {
    display: grid;
    grid-template-columns: 200px 1fr 200px;  /* 3 columns */
    grid-template-rows: auto 1fr auto;        /* 3 rows */
    gap: 20px;                                /* Gutter between cells */
}

/* Using repeat() */
.container {
    grid-template-columns: repeat(3, 1fr);    /* 3 equal columns */
    grid-template-columns: repeat(4, 250px);  /* 4 fixed columns */
}</code></pre>

<h3>The fr Unit</h3>
<p><code>fr</code> = fraction of available space.</p>
<pre><code>grid-template-columns: 1fr 2fr 1fr;
/* First col: 25%, Second: 50%, Third: 25% */</code></pre>''',
                        'duration': 15,
                    },
                    {
                        'title': 'Grid Areas and Templates',
                        'type': 'text',
                        'content': '''<h2>Named Grid Areas</h2>

<pre><code>.container {
    display: grid;
    grid-template-areas:
        "header header header"
        "sidebar main aside"
        "footer footer footer";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    gap: 10px;
}

.header  { grid-area: header;  }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main;    }
.aside   { grid-area: aside;   }
.footer  { grid-area: footer;  }</code></pre>

<h3>Placing Items by Line Numbers</h3>
<pre><code>.item {
    grid-column: 1 / 3;     /* Span columns 1 to 3 */
    grid-row: 2 / 4;        /* Span rows 2 to 4 */
}

/* Shorthand */
.item {
    grid-column: 1 / span 2; /* Start at 1, span 2 columns */
}</code></pre>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Responsive Grids',
                        'type': 'text',
                        'content': '''<h2>Responsive CSS Grid</h2>

<h3>auto-fit and auto-fill</h3>
<pre><code>/* Cards that automatically wrap and resize */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

/* auto-fill: creates empty columns if space allows */
/* auto-fit: collapses empty columns, items stretch */</code></pre>

<h3>Grid with Media Queries</h3>
<pre><code>.layout {
    display: grid;
    grid-template-columns: 1fr;  /* Mobile: single column */
    gap: 20px;
}

@media (min-width: 768px) {
    .layout {
        grid-template-columns: 250px 1fr;  /* Tablet: sidebar + main */
    }
}

@media (min-width: 1024px) {
    .layout {
        grid-template-columns: 250px 1fr 250px;  /* Desktop: 3 columns */
    }
}</code></pre>''',
                        'duration': 12,
                    },
                ],
            },
            # ── Module 6: Responsive Design ──
            {
                'title': 'Responsive Design',
                'lessons': [
                    {
                        'title': 'Media Queries',
                        'type': 'text',
                        'content': '''<h2>CSS Media Queries</h2>

<pre><code>/* Mobile first (recommended) — styles apply to mobile by default */
.container { padding: 10px; }

@media (min-width: 768px) {
    .container { padding: 20px; max-width: 720px; margin: 0 auto; }
}

@media (min-width: 1024px) {
    .container { max-width: 960px; }
}

@media (min-width: 1200px) {
    .container { max-width: 1140px; }
}</code></pre>

<h3>Common Breakpoints</h3>
<pre><code>/* Mobile:  0 - 767px   (default styles) */
/* Tablet:  768px+      */
/* Desktop: 1024px+     */
/* Large:   1200px+     */</code></pre>

<h3>Other Media Features</h3>
<pre><code>@media (prefers-color-scheme: dark) {
    body { background: #1a1a1a; color: #fff; }
}

@media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
}

@media print {
    .no-print { display: none; }
}</code></pre>''',
                        'duration': 15,
                    },
                    {
                        'title': 'Responsive Images and Viewport Units',
                        'type': 'text',
                        'content': '''<h2>Responsive Images</h2>
<pre><code>/* Make images responsive */
img {
    max-width: 100%;
    height: auto;
}

/* Object-fit for fixed-size containers */
.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;      /* Crop to fill */
    object-position: center;
}</code></pre>

<h2>Viewport Units</h2>
<pre><code>/* vw = 1% of viewport width */
/* vh = 1% of viewport height */
/* vmin = 1% of smaller dimension */
/* vmax = 1% of larger dimension */

.hero {
    height: 100vh;   /* Full viewport height */
    width: 100vw;    /* Full viewport width */
}

/* Dynamic viewport units (accounts for mobile browser bars) */
.hero {
    height: 100dvh;  /* Dynamic viewport height */
}

/* Fluid typography */
h1 {
    font-size: clamp(1.5rem, 4vw, 3rem);
    /* min: 1.5rem, preferred: 4vw, max: 3rem */
}</code></pre>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Build a Responsive Layout',
                        'type': 'assignment',
                        'content': '<p>Create a fully responsive webpage layout.</p>',
                        'duration': 60,
                        'assignment_data': {
                            'title': 'Build a Responsive Layout',
                            'description': '''Create a responsive webpage with:

1. A header with logo and navigation that collapses on mobile
2. A hero section (full viewport height)
3. A 3-column feature section (stacks on mobile)
4. A 2-column content + sidebar section
5. A footer with 4-column grid (stacks on tablet/mobile)

Requirements:
- Mobile-first approach
- Use Flexbox OR Grid (or both)
- At least 2 media query breakpoints (768px, 1024px)
- Responsive images with max-width: 100%
- Use rem units for typography
- Use clamp() for at least one fluid property''',
                            'submission_type': 'code',
                            'answer_type': 'code_any',
                            'points': 150,
                            'max_attempts': 3,
                            'rubric': 'Mobile-first: 20pts | Breakpoints: 20pts | Layout technique: 25pts | Responsive images: 15pts | Typography: 15pts | Code quality: 5pts',
                        },
                    },
                ],
            },
            # ── Module 7: Animations & Transitions ──
            {
                'title': 'Animations & Transitions',
                'lessons': [
                    {
                        'title': 'CSS Transitions',
                        'type': 'text',
                        'content': '''<h2>CSS Transitions</h2>
<p>Transitions animate property changes smoothly over time.</p>

<pre><code>.button {
    background: #3498db;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.button:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}</code></pre>

<h3>Transition Properties</h3>
<pre><code>transition-property: background, transform;
transition-duration: 0.3s;
transition-timing-function: ease;     /* ease | linear | ease-in | ease-out | ease-in-out | cubic-bezier() */
transition-delay: 0.1s;

/* Shorthand */
transition: background 0.3s ease, transform 0.2s ease-out 0.1s;</code></pre>

<p><strong>Performance tip:</strong> Only animate <code>transform</code> and <code>opacity</code> — they run on the GPU and won't cause repaints.</p>''',
                        'duration': 12,
                    },
                    {
                        'title': 'CSS Keyframe Animations',
                        'type': 'text',
                        'content': '''<h2>@keyframes Animations</h2>

<pre><code>@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.element {
    animation: fadeInUp 0.6s ease-out forwards;
}</code></pre>

<h3>Animation Properties</h3>
<pre><code>animation-name: fadeInUp;
animation-duration: 0.6s;
animation-timing-function: ease-out;
animation-delay: 0.2s;
animation-iteration-count: 1;      /* or infinite */
animation-direction: normal;       /* normal | reverse | alternate */
animation-fill-mode: forwards;     /* none | forwards | backwards | both */
animation-play-state: running;     /* or paused */

/* Shorthand */
animation: fadeInUp 0.6s ease-out 0.2s 1 normal forwards;</code></pre>

<h3>Multi-Step Animation</h3>
<pre><code>@keyframes bounce {
    0%   { transform: translateY(0); }
    25%  { transform: translateY(-20px); }
    50%  { transform: translateY(0); }
    75%  { transform: translateY(-10px); }
    100% { transform: translateY(0); }
}

.bouncing { animation: bounce 1s ease infinite; }</code></pre>''',
                        'duration': 15,
                    },
                    {
                        'title': 'CSS Transform',
                        'type': 'text',
                        'content': '''<h2>CSS Transform</h2>

<pre><code>/* Translate (move) */
transform: translateX(50px);
transform: translateY(-20px);
transform: translate(50px, -20px);

/* Rotate */
transform: rotate(45deg);
transform: rotateX(45deg);  /* 3D */
transform: rotateY(45deg);

/* Scale */
transform: scale(1.5);      /* 150% size */
transform: scaleX(2);       /* Double width */

/* Skew */
transform: skew(10deg, 5deg);

/* Combine transforms */
transform: translateY(-10px) rotate(5deg) scale(1.1);

/* Transform origin */
transform-origin: center center;  /* Default */
transform-origin: top left;
transform-origin: 50% 100%;</code></pre>

<h3>3D Transforms</h3>
<pre><code>.card-container {
    perspective: 1000px;
}
.card {
    transform-style: preserve-3d;
    transition: transform 0.6s;
}
.card:hover {
    transform: rotateY(180deg);
}</code></pre>''',
                        'duration': 12,
                    },
                ],
            },
            # ── Module 8: Advanced CSS ──
            {
                'title': 'Advanced CSS',
                'lessons': [
                    {
                        'title': 'CSS Custom Properties (Variables)',
                        'type': 'text',
                        'content': '''<h2>CSS Custom Properties</h2>

<pre><code>:root {
    --primary: #3498db;
    --secondary: #2ecc71;
    --text: #2c3e50;
    --bg: #ffffff;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 2rem;
    --radius: 8px;
    --shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.button {
    background: var(--primary);
    color: var(--bg);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

/* Dark mode with variables */
@media (prefers-color-scheme: dark) {
    :root {
        --text: #ecf0f1;
        --bg: #1a1a2e;
        --shadow: 0 2px 10px rgba(0,0,0,0.4);
    }
}

/* Override in a component */
.card {
    --primary: #e74c3c;  /* Local override */
}</code></pre>''',
                        'duration': 12,
                    },
                    {
                        'title': 'Pseudo-Classes and Pseudo-Elements',
                        'type': 'text',
                        'content': '''<h2>Pseudo-Classes</h2>
<pre><code>/* User action */
a:hover { color: red; }
a:active { color: darkred; }
input:focus { outline: 2px solid blue; }

/* Structural */
li:first-child { font-weight: bold; }
li:last-child { border-bottom: none; }
li:nth-child(odd) { background: #f5f5f5; }
li:nth-child(3n) { color: red; }  /* Every 3rd */
p:not(.intro) { color: gray; }

/* Form states */
input:required { border-left: 3px solid red; }
input:valid { border-color: green; }
input:invalid { border-color: red; }
input:disabled { opacity: 0.5; }
input:checked + label { font-weight: bold; }</code></pre>

<h2>Pseudo-Elements</h2>
<pre><code>/* Before and After */
.quote::before {
    content: "\\201C";  /* Left double quote */
    font-size: 3em;
    color: #ccc;
}
.quote::after {
    content: "\\201D";
}

/* First letter / first line */
p::first-letter { font-size: 2em; float: left; }
p::first-line { font-weight: bold; }

/* Selection highlight */
::selection {
    background: #3498db;
    color: white;
}</code></pre>''',
                        'duration': 15,
                    },
                    {
                        'title': 'Specificity and BEM',
                        'type': 'text',
                        'content': '''<h2>CSS Specificity</h2>
<p>Specificity determines which CSS rule wins when multiple rules target the same element.</p>

<pre><code>/* Specificity: (inline, IDs, Classes, Elements) */
p                    { }  /* 0,0,0,1 */
.intro               { }  /* 0,0,1,0 */
p.intro              { }  /* 0,0,1,1 */
#header              { }  /* 0,1,0,0 */
#header .nav li      { }  /* 0,1,1,1 */
style="..."          { }  /* 1,0,0,0 */

/* !important overrides everything (avoid!) */
p { color: red !important; }</code></pre>

<h2>BEM Methodology</h2>
<p><strong>Block__Element--Modifier</strong></p>

<pre><code>&lt;div class="card"&gt;
    &lt;img class="card__image" src="photo.jpg"&gt;
    &lt;h3 class="card__title"&gt;Title&lt;/h3&gt;
    &lt;p class="card__text"&gt;Description&lt;/p&gt;
    &lt;a class="card__button card__button--primary"&gt;Read More&lt;/a&gt;
&lt;/div&gt;</code></pre>

<pre><code>.card { }
.card__image { width: 100%; }
.card__title { font-size: 1.2rem; }
.card__button { padding: 10px 20px; }
.card__button--primary { background: blue; color: white; }
.card__button--secondary { background: gray; }</code></pre>

<h3>Benefits of BEM</h3>
<ul>
<li>Flat specificity (all single class selectors)</li>
<li>Self-documenting class names</li>
<li>No nesting conflicts</li>
<li>Easy to understand component relationships</li>
</ul>''',
                        'duration': 15,
                    },
                    {
                        'title': 'CSS Mastery Final Assessment',
                        'type': 'quiz',
                        'duration': 25,
                        'quiz_data': {
                            'title': 'CSS Mastery Final Assessment',
                            'passing_grade': 70,
                            'time_limit': 25,
                            'questions': [
                                {
                                    'text': 'What does box-sizing: border-box do?',
                                    'type': 'single_choice',
                                    'explanation': 'border-box includes padding and border in the element\'s total width and height.',
                                    'choices': [
                                        {'text': 'Includes padding and border in width/height', 'correct': True},
                                        {'text': 'Adds a border around the box', 'correct': False},
                                        {'text': 'Sets the box to be a block element', 'correct': False},
                                        {'text': 'Removes margin from the element', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'Flexbox is a two-dimensional layout system.',
                                    'type': 'true_false',
                                    'explanation': 'Flexbox is ONE-dimensional (row OR column). CSS Grid is two-dimensional.',
                                    'choices': [
                                        {'text': 'True', 'correct': False},
                                        {'text': 'False', 'correct': True},
                                    ],
                                },
                                {
                                    'text': 'The CSS unit that represents a fraction of available space in a grid is ______.',
                                    'type': 'fill_blank',
                                    'correct_text': 'fr',
                                    'explanation': 'The fr unit distributes available space proportionally in CSS Grid.',
                                },
                                {
                                    'text': 'Which properties should you prefer for animations for best performance?',
                                    'type': 'multi_choice',
                                    'explanation': 'transform and opacity are GPU-accelerated and don\'t trigger layout reflows.',
                                    'choices': [
                                        {'text': 'transform', 'correct': True},
                                        {'text': 'opacity', 'correct': True},
                                        {'text': 'width', 'correct': False},
                                        {'text': 'margin', 'correct': False},
                                        {'text': 'top/left', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'What is the specificity of the selector #nav .item a?',
                                    'type': 'single_choice',
                                    'explanation': '#nav = 1 ID, .item = 1 class, a = 1 element → 0,1,1,1',
                                    'choices': [
                                        {'text': '0,1,1,1', 'correct': True},
                                        {'text': '0,1,0,2', 'correct': False},
                                        {'text': '0,0,2,1', 'correct': False},
                                        {'text': '0,1,2,0', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'CSS custom properties (variables) are declared with the prefix ______.',
                                    'type': 'fill_blank',
                                    'correct_text': '--',
                                    'explanation': 'CSS variables use -- prefix: --primary: #3498db; and are accessed with var(--primary).',
                                },
                            ],
                        },
                    },
                ],
            },
        ]

    def _create_css_exercises(self, course):
        concept_flex = CourseConcept.objects.create(
            course=course, title='Flexbox Layouts', slug='flexbox', order=0,
            description='Build layouts with CSS Flexbox',
        )
        concept_grid = CourseConcept.objects.create(
            course=course, title='Grid Layouts', slug='grid', order=1,
            description='Build layouts with CSS Grid',
        )
        concept_anim = CourseConcept.objects.create(
            course=course, title='Animations', slug='animations', order=2,
            description='CSS transitions and animations',
        )

        CourseExercise.objects.create(
            course=course, concept=concept_flex, title='Flexbox Navigation Bar',
            slug='flexbox-navbar', difficulty='easy', order=0, points=10,
            language='javascript',
            description='Build a horizontal navigation bar using Flexbox.',
            instructions='Create a nav bar with logo on the left and links on the right using display: flex and margin-left: auto.',
            starter_code='.nav { /* Add your styles */ }\n',
            solution='.nav { display: flex; align-items: center; padding: 1rem; }\n.nav-links { margin-left: auto; display: flex; gap: 1rem; }',
            test_code='assert(true);',
        )
        CourseExercise.objects.create(
            course=course, concept=concept_grid, title='Photo Gallery Grid',
            slug='photo-gallery-grid', difficulty='medium', order=1, points=15,
            language='javascript',
            description='Create a responsive photo gallery using CSS Grid with auto-fit.',
            instructions='Build a grid that automatically adjusts columns based on viewport width using repeat(auto-fit, minmax(250px, 1fr)).',
            starter_code='.gallery { /* Add your grid styles */ }\n',
            solution='.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }',
            test_code='assert(true);',
        )
        CourseExercise.objects.create(
            course=course, concept=concept_anim, title='Animated Button',
            slug='animated-button', difficulty='easy', order=2, points=10,
            language='javascript',
            description='Create a button with hover transition and transform effects.',
            instructions='Style a button that scales up, changes color, and adds a shadow on hover using CSS transitions.',
            starter_code='.btn { /* Base styles */ }\n.btn:hover { /* Hover styles */ }\n',
            solution='.btn { padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 6px; transition: all 0.3s ease; cursor: pointer; }\n.btn:hover { background: #2980b9; transform: translateY(-2px) scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }',
            test_code='assert(true);',
        )
        p("CSS Exercises created (3)")

    # ─────────────────────────────────────────────
    # COUPONS
    # ─────────────────────────────────────────────
    def create_coupons(self, html_course, css_course):
        now = timezone.now()
        one_year = now + datetime.timedelta(days=365)

        # HTML coupons
        c1, _ = Coupon.objects.update_or_create(code='HTML100', defaults=dict(
            type='percentage', value=100, usage_limit=1000, valid_from=now, valid_to=one_year, scope='selected', active=True,
        ))
        c1.courses.set([html_course])

        c2, _ = Coupon.objects.update_or_create(code='WELCOME10', defaults=dict(
            type='percentage', value=10, usage_limit=500, valid_from=now, valid_to=one_year, scope='all', active=True,
        ))

        # CSS coupons
        c3, _ = Coupon.objects.update_or_create(code='CSS50', defaults=dict(
            type='percentage', value=50, usage_limit=200, valid_from=now, valid_to=one_year, scope='selected', active=True,
        ))
        c3.courses.set([css_course])

        c4, _ = Coupon.objects.update_or_create(code='BUNDLE20', defaults=dict(
            type='percentage', value=20, usage_limit=300, valid_from=now, valid_to=one_year, scope='all', active=True,
        ))

        # Smart coupons
        SmartCouponConfig.objects.update_or_create(coupon_type='welcome', defaults=dict(
            enabled=True, discount_percentage=15,
            extra_config={'message': 'Welcome to Millioncoders! Here\'s 15% off your first course.'},
        ))
        SmartCouponConfig.objects.update_or_create(coupon_type='birthday', defaults=dict(
            enabled=True, discount_percentage=25,
            extra_config={'message': 'Happy Birthday! Enjoy 25% off any course.'},
        ))

        p("Coupons created: HTML100, WELCOME10, CSS50, BUNDLE20")
        p("Smart coupons configured: welcome (15%), birthday (25%)")