from django.contrib import admin

from reviews.models import Review

# Register your models here.
class NoLogAdmin(admin.ModelAdmin):
    def log_addition(self, *args, **kwargs): return None
    def log_change(self, *args, **kwargs): return None
    def log_deletion(self, *args, **kwargs): return None

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    # Only allows verified reviews (logic handled in Review model save method)
    list_display = ('user', 'hospital', 'doctor', 'rating', 'created_at')
    list_filter = ('rating', 'hospital')
    search_fields = ('comment',)
    readonly_fields = ('created_at',)