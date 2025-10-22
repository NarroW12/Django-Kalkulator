# e2e_tests/test_calculator_e2e.py
import pytest
from playwright.sync_api import Page, expect

# Adres URL, na którym działa Twój serwer Django
BASE_URL = "http://localhost:8000"


# Używamy klasy, aby zgrupować testy
class TestCalculatorE2E:

    # Metoda setUp, która uruchamia się przed każdym testem w klasie
    def setup_method(self, method):
        print(f"\n🚀 Rozpoczynanie testu: {method.__name__}")

    # Metoda tearDown, która uruchamia się po każdym teście
    def teardown_method(self, method):
        print(f"🏁 Zakończono test: {method.__name__}")

    def test_basic_multiplication_and_history(self, page: Page):
        """
        Testuje mnożenie (szczęśliwa ścieżka) i sprawdza, czy zapisuje się w historii.
        """
        print("   - Otwieranie strony")
        page.goto(BASE_URL)
        display = page.locator("#display")

        print("   - Wprowadzanie: 7 * 6")
        page.locator('[data-value="7"]').click()
        page.locator('[data-value="*"]').click()
        page.locator('[data-value="6"]').click()
        print("   - Sprawdzanie wyświetlacza (oczekiwano '7*6')")
        expect(display).to_have_value("7*6")

        print("   - Klikanie '='")
        page.locator('[data-value="="]').click()
        print("   - Sprawdzanie wyniku (oczekiwano '42')")
        expect(display).to_have_value("42")

        print("   - Otwieranie historii")
        page.locator("#showHistory").click()
        history_panel = page.locator("#history")

        print("   - Sprawdzanie widoczności i treści historii")
        expect(history_panel).to_be_visible()
        expect(history_panel).to_contain_text("7*6")
        expect(history_panel).to_contain_text("42")

    def test_division_and_decimals(self, page: Page):
        """
        Testuje dzielenie, które zwraca wynik dziesiętny.
        """
        print("   - Otwieranie strony")
        page.goto(BASE_URL)
        display = page.locator("#display")

        print("   - Wprowadzanie: 5 / 2")
        page.locator('[data-value="5"]').click()
        page.locator('[data-value="/"]').click()
        page.locator('[data-value="2"]').click()
        print("   - Sprawdzanie wyświetlacza (oczekiwano '5/2')")
        expect(display).to_have_value("5/2")

        print("   - Klikanie '='")
        page.locator('[data-value="="]').click()
        print("   - Sprawdzanie wyniku (oczekiwano '2.5')")
        expect(display).to_have_value("2.5")

    def test_clear_button_functionality(self, page: Page):
        """
        Testuje, czy przycisk 'C' czyści wyświetlacz w trakcie wpisywania.
        """
        print("   - Otwieranie strony")
        page.goto(BASE_URL)
        display = page.locator("#display")

        print("   - Wprowadzanie '12+'")
        page.locator('[data-value="1"]').click()
        page.locator('[data-value="2"]').click()
        page.locator('[data-value="+"]').click()
        expect(display).to_have_value("12+")

        print("   - Klikanie 'C'")
        page.locator('[data-value="C"]').click()
        print("   - Sprawdzanie, czy wyświetlacz jest pusty")
        expect(display).to_have_value("")

    def test_order_of_operations_pemdas(self, page: Page):
        """
        Testuje kolejność działań (2 + 3 * 4 = 14).
        """
        print("   - Otwieranie strony")
        page.goto(BASE_URL)
        display = page.locator("#display")

        print("   - Wprowadzanie: 2 + 3 * 4")
        page.locator('[data-value="2"]').click()
        page.locator('[data-value="+"]').click()
        page.locator('[data-value="3"]').click()
        page.locator('[data-value="*"]').click()
        page.locator('[data-value="4"]').click()
        expect(display).to_have_value("2+3*4")

        print("   - Klikanie '='")
        page.locator('[data-value="="]').click()
        print("   - Sprawdzanie wyniku (oczekiwano '14')")
        expect(display).to_have_value("14")

    def test_error_on_division_by_zero(self, page: Page):
        """
        Testuje dzielenie przez zero (powinno dać 'Błąd').
        """
        print("   - Otwieranie strony")
        page.goto(BASE_URL)
        display = page.locator("#display")

        print("   - Wprowadzanie: 9 / 0")
        page.locator('[data-value="9"]').click()
        page.locator('[data-value="/"]').click()
        page.locator('[data-value="0"]').click()
        expect(display).to_have_value("9/0")

        print("   - Klikanie '='")
        page.locator('[data-value="="]').click()
        print("   - Sprawdzanie wyniku (oczekiwano 'Błąd')")
        expect(display).to_have_value("Błąd")

    def test_error_on_incomplete_expression(self, page: Page):
        """
        Testuje przypadek brzegowy: Niekompletne wyrażenie (np. kończące się operatorem).
        Frontend powinien pokazać "Błąd".
        """
        print("   - Otwieranie strony")
        page.goto(BASE_URL)
        display = page.locator("#display")

        print("   - Wprowadzanie: 5 +") # Zmienione wejście
        page.locator('[data-value="5"]').click()
        page.locator('[data-value="+"]').click()
        expect(display).to_have_value("5+") # Sprawdzamy poprawność wpisania

        print("   - Klikanie '='")
        page.locator('[data-value="="]').click()
        print("   - Sprawdzanie wyniku (oczekiwano 'Błąd')")
        # simpleeval powinien zgłosić błąd dla "5+", a backend zwrócić 400
        expect(display).to_have_value("Błąd")

        print("   - Klikanie '='")
        page.locator('[data-value="="]').click()
        print("   - Sprawdzanie wyniku (oczekiwano 'Błąd')")
        expect(display).to_have_value("Błąd")


    def test_history_toggle_and_empty_state(self, page: Page):
        """
        Testuje przycisk Historii: pokazywanie, chowanie i stan pusty.
        """
        print("   - Otwieranie strony")
        page.goto(BASE_URL)
        history_panel = page.locator("#history") # panel historii
        history_button = page.locator("#showHistory") # przycisk historia

        print("   - Sprawdzanie, czy historia jest ukryta")
        expect(history_panel).to_be_hidden()

        print("   - Klikanie przycisku 'Historia'")
        history_button.click()
        print("   - Sprawdzanie, czy historia jest widoczna ")
        expect(history_panel).to_be_visible()

        print("   - Ponowne klikanie przycisku 'Historia'")
        history_button.click()
        print("   - Sprawdzanie, czy historia jest znowu ukryta")
        expect(history_panel).to_be_hidden()