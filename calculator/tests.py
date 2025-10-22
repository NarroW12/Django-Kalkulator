from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Calculation


class CalculationModelTest(APITestCase):

    def test_calculation_creation(self):
        """Testuje, czy model Calculation jest poprawnie tworzony."""
        calc = Calculation.objects.create(expression="1+1", result="2")
        self.assertEqual(calc.expression, "1+1")
        self.assertEqual(calc.result, "2")
        self.assertEqual(str(calc), "1+1 = 2")


class ApiViewsTest(APITestCase):

    def setUp(self):
        """Tworzy dane testowe."""
        self.calculate_url = reverse('calculate')  # Załóżmy, że masz nazwany URL
        self.history_url = reverse('history')  # Załóżmy, że masz nazwany URL

        # Utwórz kilka obliczeń do testu historii
        Calculation.objects.create(expression="1+1", result="2")
        Calculation.objects.create(expression="2+2", result="4")
        Calculation.objects.create(expression="7*7", result="49")

    def test_calculate_success(self):
        """Testuje pomyślne obliczenie wyrażenia."""
        data = {'expression': '5*5'}
        response = self.client.post(self.calculate_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['expression'], '5*5')
        self.assertEqual(response.data['result'], 25)

        # Sprawdź, czy zapisano w bazie
        self.assertTrue(Calculation.objects.filter(expression='5*5', result='25').exists())
        self.assertEqual(Calculation.objects.count(), 3)  # 2 z setUp + 1 teraz

    def test_calculate_error(self):
        """Testuje błędne wyrażenie (np. niekompletne)."""
        data = {'expression': '5+'}
        response = self.client.post(self.calculate_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'error': 'Błąd w wyrażeniu'})

        # Sprawdź, czy NIE zapisano w bazie
        self.assertEqual(Calculation.objects.count(), 2)  # Tylko te z setUp

    def test_history_view(self):
        """Testuje pobieranie historii."""
        response = self.client.get(self.history_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Sprawdź kolejność (najnowsze pierwsze)
        self.assertEqual(response.data[0]['expression'], '2+2')
        self.assertEqual(response.data[1]['expression'], '1+1')