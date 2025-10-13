document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display") as HTMLInputElement;
  const buttons = document.querySelectorAll<HTMLButtonElement>(".btn");
  const historyDiv = document.getElementById("history") as HTMLDivElement;
  const historyBtn = document.getElementById("showHistory") as HTMLButtonElement;

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const val = btn.dataset.value!;
      if (val === "C") {
        display.value = "";
      } else if (val === "=") {
        const result = await calculate(display.value);
        display.value = result;
      } else if (val === ".") {
        if (!display.value.includes(".")) display.value += ".";
      } else {
        display.value += val;
      }
    });
  });

  historyBtn.addEventListener("click", async () => {
    if (historyDiv.classList.contains("hidden")) {
      await loadHistory();
      historyDiv.classList.remove("hidden");
    } else {
      historyDiv.classList.add("hidden");
    }
  });

  async function calculate(expression: string): Promise<string> {
    if (!expression) return "";
    const res = await fetch("/api/calculate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({ expression }),
    });
    const data = await res.json();
    return data.result ?? "Błąd";
  }

  async function loadHistory() {
  const res = await fetch("/api/history/");
  const data = await res.json();

  // zapewnia, że zawsze mamy tablicę do mapowania
  const historyList = Array.isArray(data.history) ? data.history : Array.isArray(data) ? data : [];

  if (historyDiv) {
    historyDiv.innerHTML = historyList.length
      ? historyList
          .map(
            (h: { expression: string; result: string }) =>
              `<div class="flex justify-between border-b border-gray-600 py-1">
                 <span>${h.expression}</span>
                 <b class="text-green-400">${h.result}</b>
               </div>`
          )
          .join("")
      : `<p class="text-gray-400 italic text-center">Brak historii...</p>`;
  }
}
  function getCSRFToken(): string {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
    return cookieValue || "";
  }
});