import json
import logging
from datetime import datetime

from django.conf import settings as django_settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AITutorSettings, AITutorConversation

logger = logging.getLogger(__name__)

# ---------- helpers ----------

SUGGESTED_PROMPTS = {
    'text': [
        'Explain this in simpler terms',
        'Give me a real-world example',
        'What are the key takeaways?',
        'How does this apply in practice?',
        'Can you break this down step by step?',
    ],
    'video': [
        'Summarize the key points',
        "I didn't understand the part about…",
        'Can you explain with an example?',
        'What should I focus on?',
    ],
    'assignment': [
        'How many attempts do I have?',
        "What's the submission format?",
        'When is this due?',
        'Explain the rubric',
        "What's expected in a good submission?",
    ],
    'quiz': [
        'How much time do I have?',
        'Can I retake this?',
        'What topics does this cover?',
        'How is this graded?',
    ],
}


def _build_system_prompt(base_prompt, lesson_type, lesson_title, lesson_content):
    """Return a system message tailored to the lesson type."""
    if lesson_type in ('assignment', 'quiz'):
        return (
            f"{base_prompt}\n\n"
            f"IMPORTANT RULES — the student is on a {'quiz' if lesson_type == 'quiz' else 'an assignment'} "
            f"titled \"{lesson_title}\".\n"
            "• DO NOT help them write answers, solve problems, or get marks.\n"
            "• You may answer logistical questions: number of attempts, due date, submission format, rubric explanation.\n"
            "• You may clarify general concepts WITHOUT giving away the specific answer.\n"
            "• If they ask for direct help with the answer, politely decline and explain that you want them to learn by doing.\n"
        )
    return (
        f"{base_prompt}\n\n"
        f"The student is studying the lesson \"{lesson_title}\".\n"
        f"Lesson content summary:\n{lesson_content[:1500]}\n\n"
        "First ask 1-2 short clarifying questions to understand the student's background and specific confusion. "
        "Then explain with simple, layman-friendly language and concrete examples."
    )


def _call_llm(cfg: AITutorSettings, messages: list) -> str:
    """Call Groq or OpenAI and return the assistant reply text."""
    if cfg.provider == 'openai':
        import openai
        client = openai.OpenAI(api_key=cfg.api_key)
        resp = client.chat.completions.create(
            model=cfg.model_name,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return resp.choices[0].message.content
    else:
        from groq import Groq
        client = Groq(api_key=cfg.api_key)
        resp = client.chat.completions.create(
            model=cfg.model_name,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return resp.choices[0].message.content


def _send_explanation_email(user, course, lesson_title, question, answer, cfg):
    """Send a detailed explanation email to the student."""
    if not cfg.email_notifications:
        return False
    if not user.email:
        return False

    course_title = course.title
    if isinstance(course_title, dict):
        course_title = course_title.get('en', str(course_title))

    # Ask LLM for an expanded explanation
    try:
        expanded = _call_llm(cfg, [
            {'role': 'system', 'content': (
                'You are an expert tutor writing a detailed email explanation. '
                'Expand the answer below into a comprehensive study note with: '
                '1) A clear explanation with multiple examples, '
                '2) Key terminology defined, '
                '3) Common mistakes to avoid, '
                '4) A quick self-check question at the end. '
                'Format with clear headings. Be thorough but readable.'
            )},
            {'role': 'user', 'content': f"Student's question: {question}\n\nYour brief answer: {answer}\n\nPlease expand this into a detailed study note."},
        ])
    except Exception:
        expanded = answer

    html_body = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); padding: 24px; border-radius: 12px 12px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 20px;">🤖 AI Tutor — Detailed Explanation</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">{course_title} → {lesson_title}</p>
        </div>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
            <div style="background: #FFF7ED; border-left: 4px solid #F97316; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; color: #9A3412; font-weight: 600;">Your Question</p>
                <p style="margin: 4px 0 0; color: #431407;">{question}</p>
            </div>
            <div style="line-height: 1.7; color: #374151; font-size: 15px; white-space: pre-wrap;">{expanded}</div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                This email was sent by Wayne LMS AI Tutor · <a href="https://wayne-lms.vercel.app" style="color: #F97316;">Open LMS</a>
            </p>
        </div>
    </div>
    """

    try:
        send_mail(
            subject=f'AI Tutor: {lesson_title}',
            message=strip_tags(expanded),
            from_email=getattr(django_settings, 'DEFAULT_FROM_EMAIL', 'noreply@waynelms.com'),
            recipient_list=[user.email],
            html_message=html_body,
            fail_silently=True,
        )
        return True
    except Exception as e:
        logger.warning(f"AI Tutor email failed: {e}")
        return False


# ---------- API views ----------

class AITutorSettingsView(APIView):
    """GET: public (just enabled flag). PUT: admin only."""

    def get_permissions(self):
        if self.request.method == 'PUT':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get(self, request):
        cfg = AITutorSettings.load()
        data = {
            'enabled': cfg.enabled,
            'provider': cfg.provider,
            'model_name': cfg.model_name,
            'email_notifications': cfg.email_notifications,
            'system_prompt': cfg.system_prompt,
        }
        if request.user.is_staff:
            data['api_key'] = cfg.api_key  # only expose to admins
        return Response(data)

    def put(self, request):
        cfg = AITutorSettings.load()
        for field in ('enabled', 'provider', 'model_name', 'api_key', 'system_prompt', 'email_notifications'):
            if field in request.data:
                setattr(cfg, field, request.data[field])
        cfg.save()
        return Response({'status': 'ok'})


class AITutorChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cfg = AITutorSettings.load()
        if not cfg.enabled:
            return Response({'detail': 'AI Tutor is not enabled.'}, status=status.HTTP_403_FORBIDDEN)

        course_id = request.data.get('course_id')
        lesson_id = request.data.get('lesson_id')
        lesson_type = request.data.get('lesson_type', 'text')
        lesson_title = request.data.get('lesson_title', '')
        lesson_content = request.data.get('lesson_content', '')
        user_message = request.data.get('message', '').strip()

        if not user_message or not course_id or not lesson_id:
            return Response({'detail': 'message, course_id, and lesson_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create conversation
        conv, _ = AITutorConversation.objects.get_or_create(
            user=request.user,
            course_id=course_id,
            lesson_id=lesson_id,
            defaults={'lesson_type': lesson_type, 'messages': []},
        )

        # Build LLM messages
        system_msg = _build_system_prompt(cfg.system_prompt, lesson_type, lesson_title, lesson_content)
        llm_messages = [{'role': 'system', 'content': system_msg}]

        # Add conversation history (last 20 messages max)
        for msg in conv.messages[-20:]:
            llm_messages.append({'role': msg['role'], 'content': msg['content']})

        llm_messages.append({'role': 'user', 'content': user_message})

        # Call LLM
        try:
            ai_reply = _call_llm(cfg, llm_messages)
        except Exception as e:
            logger.error(f"AI Tutor LLM error: {e}")
            return Response({'detail': 'AI service temporarily unavailable. Please try again.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        now = datetime.utcnow().isoformat()
        conv.messages.append({'role': 'user', 'content': user_message, 'timestamp': now})
        conv.messages.append({'role': 'assistant', 'content': ai_reply, 'timestamp': now})
        conv.save()

        # Send email for text/video lessons
        email_sent = False
        if lesson_type in ('text', 'video') and len(user_message) > 10:
            email_sent = _send_explanation_email(request.user, conv.course, lesson_title, user_message, ai_reply, cfg)

        return Response({
            'response': ai_reply,
            'conversation_id': conv.id,
            'email_sent': email_sent,
        })


class AITutorConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        lesson_id = request.query_params.get('lesson_id')
        if not lesson_id:
            return Response({'messages': []})
        conv = AITutorConversation.objects.filter(user=request.user, lesson_id=lesson_id).first()
        if not conv:
            return Response({'messages': []})
        return Response({
            'id': conv.id,
            'messages': conv.messages,
        })


class AITutorSuggestedPromptsView(APIView):
    def get(self, request):
        lesson_type = request.query_params.get('lesson_type', 'text')
        prompts = SUGGESTED_PROMPTS.get(lesson_type, SUGGESTED_PROMPTS['text'])
        return Response({'prompts': prompts, 'lesson_type': lesson_type})
