from django.db import migrations

def forwards_func(apps, schema_editor):
    User = apps.get_model("api", "User")
    for user in User.objects.all():
        if not hasattr(user, 'password_hash'):
            user.password_hash = ''  # Установите временное значение
            user.save()

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0001_initial'),
    ]
    
    operations = [
        migrations.RunPython(
        forwards_func,
        reverse_code=lambda apps, schema_editor: None,
    ),
    ]