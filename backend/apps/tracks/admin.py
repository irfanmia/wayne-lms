from django.contrib import admin
from .models import Track, Concept, Exercise

class ConceptInline(admin.TabularInline):
    model = Concept
    extra = 0

class ExerciseInline(admin.TabularInline):
    model = Exercise
    extra = 0

@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('slug', 'difficulty_level', 'is_active', 'order')
    list_filter = ('difficulty_level', 'is_active')
    search_fields = ('slug',)
    inlines = [ConceptInline]

@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    list_display = ('slug', 'track', 'order')
    list_filter = ('track',)
    search_fields = ('slug',)
    inlines = [ExerciseInline]

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('slug', 'concept', 'difficulty', 'order')
    list_filter = ('difficulty', 'concept__track')
    search_fields = ('slug',)
