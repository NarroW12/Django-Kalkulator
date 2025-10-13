document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display") as HTMLInputElement;
  const buttons = document.querySelectorAll<HTMLButtonElement>(".btn");
  const historyDiv = document.getElementById("history") as HTMLDivElement;
  const historyBtn = document.getElementById("showHistory") as HTMLButtonElement;

  // wpisywanie cyfr i operatorów
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

  // historia
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

    if (historyDiv) {
      historyDiv.innerHTML = data.history
        .map((h: { expression: string; result: string }) => `<div>${h.expression} = <b>${h.result}</b></div>`)
        .join("");
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
