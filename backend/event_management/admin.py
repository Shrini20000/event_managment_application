from django.contrib import admin
from .models import Event, Attendee, Task


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'location', 'created_at')
    search_fields = ('name', 'description', 'location')
    list_filter = ('date', 'location')


@admin.register(Attendee)
class AttendeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    search_fields = ('name', 'email')
    filter_horizontal = ('events',)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'event', 'status', 'created_at')
    list_filter = ('status', 'event')
    search_fields = ('name', 'event__name')
