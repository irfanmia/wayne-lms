from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.courses.models import (
    Course, Module, Lesson, Quiz, Question, Choice,
    CourseBadge, CourseFAQ, CourseConcept, CourseExercise,
)
from apps.assignments.models import Assignment


class Command(BaseCommand):
    help = "Seed one industry AI course: AI in Healthcare"

    def handle(self, *args, **options):
        self.stdout.write("\n🏥 Seeding AI in Healthcare course...\n")
        course = self.create_course()
        self.stdout.write(self.style.SUCCESS(f"\n✅ Done! Seeded: {course.slug}\n"))

    def create_course(self):
        course, created = Course.objects.update_or_create(
            slug='ai-in-healthcare',
            defaults=dict(
                title={'en': 'AI in Healthcare: Automation, Tools, and Implementation'},
                description={
                    'en': 'A practical healthcare AI course covering clinical and administrative workflows, tool setup, safe implementation, automation opportunities, case studies, quizzes, assignments, and hands-on practice.'
                },
                price=Decimal('0.00'),
                is_free=True,
                category='Artificial Intelligence',
                level='intermediate',
                duration=420,
                thumbnail='https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200',
                is_featured=True,
                enable_certificates=True,
                enable_discussions=True,
                enable_quizzes=True,
                enable_assignments=True,
                enable_points=True,
                enable_prerequisites=False,
                what_youll_learn=[
                    'Identify the highest-value AI use cases in healthcare operations and patient communication',
                    'Set up core AI tools such as ChatGPT, Microsoft Copilot, transcription tools, and automation platforms',
                    'Design safe human-in-the-loop workflows for scheduling, triage support, documentation, and follow-up',
                    'Understand governance boundaries around privacy, consent, quality checks, and escalation',
                    'Evaluate ROI, risks, and implementation readiness across clinics, hospitals, and health startups',
                    'Practice building healthcare AI workflows with implementation checklists and guided exercises',
                ],
                who_should_take={
                    'en': 'Clinic managers, healthcare administrators, founders, operations teams, medical support staff, digital transformation leads, and practitioners exploring responsible AI adoption.'
                },
            ),
        )

        self.stdout.write(f"{'Created' if created else 'Updated'} course: {course.slug}")

        course.modules.all().delete()
        course.quizzes.all().delete()
        course.assignments.all().delete()
        course.badges.all().delete()
        course.faqs.all().delete()
        course.concepts.all().delete()

        for module_index, module_data in enumerate(self.modules_data()):
            module = Module.objects.create(
                course=course,
                title={'en': module_data['title']},
                order=module_index,
            )
            self.stdout.write(f"  • Module {module_index + 1}: {module_data['title']}")

            for lesson_index, lesson_data in enumerate(module_data['lessons']):
                lesson = Lesson.objects.create(
                    module=module,
                    title={'en': lesson_data['title']},
                    content={'en': lesson_data.get('content', '')},
                    lesson_type=lesson_data.get('type', 'text'),
                    duration=lesson_data.get('duration', 10),
                    order=lesson_index,
                    slides_data=lesson_data.get('slides_data', []),
                    is_free_preview=lesson_data.get('is_free_preview', False),
                    video_url=lesson_data.get('video_url', ''),
                    video_source=lesson_data.get('video_source', ''),
                    video_duration=lesson_data.get('video_duration', ''),
                )

                if lesson_data.get('type') == 'quiz' and lesson_data.get('quiz_data'):
                    quiz = self.create_quiz(course, module, lesson_index, lesson_data['quiz_data'])
                    lesson.quiz = quiz
                    lesson.save(update_fields=['quiz'])
                    self.stdout.write(f"    - Quiz: {quiz.title.get('en')}")

                if lesson_data.get('type') == 'assignment' and lesson_data.get('assignment_data'):
                    assignment = lesson_data['assignment_data']
                    Assignment.objects.create(
                        course=course,
                        lesson=lesson,
                        title=assignment['title'],
                        description=assignment['description'],
                        submission_type=assignment.get('submission_type', 'text'),
                        answer_type=assignment.get('answer_type', 'essay'),
                        points=assignment.get('points', 100),
                        rubric=assignment.get('rubric', ''),
                        starter_code=assignment.get('starter_code', ''),
                        test_code=assignment.get('test_code', ''),
                        max_attempts=assignment.get('max_attempts', 1),
                        auto_grade=assignment.get('auto_grade', False),
                        programming_language=assignment.get('programming_language', ''),
                    )
                    self.stdout.write(f"    - Assignment: {assignment['title']}")

        self.create_practice(course)
        self.create_badges(course)
        self.create_faqs(course)
        return course

    def create_quiz(self, course, module, order, quiz_data):
        quiz = Quiz.objects.create(
            course=course,
            module=module,
            title={'en': quiz_data['title']},
            quiz_type='module_quiz',
            passing_grade=quiz_data.get('passing_grade', 60),
            time_limit=quiz_data.get('time_limit', 15),
            randomize_questions=quiz_data.get('randomize_questions', True),
            show_correct_answers=True,
            order=order,
        )

        for question_order, question_data in enumerate(quiz_data['questions']):
            question = Question.objects.create(
                quiz=quiz,
                text=question_data['text'],
                question_type=question_data['type'],
                order=question_order,
                explanation=question_data.get('explanation', ''),
                correct_text=question_data.get('correct_text', ''),
                points=question_data.get('points', 1),
            )
            for choice_order, choice_data in enumerate(question_data.get('choices', [])):
                Choice.objects.create(
                    question=question,
                    text=choice_data['text'],
                    is_correct=choice_data.get('correct', False),
                    order=choice_order,
                )

        quiz.questions_count = len(quiz_data['questions'])
        quiz.save(update_fields=['questions_count'])
        return quiz

    def create_practice(self, course):
        setup = CourseConcept.objects.create(
            course=course,
            title='AI Tool Setup',
            slug='ai-tool-setup',
            description='Set up the healthcare AI stack safely and practically.',
            order=0,
        )
        workflows = CourseConcept.objects.create(
            course=course,
            title='Workflow Automation',
            slug='workflow-automation',
            description='Map repetitive healthcare operations into AI-assisted workflows.',
            order=1,
        )
        governance = CourseConcept.objects.create(
            course=course,
            title='Governance and Review',
            slug='governance-review',
            description='Add safeguards, approvals, and quality checks.',
            order=2,
        )

        CourseExercise.objects.create(
            course=course,
            concept=setup,
            title='Healthcare AI Readiness Checklist',
            slug='healthcare-ai-readiness-checklist',
            difficulty='easy',
            language='javascript',
            points=10,
            order=0,
            description='Document the minimum setup requirements before enabling AI in a clinic workflow.',
            instructions='Create a checklist covering data source access, user roles, approved tools, consent/privacy review, escalation owner, and success metrics. Include at least 6 checklist items.',
            starter_code='// Write your checklist as bullet points or JSON\n',
            solution='[\n  "Identify the workflow owner",\n  "Confirm allowed data sources",\n  "Review privacy/compliance rules",\n  "Select approved AI tools",\n  "Define human approval checkpoints",\n  "Track baseline time and error metrics"\n]',
            test_code='assert(true);',
        )

        CourseExercise.objects.create(
            course=course,
            concept=workflows,
            title='Patient Follow-Up Workflow Builder',
            slug='patient-follow-up-workflow-builder',
            difficulty='medium',
            language='javascript',
            points=15,
            order=1,
            description='Design a simple AI-assisted follow-up workflow for discharged patients.',
            instructions='Describe a drag-and-drop style workflow with these blocks in order: trigger, data lookup, AI draft, human review, send message, log outcome. Explain what each block does.',
            starter_code='const workflow = [\n  // add workflow blocks here\n];\n',
            solution='const workflow = [\n  { step: "trigger", value: "discharge completed" },\n  { step: "data_lookup", value: "fetch patient and care plan" },\n  { step: "ai_draft", value: "draft follow-up message" },\n  { step: "human_review", value: "nurse approves or edits" },\n  { step: "send_message", value: "send via approved channel" },\n  { step: "log_outcome", value: "store response and status" }\n];',
            test_code='assert(true);',
        )

        CourseExercise.objects.create(
            course=course,
            concept=governance,
            title='Red-Flag Escalation Rules',
            slug='red-flag-escalation-rules',
            difficulty='hard',
            language='javascript',
            points=20,
            order=2,
            description='Define the rules that force AI outputs into manual review.',
            instructions='Write escalation logic for at least 5 red-flag scenarios such as medication questions, emergency symptoms, diagnosis requests, billing disputes, and incomplete records.',
            starter_code='const escalationRules = {\n  // define rules here\n};\n',
            solution='const escalationRules = {\n  medication_questions: "route to licensed clinician",\n  emergency_symptoms: "stop automation and trigger urgent escalation",\n  diagnosis_requests: "do not answer directly; request provider review",\n  billing_disputes: "route to billing supervisor",\n  incomplete_records: "pause workflow until record is verified"\n};',
            test_code='assert(true);',
        )

    def create_badges(self, course):
        badges = [
            ('healthcare-ai-starter', 'Healthcare AI Starter', 'Complete your first healthcare AI practice activity.', 'first_exercise'),
            ('workflow-designer', 'Workflow Designer', 'Complete the workflow automation practice section.', 'concept_complete'),
            ('safe-ai-operator', 'Safe AI Operator', 'Finish the governance and review tasks successfully.', 'all_exercises'),
        ]
        for slug, name, description, criteria_type in badges:
            CourseBadge.objects.create(
                course=course,
                slug=slug,
                name=name,
                description=description,
                criteria_type=criteria_type,
            )

    def create_faqs(self, course):
        faqs = [
            (
                'Is this course for doctors only?',
                'No. It is designed for administrators, care coordinators, operations teams, founders, and clinical leaders involved in workflow improvement.'
            ),
            (
                'Does this course teach diagnosis with AI?',
                'No. The focus is on safe workflow support, documentation, patient communication, and operational efficiency with human oversight.'
            ),
            (
                'Which tools are covered?',
                'The course introduces general AI copilots, transcription/documentation tools, workflow automation platforms, and implementation patterns that healthcare teams can adapt.'
            ),
            (
                'Do learners build something practical?',
                'Yes. The course includes setup tasks, workflow design exercises, quizzes, and an implementation assignment based on a real healthcare use case.'
            ),
        ]
        for index, (question, answer) in enumerate(faqs):
            CourseFAQ.objects.create(course=course, question=question, answer=answer, order=index)

    def modules_data(self):
        return [
            {
                'title': 'Healthcare AI Foundations',
                'lessons': [
                    {
                        'title': 'Why AI Matters in Healthcare Operations',
                        'type': 'text',
                        'is_free_preview': True,
                        'duration': 18,
                        'content': '''<h2>Why AI matters in healthcare</h2>
<p>Healthcare teams handle high volumes of repetitive work: appointment reminders, insurance checks, patient intake, triage routing, follow-up messages, discharge summaries, and internal documentation. AI creates leverage when it reduces low-value manual effort without weakening safety.</p>
<h3>Where AI creates value</h3>
<ul>
<li><strong>Administrative automation:</strong> scheduling, reminders, referral intake, billing support, FAQ handling</li>
<li><strong>Documentation support:</strong> summarizing conversations, structuring notes, extracting action items</li>
<li><strong>Communication support:</strong> patient education drafts, multilingual responses, follow-up guidance</li>
<li><strong>Decision support preparation:</strong> surfacing relevant information for clinicians to review</li>
</ul>
<h3>What AI should not do alone</h3>
<ul>
<li>Make final diagnoses</li>
<li>Give emergency guidance without escalation logic</li>
<li>Send medication or treatment instructions without human review</li>
<li>Operate on unapproved patient data sources</li>
</ul>
<p>The strongest implementations use <strong>human-in-the-loop workflows</strong> where AI drafts, classifies, or summarizes and a qualified person approves critical outputs.</p>''',
                    },
                    {
                        'title': 'High-Impact Use Cases Across Clinics and Hospitals',
                        'type': 'slides',
                        'duration': 14,
                        'slides_data': [
                            {'title': 'Front Desk & Intake', 'content': 'Automate appointment reminders, intake collection, missing-document follow-up, and multilingual FAQs.'},
                            {'title': 'Care Coordination', 'content': 'Generate follow-up drafts, summarize discharge actions, and route patients based on status or missing tasks.'},
                            {'title': 'Clinical Documentation', 'content': 'Use AI scribes and summarization tools to reduce time spent on notes and handoff documentation.'},
                            {'title': 'Revenue Cycle', 'content': 'Support insurance verification, billing inquiry triage, denial pattern review, and standardized response drafting.'},
                            {'title': 'Operations', 'content': 'Analyze bottlenecks, predict no-shows, classify support tickets, and create SOP-driven workflow automations.'},
                        ],
                        'content': '<p>Overview of high-impact healthcare AI opportunities.</p>',
                    },
                    {
                        'title': 'Healthcare AI Foundations Quiz',
                        'type': 'quiz',
                        'duration': 12,
                        'quiz_data': {
                            'title': 'Healthcare AI Foundations Quiz',
                            'passing_grade': 60,
                            'time_limit': 10,
                            'questions': [
                                {
                                    'text': 'Which healthcare workflow is typically a strong early AI automation candidate?',
                                    'type': 'single_choice',
                                    'explanation': 'Administrative and repetitive workflows are safer and faster for early AI wins than fully autonomous clinical decisions.',
                                    'choices': [
                                        {'text': 'Appointment reminders and intake follow-up', 'correct': True},
                                        {'text': 'Autonomous emergency diagnosis', 'correct': False},
                                        {'text': 'Unreviewed medication prescribing', 'correct': False},
                                        {'text': 'Replacing all clinicians', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'Human-in-the-loop means AI can operate without any staff review.',
                                    'type': 'true_false',
                                    'explanation': 'Human-in-the-loop means a person reviews, approves, or supervises important outputs.',
                                    'choices': [
                                        {'text': 'True', 'correct': False},
                                        {'text': 'False', 'correct': True},
                                    ],
                                },
                                {
                                    'text': 'Name one common administrative healthcare workflow where AI can save time.',
                                    'type': 'fill_blank',
                                    'correct_text': 'scheduling',
                                    'explanation': 'Examples include scheduling, reminders, intake, and follow-up messaging. The stored answer is scheduling.',
                                },
                            ],
                        },
                    },
                ],
            },
            {
                'title': 'AI Tools and Setup for Healthcare Teams',
                'lessons': [
                    {
                        'title': 'Core Tool Stack: Copilots, Scribes, and Automation Platforms',
                        'type': 'text',
                        'duration': 18,
                        'content': '''<h2>Choosing the right tool stack</h2>
<p>Most healthcare teams do not need a custom AI platform on day one. They need a controlled stack:</p>
<ul>
<li><strong>General AI copilots:</strong> for drafting, summarizing, SOP creation, policy rewriting, and internal knowledge help</li>
<li><strong>Clinical or documentation tools:</strong> for ambient note capture, structured summaries, and encounter documentation support</li>
<li><strong>Workflow automation tools:</strong> Zapier, Make, n8n, or internal integration layers for moving data between systems</li>
<li><strong>Form and messaging tools:</strong> intake forms, CRM/helpdesk, patient communication channels, email/SMS systems</li>
<li><strong>Analytics tools:</strong> dashboards to monitor turnaround time, no-shows, follow-up completion, and error rates</li>
</ul>
<p>Selection criteria should include security review, approved data access, auditability, role-based access, and ability to insert human approval steps.</p>''',
                    },
                    {
                        'title': 'Step-by-Step Setup: Secure AI Workspace for a Clinic Team',
                        'type': 'text',
                        'duration': 20,
                        'content': '''<h2>Step-by-step setup</h2>
<ol>
<li><strong>Pick one workflow first:</strong> choose appointment reminders, discharge follow-up, intake review, or billing FAQ triage.</li>
<li><strong>Assign ownership:</strong> name one workflow owner, one reviewer, and one escalation contact.</li>
<li><strong>Create a prompt library:</strong> define approved prompts for summary generation, patient-friendly rewriting, and internal classification.</li>
<li><strong>Limit data exposure:</strong> use only approved systems and remove unnecessary personally identifiable details whenever possible.</li>
<li><strong>Connect systems carefully:</strong> map trigger → data lookup → AI draft → review → send/log.</li>
<li><strong>Test with sample cases:</strong> run 10 to 20 examples before any live rollout.</li>
<li><strong>Measure performance:</strong> track time saved, error rate, turnaround time, and escalation volume.</li>
</ol>
<h3>Recommended first pilot</h3>
<p>A strong first pilot is <strong>post-visit follow-up messaging</strong> because it is frequent, repetitive, and can be reviewed before sending.</p>''',
                    },
                    {
                        'title': 'Mini Assignment: Define Your First Healthcare AI Pilot',
                        'type': 'assignment',
                        'duration': 25,
                        'assignment_data': {
                            'title': 'Define Your First Healthcare AI Pilot',
                            'description': 'Choose one healthcare workflow in your organization and write a short implementation brief covering the workflow owner, current manual steps, data sources, AI role, human review step, escalation rule, and success metrics.',
                            'submission_type': 'text',
                            'answer_type': 'essay',
                            'points': 100,
                            'max_attempts': 2,
                            'rubric': 'Workflow clarity: 20pts | Tool choice: 15pts | Human review logic: 20pts | Risk awareness: 20pts | Metrics: 25pts',
                        },
                    },
                ],
            },
            {
                'title': 'Automating Patient Communication and Front Desk Work',
                'lessons': [
                    {
                        'title': 'Use Cases: Intake, Scheduling, FAQ Handling, and Follow-Up',
                        'type': 'text',
                        'duration': 16,
                        'content': '''<h2>Front desk automation opportunities</h2>
<p>Healthcare operations often suffer from repetitive communications. AI can reduce that load when it is bounded by rules.</p>
<h3>Common wins</h3>
<ul>
<li>Drafting appointment reminders and rescheduling messages</li>
<li>Summarizing intake form submissions before staff review</li>
<li>Classifying patient inquiries into billing, appointment, document, or clinical-routing categories</li>
<li>Generating multilingual explanations for routine administrative steps</li>
<li>Creating standardized follow-up templates after visits or tests</li>
</ul>
<h3>Required safeguards</h3>
<ul>
<li>Any symptom escalation should stop automation and alert staff</li>
<li>Medication and diagnosis questions must be routed for human review</li>
<li>Messages should use approved templates and tone guidelines</li>
</ul>''',
                    },
                    {
                        'title': 'Workflow Example: AI-Assisted Discharge Follow-Up',
                        'type': 'text',
                        'duration': 18,
                        'content': '''<h2>Example workflow</h2>
<ol>
<li><strong>Trigger:</strong> patient discharge is marked complete in the system</li>
<li><strong>Data pull:</strong> discharge summary, care instructions, next appointment date, assigned coordinator</li>
<li><strong>AI draft:</strong> create a simple patient-friendly follow-up message</li>
<li><strong>Review:</strong> nurse or coordinator checks wording and removes anything inappropriate</li>
<li><strong>Send:</strong> approved message goes through the allowed channel</li>
<li><strong>Log:</strong> status is stored and unanswered cases are queued for staff review</li>
</ol>
<p>This pattern combines speed with accountability. The AI does preparation; staff keep control over final communication.</p>''',
                    },
                    {
                        'title': 'Patient Communication Quiz',
                        'type': 'quiz',
                        'duration': 12,
                        'quiz_data': {
                            'title': 'Patient Communication Quiz',
                            'passing_grade': 60,
                            'time_limit': 10,
                            'questions': [
                                {
                                    'text': 'Which step should come immediately after AI drafts a discharge follow-up message?',
                                    'type': 'single_choice',
                                    'explanation': 'A human review checkpoint should validate the message before it is sent.',
                                    'choices': [
                                        {'text': 'Human review', 'correct': True},
                                        {'text': 'Automatic billing', 'correct': False},
                                        {'text': 'Delete the patient record', 'correct': False},
                                        {'text': 'Publish to social media', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'Symptom escalation messages should continue through automation without interruption.',
                                    'type': 'true_false',
                                    'explanation': 'Potentially urgent clinical content should stop automation and route to staff immediately.',
                                    'choices': [
                                        {'text': 'True', 'correct': False},
                                        {'text': 'False', 'correct': True},
                                    ],
                                },
                                {
                                    'text': 'The first step in a discharge follow-up automation is usually the ______.',
                                    'type': 'fill_blank',
                                    'correct_text': 'trigger',
                                    'explanation': 'A workflow begins when a defined event such as discharge completion triggers it.',
                                },
                            ],
                        },
                    },
                ],
            },
            {
                'title': 'Clinical Documentation, Scribes, and Internal Efficiency',
                'lessons': [
                    {
                        'title': 'How AI Reduces Documentation Burden',
                        'type': 'text',
                        'duration': 16,
                        'content': '''<h2>Documentation is a major burden</h2>
<p>Clinicians and support staff spend large amounts of time on note preparation, summaries, handoff documentation, and coding support. AI tools can reduce that burden by converting conversations or raw notes into structured drafts.</p>
<h3>Useful patterns</h3>
<ul>
<li>Summarize encounter notes into SOAP or other approved structures</li>
<li>Generate visit summaries in patient-friendly language</li>
<li>Extract action items for care coordinators</li>
<li>Highlight missing documentation fields for completion</li>
</ul>
<h3>Non-negotiable rule</h3>
<p>Documentation produced by AI is still a draft until reviewed and accepted by the responsible professional.</p>''',
                    },
                    {
                        'title': 'Case Study: AI Scribing in Outpatient Clinics',
                        'type': 'text',
                        'duration': 14,
                        'content': '''<h2>Case study</h2>
<p>An outpatient clinic piloted AI-assisted note drafting for routine follow-up visits. The workflow used recorded or transcribed conversation data, structured it into a note draft, and required clinician approval before finalization.</p>
<h3>Observed benefits</h3>
<ul>
<li>Reduced after-hours documentation time</li>
<li>More consistent note structure</li>
<li>Faster handoff visibility for staff</li>
</ul>
<h3>Observed risks</h3>
<ul>
<li>Occasional hallucinated details if source material was incomplete</li>
<li>Template overconfidence when the clinician skipped review</li>
<li>Need for specialty-specific prompt tuning</li>
</ul>
<p>Lesson: AI can accelerate documentation, but quality control cannot be optional.</p>''',
                    },
                    {
                        'title': 'Assignment: Build a Documentation Review SOP',
                        'type': 'assignment',
                        'duration': 30,
                        'assignment_data': {
                            'title': 'Build a Documentation Review SOP',
                            'description': 'Write a standard operating procedure for reviewing AI-generated clinical or operational documentation. Include who reviews, what must be checked, what gets rejected, how corrections are logged, and how sensitive cases are escalated.',
                            'submission_type': 'text',
                            'answer_type': 'essay',
                            'points': 100,
                            'max_attempts': 2,
                            'rubric': 'Review workflow: 25pts | Risk controls: 25pts | Escalation logic: 20pts | Practicality: 15pts | Writing quality: 15pts',
                        },
                    },
                ],
            },
            {
                'title': 'Governance, Risk, and ROI',
                'lessons': [
                    {
                        'title': 'Responsible AI Boundaries in Healthcare',
                        'type': 'text',
                        'duration': 18,
                        'content': '''<h2>Governance first, then scale</h2>
<p>Healthcare AI projects fail when teams jump to deployment before defining boundaries. Every workflow needs:</p>
<ul>
<li><strong>Permitted use:</strong> what AI is allowed to do</li>
<li><strong>Restricted use:</strong> what requires human review</li>
<li><strong>Prohibited use:</strong> what AI must never do in that workflow</li>
<li><strong>Audit trail:</strong> what was generated, approved, edited, and sent</li>
<li><strong>Escalation map:</strong> who handles clinical, operational, or compliance exceptions</li>
</ul>
<p>Governance should be lightweight enough to support adoption, but strict enough to prevent unsafe automation.</p>''',
                    },
                    {
                        'title': 'Calculating ROI for a Healthcare AI Pilot',
                        'type': 'text',
                        'duration': 14,
                        'content': '''<h2>Simple ROI model</h2>
<p>Start with one workflow and compare before vs after.</p>
<ul>
<li><strong>Volume:</strong> how many times the workflow occurs per week?</li>
<li><strong>Manual effort:</strong> average staff minutes per case</li>
<li><strong>AI-assisted effort:</strong> new average minutes with review included</li>
<li><strong>Error/rework rate:</strong> before and after</li>
<li><strong>Response time:</strong> patient or internal turnaround time</li>
</ul>
<h3>Example</h3>
<p>If discharge follow-up takes 8 minutes manually and AI plus review reduces it to 3 minutes across 200 cases per month, the team saves roughly 1,000 staff minutes monthly before counting faster response times.</p>''',
                    },
                    {
                        'title': 'Governance and ROI Quiz',
                        'type': 'quiz',
                        'duration': 12,
                        'quiz_data': {
                            'title': 'Governance and ROI Quiz',
                            'passing_grade': 70,
                            'time_limit': 10,
                            'questions': [
                                {
                                    'text': 'Which of the following is essential for a safe healthcare AI rollout?',
                                    'type': 'single_choice',
                                    'explanation': 'Clear review, escalation, and audit processes are core governance elements.',
                                    'choices': [
                                        {'text': 'Human review and audit trail', 'correct': True},
                                        {'text': 'No approval checkpoints', 'correct': False},
                                        {'text': 'Hidden prompts with no owner', 'correct': False},
                                        {'text': 'Unlimited data access for all staff', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'ROI should only measure subscription cost and ignore staff time saved.',
                                    'type': 'true_false',
                                    'explanation': 'Time saved, response speed, error reduction, and throughput improvements all matter for ROI.',
                                    'choices': [
                                        {'text': 'True', 'correct': False},
                                        {'text': 'False', 'correct': True},
                                    ],
                                },
                                {
                                    'text': 'A record of what was generated, reviewed, and sent is called an ______ trail.',
                                    'type': 'fill_blank',
                                    'correct_text': 'audit',
                                    'explanation': 'An audit trail supports accountability and review.',
                                },
                            ],
                        },
                    },
                ],
            },
            {
                'title': 'Final Implementation Project',
                'lessons': [
                    {
                        'title': 'Capstone Brief: Launch One Safe AI Workflow',
                        'type': 'assignment',
                        'duration': 45,
                        'assignment_data': {
                            'title': 'Capstone: Launch One Safe AI Workflow',
                            'description': 'Design a real healthcare AI workflow for your clinic, hospital, or health startup. Your submission must include the target workflow, current pain points, selected tools, implementation steps, prompt examples, review checkpoints, escalation rules, success metrics, and a 30-day rollout plan.',
                            'submission_type': 'mixed',
                            'answer_type': 'mixed',
                            'points': 150,
                            'max_attempts': 2,
                            'rubric': 'Problem definition: 20pts | Tool/architecture choice: 20pts | Workflow logic: 25pts | Safety/governance: 30pts | Metrics and rollout plan: 30pts | Clarity: 25pts',
                        },
                    },
                    {
                        'title': 'Final Course Assessment',
                        'type': 'quiz',
                        'duration': 15,
                        'quiz_data': {
                            'title': 'AI in Healthcare Final Assessment',
                            'passing_grade': 70,
                            'time_limit': 12,
                            'questions': [
                                {
                                    'text': 'What is the best description of AI’s role in this course?',
                                    'type': 'single_choice',
                                    'explanation': 'The course emphasizes AI-assisted drafting, classification, and workflow support with human control.',
                                    'choices': [
                                        {'text': 'Assist staff through reviewed workflows', 'correct': True},
                                        {'text': 'Replace all clinical judgment', 'correct': False},
                                        {'text': 'Send all clinical advice automatically', 'correct': False},
                                        {'text': 'Ignore governance to move faster', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'A good first healthcare AI pilot is usually narrow, measurable, and reviewable.',
                                    'type': 'true_false',
                                    'explanation': 'Small, well-bounded pilots are the safest and most practical way to start.',
                                    'choices': [
                                        {'text': 'True', 'correct': True},
                                        {'text': 'False', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'Which word best describes the recommended review model for important AI outputs?',
                                    'type': 'fill_blank',
                                    'correct_text': 'human-in-the-loop',
                                    'explanation': 'Human-in-the-loop review is a core theme of the course.',
                                },
                            ],
                        },
                    },
                ],
            },
        ]
