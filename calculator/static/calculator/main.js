var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener("DOMContentLoaded", () => {
    const display = document.getElementById("display");
    const buttons = document.querySelectorAll(".btn");
    const historyDiv = document.getElementById("history");
    const historyBtn = document.getElementById("showHistory");
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
            const val = btn.dataset.value;
            if (val === "C") {
                display.value = "";
            }
            else if (val === "=") {
                const result = yield calculate(display.value);
                display.value = result;
            }
            else if (val === ".") {
                if (!display.value.includes("."))
                    display.value += ".";
            }
            else {
                display.value += val;
            }
        }));
    });
    historyBtn.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        if (historyDiv.classList.contains("hidden")) {
            yield loadHistory();
            historyDiv.classList.remove("hidden");
        }
        else {
            historyDiv.classList.add("hidden");
        }
    }));
    function calculate(expression) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!expression)
                return "";
            const res = yield fetch("/api/calculate/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),
                },
                body: JSON.stringify({ expression }),
            });
            const data = yield res.json();
            return (_a = data.result) !== null && _a !== void 0 ? _a : "Błąd";
        });
    }
    function loadHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch("/api/history/");
            const data = yield res.json();
            const historyList = Array.isArray(data.history) ? data.history : Array.isArray(data) ? data : [];
            if (historyDiv) {
                historyDiv.innerHTML = historyList.length
                    ? historyList
                        .map((h) => `<div class="flex justify-between border-b border-gray-600 py-1">
                 <span>${h.expression}</span>
                 <b class="text-green-400">${h.result}</b>
               </div>`)
                        .join("")
                    : `<p class="text-gray-400 italic text-center">Brak historii...</p>`;
            }
        });
    }
    function getCSRFToken() {
        var _a;
        const cookieValue = (_a = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))) === null || _a === void 0 ? void 0 : _a.split("=")[1];
        return cookieValue || "";
    }
});
/**
 * Pobiera token CSRF z ciasteczek.
 * Eksportujemy ją, aby móc ją przetestować.
 */
export function getCSRFToken() {
    var _a;
    const cookieValue = (_a = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))) === null || _a === void 0 ? void 0 : _a.split("=")[1];
    return cookieValue || "";
}
/**
 * Wysyła wyrażenie do API i zwraca wynik.
 * Eksportujemy ją, aby móc ją przetestować.
 */
export function calculate(expression) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!expression)
            return "";
        try {
            const res = yield fetch("/api/calculate/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),
                },
                body: JSON.stringify({ expression }),
            });
            if (!res.ok) {
                return "Błąd"; // Obsługa błędów serwera
            }
            const data = yield res.json();
            return (_a = data.result) !== null && _a !== void 0 ? _a : "Błąd"; // data.result może być 0, więc ?? jest lepsze
        }
        catch (error) {
            console.error("Błąd kalkulacji:", error);
            return "Błąd";
        }
    });
}
/**
 * Pobiera historię z API i renderuje ją w podanym elemencie.
 * Przyjmuje 'historyDiv' jako argument (to ułatwia testowanie).
 * Eksportujemy ją, aby móc ją przetestować.
 */
export function loadHistory(historyDiv) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!historyDiv)
            return;
        try {
            const res = yield fetch("/api/history/");
            if (!res.ok) {
                historyDiv.innerHTML = `<p class="text-gray-400 italic text-center">Nie można załadować historii.</p>`;
                return;
            }
            const data = yield res.json();
            const historyList = Array.isArray(data) ? data : [];
            historyDiv.innerHTML = historyList.length
                ? historyList
                    .map((h) => `<div class="flex justify-between border-b border-gray-600 py-1">
                 <span>${h.expression}</span>
                 <b class="text-green-400">${h.result}</b>
               </div>`)
                    .join("")
                : `<p class="text-gray-400 italic text-center">Brak historii...</p>`;
        }
        catch (error) {
            console.error("Błąd ładowania historii:", error);
            historyDiv.innerHTML = `<p class="text-gray-400 italic text-center">Błąd ładowania.</p>`;
        }
    });
}
// /**
//  * Główna funkcja "klejąca" (glue function), która odpala naszą aplikację.
//  */
// function runApp() {
//   const display = document.getElementById("display") as HTMLInputElement;
//   const buttons = document.querySelectorAll<HTMLButtonElement>(".btn");
//   const historyDiv = document.getElementById("history") as HTMLDivElement;
//   const historyBtn = document.getElementById("showHistory") as HTMLButtonElement;
//
//   if (!display || !buttons.length || !historyDiv || !historyBtn) {
//     console.error("Nie znaleziono wszystkich elementów kalkulatora!");
//     return;
//   }
//
//   buttons.forEach((btn) => {
//     btn.addEventListener("click", async () => {
//       const val = btn.dataset.value!;
//       if (val === "C") {
//         display.value = "";
//       } else if (val === "=") {
//         const result = await calculate(display.value);
//         display.value = result;
//       } else if (val === ".") {
//         if (!display.value.includes(".")) display.value += ".";
//       } else {
//         display.value += val;
//       }
//     });
//   });
//
//   historyBtn.addEventListener("click", async () => {
//     if (historyDiv.classList.contains("hidden")) {
//       // Przekazujemy historyDiv do funkcji
//       await loadHistory(historyDiv);
//       historyDiv.classList.remove("hidden");
//     } else {
//       historyDiv.classList.add("hidden");
//     }
//   });
// }
//
// // Uruchamiamy aplikację po załadowaniu DOM
// document.addEventListener("DOMContentLoaded", runApp);
