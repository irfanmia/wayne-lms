from django.contrib import admin
from .models import ReusableLesson, ReusableQuiz, ReusableQuizQuestion, ReusableAssignment

admin.site.register(ReusableLesson)
admin.site.register(ReusableQuiz)
admin.site.register(ReusableQuizQuestion)
admin.site.register(ReusableAssignment)
