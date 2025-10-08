from django.shortcuts import render

def index(request):
    result = ''
    expression = ''
    if request.method == 'POST':
        expression = request.POST.get('expression', '')
        button = request.POST.get('button')

        if button == 'C':
            expression = ''
        elif button == '=':
            try:
                result = str(eval(expression))
                expression = result
            except Exception:
                result = 'Błąd'
        else:
            expression += button

    return render(request, 'index.html', {'expression': expression, 'result': result})