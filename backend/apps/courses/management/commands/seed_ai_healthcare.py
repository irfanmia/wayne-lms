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
                title={'en': 'AI in Healthcare: From Workflow Mapping to Live Implementation'},
                description={
                    'en': 'Build and deploy real AI workflows for healthcare operations. Leave with working SOPs, prompt templates, escalation rules, and a 30-day rollout plan you can use at work Monday morning.'
                },
                course_type='industry',
                industry_meta={
                    'target_roles': [
                        'Clinic Operations Manager',
                        'Healthcare Administrator',
                        'Care Coordinator',
                        'Digital Health Founder',
                        'Medical Office Manager',
                        'Revenue Cycle Lead',
                    ],
                    'workflows': [
                        'Choose your role and highest-impact use case',
                        'Map one real workflow end-to-end (trigger → AI step → human review → action)',
                        'Set up the tool stack: AI copilot + automation platform + review layer',
                        'Build prompt templates, message drafts, and SOP documents',
                        'Add human review checkpoints and escalation rules',
                        'Measure ROI with before/after metrics',
                        'Write a 30-day pilot rollout plan',
                    ],
                    'tools': [
                        'AI Copilot (ChatGPT / Claude / Copilot)',
                        'Workflow automation (Zapier / Make / n8n)',
                        'Documentation / scribe tools',
                        'Patient messaging platform',
                        'Analytics dashboard',
                    ],
                    'deliverables': [
                        'Workflow blueprint for one live use case',
                        'Prompt library (5+ tested prompts)',
                        'Standard Operating Procedure document',
                        'Escalation rules and red-flag matrix',
                        'Message templates for patient communication',
                        'Tool setup checklist',
                        'ROI calculator with your real numbers',
                        '30-day pilot rollout plan',
                    ],
                    'roi_benefits': [
                        'Cut follow-up drafting time by 60-80%',
                        'Reduce documentation backlog with AI-assisted note prep',
                        'Faster patient response times on routine inquiries',
                        'Fewer manual errors in repetitive administrative tasks',
                        'Free up 5-10 staff hours per week on the pilot workflow alone',
                        'Measurable before/after metrics from day one',
                    ],
                },
                price=Decimal('0.00'),
                is_free=True,
                category='Artificial Intelligence',
                level='intermediate',
                duration=480,
                thumbnail='https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200',
                is_featured=True,
                enable_certificates=True,
                enable_discussions=True,
                enable_quizzes=True,
                enable_assignments=True,
                enable_points=True,
                enable_practice=True,
                enable_prerequisites=False,
                what_youll_learn=[
                    'Pick the highest-ROI AI use case for your specific healthcare role',
                    'Map a complete workflow: trigger, data, AI step, human review, action, logging',
                    'Set up and configure AI tools safely within healthcare compliance boundaries',
                    'Write effective prompts for clinical documentation, patient comms, and admin tasks',
                    'Build escalation rules that catch red-flag scenarios before they reach patients',
                    'Create SOPs your team can follow without you in the room',
                    'Calculate real ROI with before/after metrics on your own workflow',
                    'Launch a 30-day pilot with clear success criteria and rollback triggers',
                ],
                who_should_take={
                    'en': 'Clinic managers, healthcare administrators, care coordinators, medical office managers, digital health founders, revenue cycle leads, and operations teams who want to deploy AI responsibly and see results within 30 days.'
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
        workflow_mapping = CourseConcept.objects.create(
            course=course,
            title='Workflow Mapping',
            slug='workflow-mapping',
            description='Map a real healthcare workflow from trigger to outcome.',
            order=0,
        )
        prompt_engineering = CourseConcept.objects.create(
            course=course,
            title='Prompt Engineering for Healthcare',
            slug='prompt-engineering-healthcare',
            description='Write, test, and refine prompts for clinical and admin tasks.',
            order=1,
        )
        safety_governance = CourseConcept.objects.create(
            course=course,
            title='Safety & Escalation',
            slug='safety-escalation',
            description='Build escalation rules and safety checks for AI outputs.',
            order=2,
        )

        CourseExercise.objects.create(
            course=course,
            concept=workflow_mapping,
            title='Map Your First AI Workflow',
            slug='map-first-ai-workflow',
            difficulty='easy',
            language='javascript',
            points=15,
            order=0,
            description='Define a complete 6-step workflow for one healthcare use case.',
            instructions='''Design a workflow for a healthcare use case you actually handle at work. Your workflow must include all 6 steps:

1. TRIGGER - What event starts this workflow? (e.g., "patient discharged", "intake form submitted")
2. DATA_LOOKUP - What information does the system need? (e.g., "pull care plan and next appointment")
3. AI_DRAFT - What does AI produce? (e.g., "draft follow-up message in patient-friendly language")
4. HUMAN_REVIEW - Who reviews it and what do they check?
5. ACTION - What happens after approval? (e.g., "send via SMS", "save to EHR")
6. LOG - What gets recorded for audit?

Return a JSON array with objects containing {step, action, owner, time_estimate}.''',
            starter_code='''const workflow = [
  // Example:
  // { step: "trigger", action: "...", owner: "system", time_estimate: "instant" },
];
''',
            solution='''const workflow = [
  { step: "trigger", action: "Patient discharge marked complete in EHR", owner: "system", time_estimate: "instant" },
  { step: "data_lookup", action: "Pull discharge summary, care instructions, follow-up date, coordinator", owner: "system", time_estimate: "2 seconds" },
  { step: "ai_draft", action: "Generate patient-friendly follow-up message with care reminders", owner: "AI copilot", time_estimate: "5 seconds" },
  { step: "human_review", action: "Care coordinator reviews message for accuracy and tone", owner: "Care coordinator", time_estimate: "2 minutes" },
  { step: "action", action: "Send approved message via patient's preferred channel", owner: "messaging system", time_estimate: "instant" },
  { step: "log", action: "Record message sent, delivery status, and any patient response", owner: "system", time_estimate: "instant" }
];''',
            test_code='assert(true);',
        )

        CourseExercise.objects.create(
            course=course,
            concept=prompt_engineering,
            title='Build a Healthcare Prompt Library',
            slug='healthcare-prompt-library',
            difficulty='medium',
            language='javascript',
            points=20,
            order=1,
            description='Create 5 production-ready prompts for real healthcare tasks.',
            instructions='''Build a prompt library with at least 5 prompts for healthcare tasks. Each prompt must include:
- name: Short identifier
- task: What it does
- prompt: The actual prompt text (use {{placeholders}} for variable data)
- guardrails: What the prompt must NOT do
- review_required: boolean - does output need human review before use?

Cover at least 3 of these categories: patient communication, clinical documentation, admin/scheduling, triage/routing, billing support.''',
            starter_code='''const promptLibrary = [
  {
    name: "discharge_followup",
    task: "...",
    prompt: "...",
    guardrails: "...",
    review_required: true,
  },
  // Add 4+ more prompts
];
''',
            solution='''const promptLibrary = [
  {
    name: "discharge_followup",
    task: "Draft post-discharge follow-up message",
    prompt: "Write a friendly follow-up message for {{patient_name}} discharged on {{date}}. Include: medication reminders from {{med_list}}, next appointment on {{follow_up_date}}, and who to call for questions. Keep it under 150 words, 8th-grade reading level.",
    guardrails: "Never include dosage changes, diagnosis details, or medical advice. Do not mention other patients.",
    review_required: true,
  },
  {
    name: "visit_summary",
    task: "Summarize clinical encounter for patient",
    prompt: "Summarize this visit note in patient-friendly language: {{visit_note}}. Include: what was discussed, any next steps, and when to return. Avoid medical jargon. Max 200 words.",
    guardrails: "Do not add information not in the source note. Do not give new medical recommendations.",
    review_required: true,
  },
  {
    name: "intake_review",
    task: "Flag missing intake form fields",
    prompt: "Review this intake form submission: {{form_data}}. List any required fields that are missing or incomplete. Required fields: full name, DOB, insurance ID, primary complaint, allergies, current medications.",
    guardrails: "Only report factual gaps. Do not infer or guess missing information.",
    review_required: false,
  },
  {
    name: "appointment_reminder",
    task: "Generate personalized appointment reminder",
    prompt: "Write a reminder for {{patient_name}} about their {{appointment_type}} on {{date}} at {{time}} with {{provider_name}}. Include prep instructions: {{prep_notes}}. Add reschedule number: {{phone}}. Friendly, brief, under 80 words.",
    guardrails: "Do not include clinical details. Do not mention other appointments.",
    review_required: false,
  },
  {
    name: "note_structurer",
    task: "Structure raw clinical notes into SOAP format",
    prompt: "Convert these raw notes into SOAP format (Subjective, Objective, Assessment, Plan): {{raw_notes}}. Preserve all clinical details. Flag any section where information seems incomplete with [INCOMPLETE].",
    guardrails: "Do not fabricate clinical findings. Mark uncertain items clearly. This is a draft for clinician review only.",
    review_required: true,
  },
];''',
            test_code='assert(true);',
        )

        CourseExercise.objects.create(
            course=course,
            concept=safety_governance,
            title='Escalation Rules & Red-Flag Matrix',
            slug='escalation-rules-red-flag-matrix',
            difficulty='hard',
            language='javascript',
            points=25,
            order=2,
            description='Define the rules that catch dangerous AI outputs before they reach patients.',
            instructions='''Build an escalation matrix that covers at least 6 red-flag scenarios. For each scenario, define:
- trigger: What pattern or keyword triggers this rule
- severity: "critical" (stop everything), "high" (require senior review), or "medium" (flag for next review)
- action: What happens immediately
- escalate_to: Role or person who handles it
- max_response_time: How quickly must someone respond

Cover: medication questions, emergency symptoms, diagnosis requests, mental health crisis, insurance/billing disputes, data privacy concerns.''',
            starter_code='''const escalationMatrix = [
  // {
  //   trigger: "...",
  //   severity: "critical",
  //   action: "...",
  //   escalate_to: "...",
  //   max_response_time: "...",
  // },
];
''',
            solution='''const escalationMatrix = [
  {
    trigger: "Patient mentions chest pain, difficulty breathing, or stroke symptoms",
    severity: "critical",
    action: "Halt all automation. Display emergency message: Call 911 or go to nearest ER",
    escalate_to: "On-call clinical lead",
    max_response_time: "Immediate (< 1 minute)",
  },
  {
    trigger: "Patient asks about medication dosage, interactions, or changes",
    severity: "high",
    action: "Do not generate medication advice. Queue for licensed clinician review",
    escalate_to: "Prescribing provider or pharmacist",
    max_response_time: "Within 2 hours during business hours",
  },
  {
    trigger: "Message contains self-harm, suicidal ideation, or abuse indicators",
    severity: "critical",
    action: "Stop automation. Provide crisis hotline (988). Alert care team immediately",
    escalate_to: "Behavioral health lead + care coordinator",
    max_response_time: "Immediate (< 1 minute)",
  },
  {
    trigger: "Patient requests a diagnosis or asks 'what do I have'",
    severity: "high",
    action: "Respond with: We cannot diagnose via message. Route to scheduling for appointment",
    escalate_to: "Clinical triage nurse",
    max_response_time: "Within 4 hours",
  },
  {
    trigger: "Billing dispute or insurance denial complaint",
    severity: "medium",
    action: "Acknowledge receipt. Do not promise resolution. Queue for billing team",
    escalate_to: "Billing supervisor",
    max_response_time: "Next business day",
  },
  {
    trigger: "Patient requests records, data deletion, or mentions HIPAA",
    severity: "high",
    action: "Do not process. Route to compliance/privacy officer. Log the request",
    escalate_to: "Privacy officer",
    max_response_time: "Within 24 hours",
  },
];''',
            test_code='assert(true);',
        )

    def create_badges(self, course):
        badges = [
            ('workflow-mapper', 'Workflow Mapper', 'Map your first complete healthcare AI workflow.', 'first_exercise'),
            ('prompt-engineer', 'Prompt Engineer', 'Build a working prompt library for healthcare tasks.', 'concept_complete'),
            ('safety-architect', 'Safety Architect', 'Complete all escalation and governance exercises.', 'all_exercises'),
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
                'Is this course for doctors and clinicians?',
                'It is designed for operations and administrative roles: clinic managers, care coordinators, office managers, revenue cycle leads, and digital health founders. Clinicians are welcome but the focus is workflow implementation, not clinical decision-making.'
            ),
            (
                'Will I build something I can actually use at work?',
                'Yes. Every module produces a concrete deliverable: a workflow blueprint, prompt library, SOP, escalation matrix, or rollout plan. These are designed to be copied directly into your work environment.'
            ),
            (
                'Does this course teach AI-based diagnosis?',
                'No. The course explicitly avoids clinical decision-making by AI. It focuses on administrative workflows, documentation support, patient communication, and operational efficiency — all with mandatory human review steps.'
            ),
            (
                'What tools do I need?',
                'Access to any AI assistant (free tiers of ChatGPT, Claude, or Copilot work fine), plus optionally a workflow automation tool like Zapier or Make. No coding is required.'
            ),
            (
                'How is this different from generic AI courses?',
                'Most AI courses teach concepts. This one produces deliverables. You leave with working SOPs, tested prompts, escalation rules, and a pilot plan — all built around your actual healthcare use case.'
            ),
            (
                'Can I do this course with my team?',
                'Absolutely. The assignments work well as team exercises. Many teams assign one workflow per person and combine the deliverables into a department-level AI implementation plan.'
            ),
        ]
        for index, (question, answer) in enumerate(faqs):
            CourseFAQ.objects.create(course=course, question=question, answer=answer, order=index)

    def modules_data(self):
        return [
            {
                'title': 'Choose Your Use Case & Map the Workflow',
                'lessons': [
                    {
                        'title': 'Pick the Right First AI Use Case for Your Role',
                        'type': 'text',
                        'is_free_preview': True,
                        'duration': 15,
                        'content': '''<h2>Start with one workflow, not a platform</h2>
<p>The biggest mistake healthcare teams make with AI is trying to "adopt AI" as a general initiative. What works is picking <strong>one specific, repetitive workflow</strong> that wastes staff time and applying AI to that single process.</p>

<h3>Choosing the right first use case</h3>
<p>Your first AI workflow should be:</p>
<ul>
<li><strong>High volume:</strong> happens 20+ times per week</li>
<li><strong>Repetitive:</strong> follows a predictable pattern with minor variations</li>
<li><strong>Low clinical risk:</strong> administrative or communication, not diagnostic</li>
<li><strong>Reviewable:</strong> a human can check the output in under 2 minutes</li>
<li><strong>Measurable:</strong> you can track time, errors, or response speed before and after</li>
</ul>

<h3>Top use cases by role</h3>
<table>
<tr><td><strong>Clinic Manager</strong></td><td>Post-visit follow-up messages, appointment reminders with prep instructions</td></tr>
<tr><td><strong>Care Coordinator</strong></td><td>Discharge follow-up drafts, care plan summary for patients</td></tr>
<tr><td><strong>Office Manager</strong></td><td>Intake form review and gap detection, FAQ responses</td></tr>
<tr><td><strong>Revenue Cycle</strong></td><td>Insurance verification follow-up, denial pattern analysis</td></tr>
<tr><td><strong>Health Startup</strong></td><td>User onboarding messages, support ticket classification</td></tr>
</table>

<h3>Deliverable from this lesson</h3>
<p>By the end of this lesson, write down: (1) your role, (2) the workflow you are targeting, (3) how many times per week it happens, and (4) how many minutes it takes manually each time.</p>''',
                    },
                    {
                        'title': 'Map Your Workflow: Trigger to Outcome',
                        'type': 'text',
                        'duration': 20,
                        'content': '''<h2>The 6-step workflow map</h2>
<p>Every AI-assisted healthcare workflow follows the same structure. Mapping it explicitly prevents gaps and ensures accountability.</p>

<h3>The six steps</h3>
<ol>
<li><strong>TRIGGER:</strong> What event starts the workflow? Examples: patient discharged, intake form submitted, appointment in 48 hours, lab result received.</li>
<li><strong>DATA LOOKUP:</strong> What information does the system need to pull? Examples: patient record, care plan, insurance status, appointment details, prior messages.</li>
<li><strong>AI STEP:</strong> What does AI do with the data? Examples: draft a message, summarize notes, classify an inquiry, flag missing fields, generate a template.</li>
<li><strong>HUMAN REVIEW:</strong> Who checks the output and what do they look for? This is non-negotiable for patient-facing outputs.</li>
<li><strong>ACTION:</strong> What happens after approval? Examples: send message, save to EHR, create task, route to specialist, update status.</li>
<li><strong>LOG:</strong> What gets recorded? Examples: message content, who approved it, delivery status, patient response, time elapsed.</li>
</ol>

<h3>Example: discharge follow-up</h3>
<table>
<tr><td>Trigger</td><td>Discharge marked complete in EHR</td></tr>
<tr><td>Data</td><td>Discharge summary, care instructions, next appointment, coordinator</td></tr>
<tr><td>AI step</td><td>Draft patient-friendly follow-up message with care reminders</td></tr>
<tr><td>Review</td><td>Care coordinator checks for accuracy, tone, and completeness</td></tr>
<tr><td>Action</td><td>Send via patient's preferred channel (SMS/email/portal)</td></tr>
<tr><td>Log</td><td>Message text, approval timestamp, delivery confirmation, response</td></tr>
</table>

<h3>Deliverable</h3>
<p>Create your own 6-step map for the use case you chose in the previous lesson. This becomes the foundation for everything else in the course.</p>''',
                    },
                    {
                        'title': 'Assignment: Submit Your Workflow Map',
                        'type': 'assignment',
                        'duration': 25,
                        'assignment_data': {
                            'title': 'Workflow Map for Your Use Case',
                            'description': 'Submit a complete 6-step workflow map for your chosen use case. Include: (1) Your role and the specific workflow, (2) Trigger event, (3) Data sources needed, (4) What AI produces, (5) Who reviews and what they check, (6) Action taken after approval, (7) What gets logged. Be specific — use real system names, real roles, and real data fields from your workplace.',
                            'submission_type': 'text',
                            'answer_type': 'essay',
                            'points': 100,
                            'max_attempts': 3,
                            'rubric': 'Specificity (real use case, not generic): 25pts | All 6 steps covered: 20pts | Human review step is concrete: 20pts | Logging/audit included: 15pts | Feasibility: 20pts',
                        },
                    },
                    {
                        'title': 'Workflow Mapping Quiz',
                        'type': 'quiz',
                        'duration': 10,
                        'quiz_data': {
                            'title': 'Workflow Mapping Quiz',
                            'passing_grade': 70,
                            'time_limit': 8,
                            'questions': [
                                {
                                    'text': 'What makes a good first AI use case in healthcare?',
                                    'type': 'single_choice',
                                    'explanation': 'Start with high-volume, repetitive, low-risk tasks where output can be reviewed quickly.',
                                    'choices': [
                                        {'text': 'High volume, repetitive, low clinical risk, and reviewable', 'correct': True},
                                        {'text': 'Complex diagnostic decisions that require deep clinical judgment', 'correct': False},
                                        {'text': 'Any task, as long as it saves money', 'correct': False},
                                        {'text': 'Rare edge cases that are hard to standardize', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'In the 6-step workflow, human review comes after the AI generates output.',
                                    'type': 'true_false',
                                    'explanation': 'Human review is step 4, occurring after AI produces a draft (step 3) and before the action is taken (step 5).',
                                    'choices': [
                                        {'text': 'True', 'correct': True},
                                        {'text': 'False', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'The last step in every AI workflow should be ______.',
                                    'type': 'fill_blank',
                                    'correct_text': 'log',
                                    'explanation': 'Logging (audit trail) is the final step: recording what was generated, approved, and sent.',
                                },
                            ],
                        },
                    },
                ],
            },
            {
                'title': 'Set Up the Tool Stack',
                'lessons': [
                    {
                        'title': 'Your Healthcare AI Tool Stack: What You Actually Need',
                        'type': 'text',
                        'duration': 18,
                        'content': '''<h2>Minimum viable tool stack</h2>
<p>You do not need a custom AI platform. You need three layers working together:</p>

<h3>Layer 1: AI engine (the brain)</h3>
<p>This is the tool that generates, summarizes, classifies, or drafts content.</p>
<ul>
<li><strong>ChatGPT (Team/Enterprise)</strong> — general purpose, good for drafting and summarization</li>
<li><strong>Claude</strong> — strong at longer document analysis and careful instruction following</li>
<li><strong>Microsoft Copilot</strong> — integrates with Office 365 for teams already on Microsoft</li>
</ul>
<p><em>Selection criteria:</em> Does your organization already have an approved AI tool? Use that. If not, start with whichever offers the best data handling policy for healthcare.</p>

<h3>Layer 2: Automation engine (the pipes)</h3>
<p>This connects the trigger to the AI step to the action.</p>
<ul>
<li><strong>Zapier</strong> — easiest setup, good for simple 3-5 step workflows</li>
<li><strong>Make (Integromat)</strong> — more flexible for branching logic and error handling</li>
<li><strong>n8n</strong> — self-hosted option for teams with strict data residency requirements</li>
</ul>

<h3>Layer 3: Review and delivery (the guardrails)</h3>
<p>This is where humans approve outputs and messages get sent.</p>
<ul>
<li>Slack/Teams channel for review queue</li>
<li>Patient messaging platform (EHR portal, SMS tool, or email system)</li>
<li>Spreadsheet or dashboard for audit logging</li>
</ul>

<h3>Deliverable</h3>
<p>Write down your actual tool stack: which AI engine, which automation tool, and which review/delivery channel. If you do not have one yet, pick based on the criteria above.</p>''',
                    },
                    {
                        'title': 'Step-by-Step: Connect Your First Automation',
                        'type': 'text',
                        'duration': 22,
                        'content': '''<h2>Hands-on setup walkthrough</h2>
<p>This lesson walks through connecting a real workflow. Adapt it to your tool stack.</p>

<h3>Example: post-visit follow-up automation</h3>
<ol>
<li><strong>Create the trigger:</strong> In your automation tool, set up a trigger that fires when a new row appears in your discharge/visit-complete spreadsheet (or when a webhook fires from your EHR).</li>
<li><strong>Pull the data:</strong> Add a step that reads the patient name, visit date, provider name, follow-up instructions, and next appointment from the trigger data.</li>
<li><strong>Call the AI engine:</strong> Add an AI step with a prompt like:
<pre>Write a friendly follow-up message for {{patient_name}} who visited {{provider_name}} on {{visit_date}}.
Include these follow-up instructions: {{instructions}}.
Next appointment: {{next_appointment}}.
Keep it under 120 words, warm but professional, 8th-grade reading level.
Do NOT include any medication dosages or diagnosis information.</pre></li>
<li><strong>Route for review:</strong> Send the AI draft to a Slack/Teams channel or email inbox where a coordinator can approve, edit, or reject it.</li>
<li><strong>Send on approval:</strong> When approved, send the final message through your patient communication channel.</li>
<li><strong>Log the result:</strong> Append a row to your audit log: timestamp, patient ID, message content, who approved, delivery status.</li>
</ol>

<h3>Testing protocol</h3>
<p>Before going live: run 15-20 test cases using real (de-identified) data. Check for:</p>
<ul>
<li>Accuracy of the generated message</li>
<li>Correct data insertion (no hallucinated details)</li>
<li>Appropriate tone and reading level</li>
<li>Escalation triggers working correctly (test with red-flag scenarios)</li>
</ul>''',
                    },
                    {
                        'title': 'Assignment: Tool Stack Setup Checklist',
                        'type': 'assignment',
                        'duration': 20,
                        'assignment_data': {
                            'title': 'Tool Stack Setup Checklist',
                            'description': 'Submit a completed setup checklist for your specific tool stack. Include: (1) AI engine name + account type + data handling policy summary, (2) Automation tool name + trigger configured, (3) Review channel (where drafts go for approval), (4) Delivery channel (how approved messages reach patients/staff), (5) Audit log location and fields tracked, (6) Who has access to each tool and at what permission level.',
                            'submission_type': 'text',
                            'answer_type': 'essay',
                            'points': 100,
                            'max_attempts': 3,
                            'rubric': 'All 3 layers covered: 25pts | Specific tools named (not generic): 20pts | Data/privacy considered: 20pts | Access control defined: 15pts | Audit logging included: 20pts',
                        },
                    },
                ],
            },
            {
                'title': 'Build Your Prompt Library & Message Templates',
                'lessons': [
                    {
                        'title': 'Writing Effective Healthcare Prompts',
                        'type': 'text',
                        'duration': 20,
                        'content': '''<h2>Prompt engineering for healthcare: rules that matter</h2>
<p>Healthcare prompts are different from general prompts because the cost of a bad output is higher. Every prompt needs built-in guardrails.</p>

<h3>The healthcare prompt formula</h3>
<pre>
ROLE: You are a [specific assistant role, e.g., "patient communication assistant for a family medicine clinic"].
TASK: [Exactly what to produce].
INPUT: [What data you are providing — use {{placeholders}}].
CONSTRAINTS:
- [Reading level / word count / tone]
- [What to NEVER include]
- [What to flag if uncertain]
OUTPUT FORMAT: [How the result should be structured].
</pre>

<h3>Example: patient follow-up prompt</h3>
<pre>
ROLE: You are a patient communication assistant for Riverside Family Clinic.
TASK: Write a follow-up message for a patient who visited today.
INPUT:
- Patient name: {{patient_name}}
- Visit date: {{visit_date}}
- Provider: {{provider_name}}
- Follow-up instructions: {{instructions}}
- Next appointment: {{next_appointment}}
CONSTRAINTS:
- Keep under 120 words
- 8th-grade reading level
- Warm but professional tone
- NEVER include medication dosages, diagnosis, or lab values
- If instructions mention anything about emergency symptoms, add: "If you experience these symptoms, call 911 or go to the nearest emergency room"
OUTPUT FORMAT: Plain text message ready to send via SMS.
</pre>

<h3>Testing your prompts</h3>
<p>Run each prompt 5 times with different inputs. Check for:</p>
<ul>
<li>Consistency: Does it follow constraints every time?</li>
<li>Accuracy: Does it use only the data provided (no hallucination)?</li>
<li>Guardrails: Does it refuse to include prohibited content?</li>
<li>Edge cases: What happens with incomplete or unusual data?</li>
</ul>''',
                    },
                    {
                        'title': 'Building SOPs and Message Templates',
                        'type': 'text',
                        'duration': 18,
                        'content': '''<h2>From prompts to SOPs your team can follow</h2>
<p>A prompt is what you tell the AI. An SOP is what you tell your team. Every AI workflow needs both.</p>

<h3>SOP template for an AI-assisted workflow</h3>
<pre>
STANDARD OPERATING PROCEDURE
Workflow: [Name]
Owner: [Role]
Last updated: [Date]

PURPOSE
[One sentence: what this workflow does and why]

TRIGGER
[When does this workflow start?]

STEPS
1. [Step with responsible person and time estimate]
2. [Step...]
3. [Step...]

REVIEW CRITERIA
Before approving AI output, the reviewer must check:
- [ ] All facts match source data
- [ ] No prohibited content (medication dosages, diagnoses, etc.)
- [ ] Tone matches guidelines
- [ ] Patient name and dates are correct

ESCALATION
If any of these occur, STOP and escalate:
- [Red flag 1]
- [Red flag 2]
Escalate to: [Role] via [Channel]

AUDIT
Log these fields after each use:
[Field list]
</pre>

<h3>Message template examples</h3>
<p>Create reusable templates for your most common message types. Templates should have clear placeholders and be pre-approved by your compliance/legal team.</p>

<h3>Deliverable</h3>
<p>Write one complete SOP for your chosen workflow. This document should be clear enough that a colleague could run the workflow without any verbal explanation from you.</p>''',
                    },
                    {
                        'title': 'Assignment: SOP + Prompt Library',
                        'type': 'assignment',
                        'duration': 30,
                        'assignment_data': {
                            'title': 'SOP Document + Prompt Library',
                            'description': 'Submit two deliverables: (1) A complete SOP for your AI workflow — include purpose, trigger, steps, review criteria, escalation rules, and audit fields. (2) A prompt library with at least 3 tested prompts in the ROLE-TASK-INPUT-CONSTRAINTS-FORMAT structure. Each prompt should include the guardrails section. These documents should be ready to share with your team.',
                            'submission_type': 'text',
                            'answer_type': 'essay',
                            'points': 120,
                            'max_attempts': 3,
                            'rubric': 'SOP completeness: 30pts | SOP clarity (could a colleague follow it?): 20pts | Prompt library (3+ prompts, proper structure): 30pts | Guardrails in every prompt: 20pts | Production readiness: 20pts',
                        },
                    },
                    {
                        'title': 'Prompts & SOPs Quiz',
                        'type': 'quiz',
                        'duration': 10,
                        'quiz_data': {
                            'title': 'Prompts & SOPs Quiz',
                            'passing_grade': 70,
                            'time_limit': 8,
                            'questions': [
                                {
                                    'text': 'What is the most important difference between a healthcare AI prompt and a general-purpose prompt?',
                                    'type': 'single_choice',
                                    'explanation': 'Healthcare prompts need explicit guardrails about what the AI must never include, because bad outputs can harm patients.',
                                    'choices': [
                                        {'text': 'Healthcare prompts need built-in guardrails about prohibited content', 'correct': True},
                                        {'text': 'Healthcare prompts should be longer', 'correct': False},
                                        {'text': 'Healthcare prompts do not need testing', 'correct': False},
                                        {'text': 'Healthcare prompts should use technical medical jargon', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'An SOP should be clear enough that a colleague can run the workflow without verbal explanation.',
                                    'type': 'true_false',
                                    'explanation': 'If the SOP requires the author to explain it verbally, it is not complete enough.',
                                    'choices': [
                                        {'text': 'True', 'correct': True},
                                        {'text': 'False', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'Before deploying a prompt, you should test it at least ______ times with different inputs.',
                                    'type': 'fill_blank',
                                    'correct_text': '5',
                                    'explanation': 'Running at least 5 test cases helps catch inconsistencies and edge case failures.',
                                },
                            ],
                        },
                    },
                ],
            },
            {
                'title': 'Human Review, Escalation & Safety',
                'lessons': [
                    {
                        'title': 'Designing Human Review That Actually Works',
                        'type': 'text',
                        'duration': 16,
                        'content': '''<h2>Review checkpoints that do not become bottlenecks</h2>
<p>The goal of human review is not to create a rubberstamp. It is to catch the 5% of AI outputs that are wrong before they reach a patient.</p>

<h3>Review design principles</h3>
<ul>
<li><strong>Time-boxed:</strong> Review should take under 2 minutes per item. If it takes longer, the AI output needs improvement or the workflow needs restructuring.</li>
<li><strong>Checklist-driven:</strong> Reviewers check specific criteria, not "does this look okay?"</li>
<li><strong>Batch-friendly:</strong> Queue outputs for review in batches rather than one-at-a-time interrupts.</li>
<li><strong>Escape-hatch ready:</strong> One-click reject and escalate. Do not make it hard to say no.</li>
</ul>

<h3>Review checklist template</h3>
<p>For every AI-generated output, the reviewer checks:</p>
<ol>
<li>Does the output use only data from the source? (No hallucinated details)</li>
<li>Is prohibited content absent? (No dosages, diagnoses, or medical advice unless explicitly approved)</li>
<li>Is the patient name, date, and appointment info correct?</li>
<li>Is the tone appropriate?</li>
<li>Does it need escalation? (red-flag content detected)</li>
</ol>''',
                    },
                    {
                        'title': 'Building Your Escalation Rules',
                        'type': 'text',
                        'duration': 18,
                        'content': '''<h2>Escalation is not optional — it is the safety layer</h2>
<p>Every AI workflow needs rules that automatically stop automation when certain conditions are detected.</p>

<h3>Three severity levels</h3>
<table>
<tr><td><strong>Critical</strong></td><td>Stop everything. Alert immediately. Examples: emergency symptoms, self-harm indicators, medication safety.</td></tr>
<tr><td><strong>High</strong></td><td>Pause workflow. Require senior review before proceeding. Examples: diagnosis questions, medication inquiries, complex complaints.</td></tr>
<tr><td><strong>Medium</strong></td><td>Flag for next review cycle. Examples: billing disputes, data requests, unusual questions.</td></tr>
</table>

<h3>Red-flag scenarios every healthcare AI workflow must handle</h3>
<ol>
<li><strong>Emergency symptoms:</strong> chest pain, difficulty breathing, stroke signs, severe allergic reaction</li>
<li><strong>Mental health crisis:</strong> self-harm, suicidal ideation, abuse indicators</li>
<li><strong>Medication safety:</strong> dosage questions, interaction concerns, adverse reactions</li>
<li><strong>Diagnosis requests:</strong> "what do I have?", "is this cancer?", symptom interpretation</li>
<li><strong>Privacy/legal:</strong> records requests, HIPAA mentions, legal threats</li>
<li><strong>Incomplete data:</strong> AI output based on missing fields or conflicting information</li>
</ol>

<h3>Deliverable</h3>
<p>Build an escalation matrix for your workflow with at least 5 rules, each with: trigger, severity, immediate action, who gets escalated to, and response time requirement.</p>''',
                    },
                    {
                        'title': 'Assignment: Escalation Matrix + Review Checklist',
                        'type': 'assignment',
                        'duration': 25,
                        'assignment_data': {
                            'title': 'Escalation Matrix + Review Checklist',
                            'description': 'Submit: (1) An escalation matrix with at least 5 rules covering critical/high/medium severity scenarios relevant to your workflow. Each rule must include trigger, severity level, immediate action, escalation target, and response time. (2) A review checklist your team reviewer would use to approve or reject each AI output. The checklist should have at least 5 specific items to check.',
                            'submission_type': 'text',
                            'answer_type': 'essay',
                            'points': 100,
                            'max_attempts': 3,
                            'rubric': 'Escalation matrix completeness (5+ rules, 3 severity levels): 30pts | Rules are specific to your workflow: 20pts | Review checklist is actionable: 20pts | Response times defined: 15pts | Practicality: 15pts',
                        },
                    },
                    {
                        'title': 'Safety & Escalation Quiz',
                        'type': 'quiz',
                        'duration': 10,
                        'quiz_data': {
                            'title': 'Safety & Escalation Quiz',
                            'passing_grade': 70,
                            'time_limit': 8,
                            'questions': [
                                {
                                    'text': 'A patient asks the AI chatbot "Am I having a heart attack?" — what should happen?',
                                    'type': 'single_choice',
                                    'explanation': 'Emergency symptom mentions must immediately halt automation and provide emergency guidance.',
                                    'choices': [
                                        {'text': 'Stop automation, show emergency info (call 911), alert clinical staff', 'correct': True},
                                        {'text': 'Have the AI provide a medical assessment', 'correct': False},
                                        {'text': 'Queue it for next-day review', 'correct': False},
                                        {'text': 'Ignore it and continue the workflow', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'Review should take under 2 minutes per AI output to avoid creating a bottleneck.',
                                    'type': 'true_false',
                                    'explanation': 'If review takes longer, the AI output quality or the workflow design needs improvement.',
                                    'choices': [
                                        {'text': 'True', 'correct': True},
                                        {'text': 'False', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'The escalation severity level that requires immediate action with no delay is called ______.',
                                    'type': 'fill_blank',
                                    'correct_text': 'critical',
                                    'explanation': 'Critical severity means stop everything and act immediately.',
                                },
                            ],
                        },
                    },
                ],
            },
            {
                'title': 'Measure ROI & Build Your Rollout Plan',
                'lessons': [
                    {
                        'title': 'Calculating ROI With Your Real Numbers',
                        'type': 'text',
                        'duration': 16,
                        'content': '''<h2>Prove the value with before/after data</h2>
<p>ROI is what gets your pilot approved, funded, and expanded. Measure it from day one.</p>

<h3>The simple ROI framework</h3>
<p>For your one pilot workflow, track these metrics before and after AI:</p>
<table>
<tr><th>Metric</th><th>Before AI</th><th>After AI</th></tr>
<tr><td>Volume per week</td><td>[e.g., 150 follow-ups]</td><td>[same volume]</td></tr>
<tr><td>Minutes per task (manual)</td><td>[e.g., 8 min]</td><td>[e.g., 2 min with AI + review]</td></tr>
<tr><td>Staff hours per week</td><td>[volume × minutes ÷ 60]</td><td>[volume × minutes ÷ 60]</td></tr>
<tr><td>Error/rework rate</td><td>[e.g., 12%]</td><td>[target: under 5%]</td></tr>
<tr><td>Response time to patient</td><td>[e.g., 4 hours]</td><td>[target: under 1 hour]</td></tr>
</table>

<h3>Example calculation</h3>
<p>150 follow-ups/week × (8 min - 2 min saved) = 900 minutes saved per week = <strong>15 hours per week</strong>.</p>
<p>At $25/hour labor cost = <strong>$375/week saved</strong> = $19,500/year on one workflow.</p>

<h3>Beyond time savings</h3>
<ul>
<li>Faster response time → higher patient satisfaction scores</li>
<li>Fewer errors → reduced rework and complaint handling</li>
<li>Consistent formatting → better compliance and audit readiness</li>
<li>Staff satisfaction → less burnout from repetitive tasks</li>
</ul>''',
                    },
                    {
                        'title': 'Your 30-Day Pilot Rollout Plan',
                        'type': 'text',
                        'duration': 20,
                        'content': '''<h2>From course deliverables to live pilot in 30 days</h2>

<h3>Week 1: Prepare (days 1-7)</h3>
<ul>
<li>Finalize workflow map and get sign-off from workflow owner</li>
<li>Set up tool stack (AI engine + automation + review channel)</li>
<li>Create prompt library and test with 10 sample cases</li>
<li>Draft SOP and share with review team</li>
</ul>

<h3>Week 2: Test (days 8-14)</h3>
<ul>
<li>Run 20 test cases with real (de-identified) data</li>
<li>Document results: accuracy rate, review time, edge cases found</li>
<li>Refine prompts based on test results</li>
<li>Train the reviewer(s) on the SOP and escalation rules</li>
</ul>

<h3>Week 3: Soft launch (days 15-21)</h3>
<ul>
<li>Go live with 25% of volume (e.g., one provider's patients, or morning-only)</li>
<li>Monitor every output closely — reviewer checks 100%</li>
<li>Track all metrics: time per task, error rate, escalations triggered</li>
<li>Hold a 15-minute daily check-in with the review team</li>
</ul>

<h3>Week 4: Scale and report (days 22-30)</h3>
<ul>
<li>If Week 3 error rate is under 5%, expand to 100% volume</li>
<li>Reduce review intensity if warranted (spot-check instead of 100%)</li>
<li>Compile ROI report: time saved, error reduction, satisfaction impact</li>
<li>Present to leadership with recommendation for next workflow to automate</li>
</ul>

<h3>Rollback triggers</h3>
<p>Stop the pilot immediately if:</p>
<ul>
<li>Error rate exceeds 10% for two consecutive days</li>
<li>Any critical escalation is missed</li>
<li>Patient complaints spike above baseline</li>
<li>Review team reports >3 minutes average review time</li>
</ul>''',
                    },
                    {
                        'title': 'Capstone: Complete Rollout Plan + ROI Projection',
                        'type': 'assignment',
                        'duration': 40,
                        'assignment_data': {
                            'title': 'Capstone: 30-Day Rollout Plan + ROI Projection',
                            'description': '''Submit your complete implementation package with all deliverables:

1. WORKFLOW MAP: Your 6-step workflow for one specific use case
2. TOOL STACK: AI engine, automation platform, review channel, delivery method, audit log
3. PROMPT LIBRARY: At least 3 tested prompts with guardrails
4. SOP: Complete standard operating procedure your team can follow
5. ESCALATION MATRIX: 5+ rules with severity, action, and response time
6. ROI PROJECTION: Before/after metrics with dollar savings estimate
7. 30-DAY ROLLOUT PLAN: Week-by-week plan with rollback triggers

This submission represents a complete pilot proposal you could present to leadership on Monday.''',
                            'submission_type': 'mixed',
                            'answer_type': 'mixed',
                            'points': 200,
                            'max_attempts': 3,
                            'rubric': 'Workflow map complete and specific: 25pts | Tool stack defined: 20pts | Prompt library (3+ with guardrails): 25pts | SOP clear and followable: 25pts | Escalation matrix: 25pts | ROI with real numbers: 30pts | 30-day plan with rollback triggers: 30pts | Overall production-readiness: 20pts',
                        },
                    },
                    {
                        'title': 'Final Assessment',
                        'type': 'quiz',
                        'duration': 15,
                        'quiz_data': {
                            'title': 'AI in Healthcare Final Assessment',
                            'passing_grade': 70,
                            'time_limit': 12,
                            'questions': [
                                {
                                    'text': 'What is the single best description of AI\'s role in this course?',
                                    'type': 'single_choice',
                                    'explanation': 'AI assists by drafting and classifying, with humans controlling approval and final actions.',
                                    'choices': [
                                        {'text': 'AI drafts and classifies; humans review and approve', 'correct': True},
                                        {'text': 'AI makes autonomous clinical decisions', 'correct': False},
                                        {'text': 'AI replaces staff entirely', 'correct': False},
                                        {'text': 'AI works without any safety rules', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'A good healthcare AI pilot should start with a narrow, measurable, and reviewable workflow.',
                                    'type': 'true_false',
                                    'explanation': 'Starting narrow and measurable allows you to prove value safely before expanding.',
                                    'choices': [
                                        {'text': 'True', 'correct': True},
                                        {'text': 'False', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'The recommended review model for important AI outputs in healthcare is called ______-in-the-loop.',
                                    'type': 'fill_blank',
                                    'correct_text': 'human',
                                    'explanation': 'Human-in-the-loop means a qualified person reviews and approves AI output before it is acted on.',
                                },
                                {
                                    'text': 'Which metric is NOT part of the basic ROI calculation for a healthcare AI pilot?',
                                    'type': 'single_choice',
                                    'explanation': 'Stock price is irrelevant. ROI measures time saved, errors reduced, response speed, and throughput.',
                                    'choices': [
                                        {'text': 'Company stock price', 'correct': True},
                                        {'text': 'Minutes saved per task', 'correct': False},
                                        {'text': 'Error/rework rate before and after', 'correct': False},
                                        {'text': 'Patient response time improvement', 'correct': False},
                                    ],
                                },
                                {
                                    'text': 'During Week 3 of the rollout plan, what percentage of volume should you start with?',
                                    'type': 'single_choice',
                                    'explanation': 'Soft launch at 25% volume to validate with close monitoring before scaling.',
                                    'choices': [
                                        {'text': '25%', 'correct': True},
                                        {'text': '100%', 'correct': False},
                                        {'text': '5%', 'correct': False},
                                        {'text': '75%', 'correct': False},
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
        ]
