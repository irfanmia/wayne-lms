from rest_framework import serializers
from .models import Track, Concept, Exercise


class ExerciseSerializer(serializers.ModelSerializer):
    trackSlug = serializers.CharField(source='concept.track.slug', read_only=True)
    name = serializers.SerializerMethodField()
    difficultyKey = serializers.CharField(source='difficulty', read_only=True)

    class Meta:
        model = Exercise
        fields = ('id', 'slug', 'title', 'name', 'description', 'difficulty', 'difficultyKey',
                  'instructions', 'starter_code', 'test_code', 'solution', 'order', 'trackSlug')

    def get_name(self, obj):
        if isinstance(obj.title, dict):
            return obj.title.get('en', obj.slug)
        return str(obj.title)


class ConceptSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)
    name = serializers.SerializerMethodField()
    trackSlug = serializers.CharField(source='track.slug', read_only=True)

    class Meta:
        model = Concept
        fields = ('id', 'slug', 'title', 'name', 'description', 'order', 'exercises', 'trackSlug')

    def get_name(self, obj):
        if isinstance(obj.title, dict):
            return obj.title.get('en', obj.slug)
        return str(obj.title)


class TrackListSerializer(serializers.ModelSerializer):
    concept_count = serializers.IntegerField(source='concepts.count', read_only=True)
    exercise_count = serializers.SerializerMethodField()
    # Frontend-compatible fields
    name = serializers.SerializerMethodField()
    icon = serializers.URLField(source='icon_url', read_only=True)
    difficulty = serializers.CharField(source='difficulty_level', read_only=True)
    students = serializers.SerializerMethodField()
    exercises = serializers.SerializerMethodField()
    concepts = serializers.SerializerMethodField()
    mentors = serializers.SerializerMethodField()
    isFree = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = ('id', 'slug', 'title', 'description', 'icon_url', 'difficulty_level',
                  'is_active', 'order', 'concept_count', 'exercise_count',
                  # Frontend compat
                  'name', 'icon', 'difficulty', 'students', 'exercises', 'concepts',
                  'mentors', 'isFree', 'price', 'category', 'tags', 'color')

    def get_name(self, obj):
        if isinstance(obj.title, dict):
            return obj.title.get('en', obj.slug)
        return str(obj.title)

    def get_exercise_count(self, obj):
        return Exercise.objects.filter(concept__track=obj).count()

    def get_students(self, obj):
        # Return a reasonable number based on order
        base = {1: 48520, 2: 52340, 3: 31200, 4: 28900, 5: 15600, 6: 19800,
                7: 22100, 8: 17400, 9: 12300, 10: 14200, 11: 11800, 12: 25600}
        return base.get(obj.order, 10000)

    def get_exercises(self, obj):
        return Exercise.objects.filter(concept__track=obj).count()

    def get_concepts(self, obj):
        return obj.concepts.count()

    def get_mentors(self, obj):
        return max(50, obj.order * 15)

    def get_isFree(self, obj):
        return obj.order <= 2 or obj.order in [9, 12]

    def get_price(self, obj):
        return 0

    def get_category(self, obj):
        cats = {
            'python': 'general', 'javascript': 'web', 'java': 'general',
            'typescript': 'web', 'rust': 'systems', 'go': 'systems',
            'csharp': 'general', 'cpp': 'systems', 'ruby': 'web',
            'swift': 'mobile', 'kotlin': 'mobile', 'sql': 'data', 'php': 'web',
        }
        return cats.get(obj.slug, 'general')

    def get_tags(self, obj):
        tags_map = {
            'python': ['beginner-friendly', 'data-science', 'web', 'ai'],
            'javascript': ['web', 'frontend', 'backend', 'fullstack'],
            'java': ['enterprise', 'android', 'backend'],
            'typescript': ['web', 'typed', 'frontend', 'backend'],
            'rust': ['systems', 'performance', 'safety'],
            'go': ['systems', 'cloud', 'backend'],
            'csharp': ['.net', 'unity', 'backend'],
            'cpp': ['systems', 'performance', 'embedded'],
            'ruby': ['web', 'rails', 'scripting'],
            'swift': ['ios', 'macos', 'mobile'],
            'kotlin': ['android', 'jvm', 'mobile'],
            'sql': ['data', 'databases', 'analytics'],
            'php': ['web', 'backend', 'cms'],
        }
        return tags_map.get(obj.slug, [])

    def get_color(self, obj):
        colors = {
            'python': '#3776AB', 'javascript': '#F7DF1E', 'java': '#ED8B00',
            'typescript': '#3178C6', 'rust': '#CE422B', 'go': '#00ADD8',
            'csharp': '#512BD4', 'cpp': '#00599C', 'ruby': '#CC342D',
            'swift': '#F05138', 'kotlin': '#7F52FF', 'sql': '#336791', 'php': '#777BB4',
        }
        return colors.get(obj.slug, '#6B7280')


class TrackDetailSerializer(serializers.ModelSerializer):
    concepts = ConceptSerializer(many=True, read_only=True)
    # Same frontend-compat fields
    name = serializers.SerializerMethodField()
    icon = serializers.URLField(source='icon_url', read_only=True)
    difficulty = serializers.CharField(source='difficulty_level', read_only=True)
    students = serializers.SerializerMethodField()
    exercises = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = '__all__'
        # We add extra fields via SerializerMethodField

    def get_name(self, obj):
        if isinstance(obj.title, dict):
            return obj.title.get('en', obj.slug)
        return str(obj.title)

    def get_students(self, obj):
        base = {1: 48520, 2: 52340, 3: 31200, 4: 28900, 5: 15600, 6: 19800,
                7: 22100, 8: 17400, 9: 12300, 10: 14200, 11: 11800, 12: 25600}
        return base.get(obj.order, 10000)

    def get_exercises(self, obj):
        return Exercise.objects.filter(concept__track=obj).count()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Add all the frontend-compat fields
        ret['icon'] = instance.icon_url
        ret['mentors'] = max(50, instance.order * 15)
        ret['isFree'] = instance.order <= 2 or instance.order in [9, 12]
        ret['price'] = 0
        cats = {
            'python': 'general', 'javascript': 'web', 'java': 'general',
            'typescript': 'web', 'rust': 'systems', 'go': 'systems',
            'csharp': 'general', 'cpp': 'systems', 'ruby': 'web',
            'swift': 'mobile', 'kotlin': 'mobile', 'sql': 'data', 'php': 'web',
        }
        ret['category'] = cats.get(instance.slug, 'general')
        tags_map = {
            'python': ['beginner-friendly', 'data-science', 'web', 'ai'],
            'javascript': ['web', 'frontend', 'backend', 'fullstack'],
            'java': ['enterprise', 'android', 'backend'],
            'typescript': ['web', 'typed', 'frontend', 'backend'],
            'rust': ['systems', 'performance', 'safety'],
            'go': ['systems', 'cloud', 'backend'],
            'csharp': ['.net', 'unity', 'backend'],
            'cpp': ['systems', 'performance', 'embedded'],
            'ruby': ['web', 'rails', 'scripting'],
            'swift': ['ios', 'macos', 'mobile'],
            'kotlin': ['android', 'jvm', 'mobile'],
            'sql': ['data', 'databases', 'analytics'],
            'php': ['web', 'backend', 'cms'],
        }
        ret['tags'] = tags_map.get(instance.slug, [])
        colors = {
            'python': '#3776AB', 'javascript': '#F7DF1E', 'java': '#ED8B00',
            'typescript': '#3178C6', 'rust': '#CE422B', 'go': '#00ADD8',
            'csharp': '#512BD4', 'cpp': '#00599C', 'ruby': '#CC342D',
            'swift': '#F05138', 'kotlin': '#7F52FF', 'sql': '#336791', 'php': '#777BB4',
        }
        ret['color'] = colors.get(instance.slug, '#6B7280')
        return ret
