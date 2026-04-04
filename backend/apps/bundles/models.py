from django.db import models


class Bundle(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    discount_percent = models.PositiveIntegerField(default=0)
    courses = models.ManyToManyField('courses.Course', related_name='bundles', blank=True)
    is_active = models.BooleanField(default=True)
    thumbnail = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    @property
    def discounted_price(self):
        if self.discount_percent:
            return round(float(self.price) * (1 - self.discount_percent / 100), 2)
        return float(self.price)
