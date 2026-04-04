import subprocess
import tempfile
import os
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import (
    Course, CourseConcept, CourseExercise, CourseExerciseProgress,
    CourseBadge, UserCourseBadge, Enrollment,
)


def _get_course(slug):
    try:
        return Course.objects.get(slug=slug)
    except Course.DoesNotExist:
        return None


def _get_enrollment(user, course):
    if not user.is_authenticated:
        return None
    try:
        return Enrollment.objects.get(user=user, course=course)
    except Enrollment.DoesNotExist:
        return None


def _concept_data(concept, user=None, enrollment=None):
    exercises = concept.exercises.all()
    exercise_list = []
    for ex in exercises:
        ex_data = {
            'id': ex.id, 'title': ex.title, 'slug': ex.slug,
            'difficulty': ex.difficulty, 'points': ex.points, 'order': ex.order,
            'language': ex.language,
        }
        if user and user.is_authenticated and enrollment:
            prog = CourseExerciseProgress.objects.filter(user=user, course_exercise=ex).first()
            ex_data['status'] = prog.status if prog else 'not_started'
            ex_data['points_earned'] = prog.points_earned if prog else 0
        else:
            ex_data['status'] = 'not_started'
            ex_data['points_earned'] = 0
        exercise_list.append(ex_data)

    completed = sum(1 for e in exercise_list if e['status'] == 'completed')
    return {
        'id': concept.id, 'title': concept.title, 'description': concept.description,
        'slug': concept.slug, 'order': concept.order, 'icon': concept.icon,
        'prerequisite_ids': list(concept.prerequisites.values_list('id', flat=True)),
        'exercises': exercise_list,
        'exercise_count': len(exercise_list),
        'completed_count': completed,
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def practice_overview(request, slug):
    course = _get_course(slug)
    if not course:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    enrollment = _get_enrollment(request.user, course) if request.user.is_authenticated else None
    concepts = course.concepts.prefetch_related('exercises', 'prerequisites').all()

    concepts_data = [_concept_data(c, request.user, enrollment) for c in concepts]
    total_exercises = sum(c['exercise_count'] for c in concepts_data)
    completed_exercises = sum(c['completed_count'] for c in concepts_data)
    total_points = 0
    if enrollment:
        total_points = sum(
            CourseExerciseProgress.objects.filter(
                enrollment=enrollment, status='completed'
            ).values_list('points_earned', flat=True)
        )

    return Response({
        'concepts': concepts_data,
        'total_exercises': total_exercises,
        'completed_exercises': completed_exercises,
        'total_points': total_points,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def concept_map(request, slug):
    course = _get_course(slug)
    if not course:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    enrollment = _get_enrollment(request.user, course) if request.user.is_authenticated else None
    concepts = course.concepts.prefetch_related('exercises', 'prerequisites').all()

    nodes = []
    edges = []
    for c in concepts:
        exercises = c.exercises.all()
        completed = 0
        if enrollment:
            completed = CourseExerciseProgress.objects.filter(
                enrollment=enrollment, course_exercise__concept=c, status='completed'
            ).count()
        total = exercises.count()
        if total == 0:
            s = 'locked'
        elif completed == total:
            s = 'completed'
        elif completed > 0:
            s = 'in_progress'
        else:
            s = 'not_started'

        nodes.append({
            'id': c.id, 'title': c.title, 'slug': c.slug,
            'icon': c.icon, 'order': c.order,
            'status': s, 'completed': completed, 'total': total,
        })
        for prereq in c.prerequisites.all():
            edges.append({'from': prereq.id, 'to': c.id})

    return Response({'nodes': nodes, 'edges': edges})


@api_view(['GET'])
@permission_classes([AllowAny])
def exercise_list(request, slug):
    course = _get_course(slug)
    if not course:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    enrollment = _get_enrollment(request.user, course) if request.user.is_authenticated else None
    exercises = CourseExercise.objects.filter(course=course).select_related('concept')

    data = []
    for ex in exercises:
        ex_data = {
            'id': ex.id, 'title': ex.title, 'slug': ex.slug,
            'concept': ex.concept.title, 'concept_slug': ex.concept.slug,
            'difficulty': ex.difficulty, 'points': ex.points, 'language': ex.language,
            'order': ex.order,
        }
        if enrollment:
            prog = CourseExerciseProgress.objects.filter(user=request.user, course_exercise=ex).first()
            ex_data['status'] = prog.status if prog else 'not_started'
        else:
            ex_data['status'] = 'not_started'
        data.append(ex_data)

    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def exercise_detail(request, slug, exercise_slug):
    course = _get_course(slug)
    if not course:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        ex = CourseExercise.objects.select_related('concept').get(course=course, slug=exercise_slug)
    except CourseExercise.DoesNotExist:
        return Response({'detail': 'Exercise not found'}, status=status.HTTP_404_NOT_FOUND)

    data = {
        'id': ex.id, 'title': ex.title, 'slug': ex.slug,
        'description': ex.description, 'instructions': ex.instructions,
        'difficulty': ex.difficulty, 'starter_code': ex.starter_code,
        'test_code': ex.test_code, 'language': ex.language,
        'points': ex.points, 'order': ex.order,
        'concept': ex.concept.title, 'concept_slug': ex.concept.slug,
    }

    if request.user.is_authenticated:
        prog = CourseExerciseProgress.objects.filter(user=request.user, course_exercise=ex).first()
        data['status'] = prog.status if prog else 'not_started'
        data['code_submitted'] = prog.code_submitted if prog else None
        data['attempts'] = prog.attempts if prog else 0
        data['points_earned'] = prog.points_earned if prog else 0
    else:
        data['status'] = 'not_started'

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def exercise_submit(request, slug, exercise_slug):
    course = _get_course(slug)
    if not course:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    enrollment = _get_enrollment(request.user, course)
    if not enrollment:
        return Response({'detail': 'Not enrolled'}, status=status.HTTP_403_FORBIDDEN)

    try:
        ex = CourseExercise.objects.get(course=course, slug=exercise_slug)
    except CourseExercise.DoesNotExist:
        return Response({'detail': 'Exercise not found'}, status=status.HTTP_404_NOT_FOUND)

    code = request.data.get('code', '')
    if not code.strip():
        return Response({'detail': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Run tests
    test_results = _run_tests(code, ex.test_code, ex.language)

    progress, _ = CourseExerciseProgress.objects.get_or_create(
        user=request.user, course_exercise=ex,
        defaults={'enrollment': enrollment}
    )
    progress.attempts += 1
    progress.code_submitted = code

    all_passed = all(r['passed'] for r in test_results)
    if all_passed:
        if progress.status != 'completed':
            progress.status = 'completed'
            progress.completed_at = timezone.now()
            progress.points_earned = ex.points
    else:
        progress.status = 'failed'

    progress.save()

    # Check badges
    new_badges = _check_badges(request.user, enrollment, course) if all_passed else []

    return Response({
        'passed': all_passed,
        'test_results': test_results,
        'points_earned': progress.points_earned,
        'attempts': progress.attempts,
        'status': progress.status,
        'new_badges': new_badges,
    })


def _run_tests(code, test_code, language):
    """Run user code + test code and return results."""
    if language != 'python':
        return [{'name': 'Test', 'passed': False, 'output': f'Language {language} not supported for execution'}]

    full_code = f"{code}\n\n{test_code}"
    results = []
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(full_code)
            f.flush()
            try:
                result = subprocess.run(
                    ['python3', f.name],
                    capture_output=True, text=True, timeout=10
                )
                if result.returncode == 0:
                    output = result.stdout.strip()
                    # Parse test output lines
                    if output:
                        for line in output.split('\n'):
                            if line.startswith('PASS:'):
                                results.append({'name': line[5:].strip(), 'passed': True, 'output': ''})
                            elif line.startswith('FAIL:'):
                                results.append({'name': line[5:].strip(), 'passed': False, 'output': ''})
                            else:
                                results.append({'name': line, 'passed': True, 'output': ''})
                    if not results:
                        results.append({'name': 'All tests', 'passed': True, 'output': output})
                else:
                    results.append({
                        'name': 'Execution',
                        'passed': False,
                        'output': result.stderr.strip() or 'Runtime error'
                    })
            except subprocess.TimeoutExpired:
                results.append({'name': 'Execution', 'passed': False, 'output': 'Timeout (10s)'})
            finally:
                os.unlink(f.name)
    except Exception as e:
        results.append({'name': 'System', 'passed': False, 'output': str(e)})

    return results


def _check_badges(user, enrollment, course):
    """Check and award any newly earned badges."""
    new_badges = []
    all_badges = CourseBadge.objects.filter(course=course)
    earned_slugs = set(UserCourseBadge.objects.filter(
        user=user, course_badge__course=course
    ).values_list('course_badge__slug', flat=True))

    completed_progress = CourseExerciseProgress.objects.filter(
        enrollment=enrollment, status='completed'
    )
    completed_count = completed_progress.count()
    all_exercises = CourseExercise.objects.filter(course=course)
    total_count = all_exercises.count()

    for badge in all_badges:
        if badge.slug in earned_slugs:
            continue

        earned = False
        if badge.criteria_type == 'first_exercise' and completed_count >= 1:
            earned = True
        elif badge.criteria_type == 'all_easy':
            easy = all_exercises.filter(difficulty='easy')
            if easy.count() > 0 and completed_progress.filter(course_exercise__difficulty='easy').count() >= easy.count():
                earned = True
        elif badge.criteria_type == 'all_medium':
            medium = all_exercises.filter(difficulty='medium')
            if medium.count() > 0 and completed_progress.filter(course_exercise__difficulty='medium').count() >= medium.count():
                earned = True
        elif badge.criteria_type == 'all_hard':
            hard = all_exercises.filter(difficulty='hard')
            if hard.count() > 0 and completed_progress.filter(course_exercise__difficulty='hard').count() >= hard.count():
                earned = True
        elif badge.criteria_type == 'all_exercises' and completed_count >= total_count and total_count > 0:
            earned = True
        elif badge.criteria_type == 'streak_5':
            # Check if last 5 submissions were all completed (no failures)
            recent = CourseExerciseProgress.objects.filter(
                enrollment=enrollment
            ).order_by('-completed_at')[:5]
            if recent.count() >= 5 and all(p.status == 'completed' for p in recent):
                earned = True
        elif badge.criteria_type == 'concept_complete':
            # Any concept fully completed
            for concept in course.concepts.all():
                concept_exercises = concept.exercises.count()
                if concept_exercises > 0:
                    concept_completed = completed_progress.filter(course_exercise__concept=concept).count()
                    if concept_completed >= concept_exercises:
                        earned = True
                        break
        elif badge.criteria_type == 'perfect_score':
            # All exercises completed with no failures (attempts == 1 for all)
            if completed_count >= total_count and total_count > 0:
                all_first_try = all(
                    p.attempts == 1 for p in completed_progress
                )
                if all_first_try:
                    earned = True

        if earned:
            UserCourseBadge.objects.create(user=user, course_badge=badge)
            new_badges.append({
                'name': badge.name, 'slug': badge.slug,
                'description': badge.description, 'icon_url': badge.icon_url,
            })

    return new_badges


@api_view(['GET'])
@permission_classes([AllowAny])
def practice_progress(request, slug):
    course = _get_course(slug)
    if not course:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_authenticated:
        return Response({
            'completed': 0, 'total': 0, 'points': 0,
            'badges_earned': 0, 'streak': 0,
        })

    enrollment = _get_enrollment(request.user, course)
    if not enrollment:
        return Response({
            'completed': 0, 'total': 0, 'points': 0,
            'badges_earned': 0, 'streak': 0,
        })

    completed = CourseExerciseProgress.objects.filter(enrollment=enrollment, status='completed')
    total = CourseExercise.objects.filter(course=course).count()
    points = sum(completed.values_list('points_earned', flat=True))
    badges = UserCourseBadge.objects.filter(user=request.user, course_badge__course=course).count()

    # Calculate streak
    recent = CourseExerciseProgress.objects.filter(
        enrollment=enrollment
    ).order_by('-completed_at')
    streak = 0
    for p in recent:
        if p.status == 'completed':
            streak += 1
        else:
            break

    return Response({
        'completed': completed.count(), 'total': total, 'points': points,
        'badges_earned': badges, 'streak': streak,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def practice_badges(request, slug):
    course = _get_course(slug)
    if not course:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    badges = CourseBadge.objects.filter(course=course)
    earned = {}
    if request.user.is_authenticated:
        earned = {
            ucb.course_badge_id: ucb.earned_at
            for ucb in UserCourseBadge.objects.filter(
                user=request.user, course_badge__course=course
            )
        }

    data = []
    for b in badges:
        data.append({
            'id': b.id, 'name': b.name, 'slug': b.slug,
            'description': b.description, 'icon_url': b.icon_url,
            'criteria_type': b.criteria_type,
            'earned': b.id in earned,
            'earned_at': earned.get(b.id),
        })

    return Response(data)
