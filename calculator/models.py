from django.db import models

class Calculation(models.Model):
    expression = models.CharField(max_length=100)
    result = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.expression} = {self.result}"
