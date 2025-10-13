from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from simpleeval import simple_eval
from .models import Calculation

@api_view(['POST'])
def calculate(request):
    expression = request.data.get('expression', '')
    try:
        result = simple_eval(expression)
        calc = Calculation.objects.create(expression=expression, result=str(result))
        return Response({'expression': expression, 'result': result}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'error': 'Błąd w wyrażeniu'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def history(request):
    data = [
        {'expression': c.expression, 'result': c.result, 'created_at': c.created_at}
        for c in Calculation.objects.order_by('-created_at')[:10]
    ]
    return Response(data)

def index(request):
    return render(request, 'index.html')
