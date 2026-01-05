/****************************************************
 * CONFIGURAÇÕES GERAIS
 ****************************************************/

/****************************************************
 * UTILITÁRIOS DE DATA
 ****************************************************/
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/****************************************************
 * TRADUÇÃO DE FERIADOS (EN → PT)
 ****************************************************/
const holidayTranslations = {
  "New Year's Day": "Dia de Ano Novo",
  "Liberation Day": "Dia da Libertação",
  Carnival: "Carnaval",
  "Good Friday": "Sexta-feira Santa",
  "Easter Sunday": "Páscoa",
  "International Workers' Day": "Dia do Trabalhador",
  "National Heroes Day": "Dia do Herói Nacional",
  "All Souls' Day": "Dia dos Finados",
  "Independence Day": "Dia da Independência",
  "Christmas Day": "Natal",
};

/****************************************************
 * DATAS COMEMORATIVAS FIXAS (ANGOLA / AFRICA)
 * (NÃO SÃO FERIADOS, MAS DEVEM APARECER)
 ****************************************************/
function datasComemorativas(year) {
  return [
    { date: `${year}-01-06`, title: "Dia de Reis", type: "observance" },
    { date: `${year}-05-25`, title: "Dia de África", type: "observance" },
    {
      date: `${year}-06-01`,
      title: "Dia Internacional da Criança",
      type: "observance",
    },
    {
      date: `${year}-06-16`,
      title: "Dia da Criança Africana",
      type: "observance",
    },
    {
      date: `${year}-07-31`,
      title: "Dia da Mulher Africana",
      type: "observance",
    },
    {
      date: `${year}-09-21`,
      title: "Dia Internacional da Paz",
      type: "observance",
    },
    {
      date: `${year}-12-01`,
      title: "Dia Mundial da Luta contra a SIDA",
      type: "observance",
    },
  ];
}

/****************************************************
 * BUSCAR FERIADOS NA API (INCLUI MÓVEIS – PÁSCOA)
 ****************************************************/
async function buscarFeriados(year) {
  try {
    const res = await fetch(
      `https://calendarific.com/api/v2/holidays?api_key=17vJv307iWUmG7sZ0kWVQwjx5sfvhHF2&country=AO&language=fr&year=${year}`
    );

    const json = await res.json();
    console.log("Response: ", json);

    if (!json.response.holidays || !Array.isArray(json.response.holidays)) {
      console.log("Nenhum feriado retornado pela API");

      return [];
    }
     console.log("Response: ", json);
    return json.response.holidays.map((h) => ({
      date: h.date.iso,
      title: h.name_local || holidayTranslations?.[h.name] || h.name,
      type: "holiday",
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

/****************************************************
 * GERAR PONTES
 ****************************************************/
function gerarPontes(holidays) {
  const bridges = [];
  console.log("HOLIDAYS:", holidays);

  holidays.forEach((h) => {
    const d = new Date(h.date);
    const day = d.getDay();

    const candidates = [];

    if (day === 2) {
      const p = new Date(d);
      p.setDate(d.getDate() - 1);
      candidates.push(p);
    }

    if (day === 4) {
      const p = new Date(d);
      p.setDate(d.getDate() + 1);
      candidates.push(p);
    }

    candidates.forEach((p) => {
      const iso = toISO(p);
      const wd = p.getDay();

      if (wd !== 0 && wd !== 6 && !bridges.some((b) => b.date === iso)) {
        bridges.push({
          date: iso,
          title: "Ponte",
          type: "bridge",
        });
      }
    });
  });

  return bridges;
}

/****************************************************
 * EVENTOS DO USUÁRIO
 ****************************************************/
const userEvents = [
  // deixe VAZIO em produção
  // eventos de teste confundem o calendário
];

window.calEvents = [];

/****************************************************
 * MATRIZ DO MÊS (SEGUNDA → DOMINGO)
 ****************************************************/
const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const offset = (first.getDay() + 6) % 7;
  const total = offset + last.getDate();
  const cells = [];

  for (let i = 0; i < total; i++) {
    const d = new Date(year, month, i - offset + 1);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

/****************************************************
 * ELEMENTOS UI
 ****************************************************/
const calendarGrid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("monthLabel");
const rangeLabel = document.getElementById("rangeLabel");
const countLabel = document.getElementById("countLabel");

let current = new Date();

/****************************************************
 * RENDER
 ****************************************************/
function render() {
  calendarGrid.innerHTML = "";

  const y = current.getFullYear();
  const m = current.getMonth();
  monthLabel.textContent = `${monthNames[m]} ${y}`;

  const map = new Map();
  window.calEvents.forEach((e) => {
    const list = map.get(e.date) || [];
    list.push(e);
    map.set(e.date, list);
  });

  getMonthMatrix(y, m).forEach(({ date, inMonth }) => {
    const cell = document.createElement("div");
    cell.className = "cell" + (inMonth ? "" : " other-month");

    const label = document.createElement("div");
    label.className = "date";
    label.textContent = date.getDate();

    const wrap = document.createElement("div");
    wrap.className = "events";

    (map.get(toISO(date)) || []).forEach((e) => {
      const ev = document.createElement("div");
      ev.className = `event ${e.type}`;
      ev.textContent = e.title;
      wrap.appendChild(ev);
    });

    cell.append(label, wrap);
    calendarGrid.appendChild(cell);
  });
  const monthISO = `${y}-${pad(m + 1)}-`;
  const count = window.calEvents.filter(
    (e) => e.date.startsWith(monthISO) && e.type !== "bridge" // não conta pontes
  ).length;

  countLabel.textContent = `${count} eventos neste mês`;
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);
  rangeLabel.textContent = `De ${firstDay.getDate()} de ${
    monthNames[m]
  } a ${lastDay.getDate()} de ${monthNames[m]} de ${y}`;
}

/****************************************************
 * MODAL DE ADICIONAR EVENTO
 ****************************************************/

const modal = document.getElementById("eventModal");
const eventTitle = document.getElementById("eventTitle");
const eventDay = document.getElementById("eventDay");
const eventMonth = document.getElementById("eventMonth");
const eventYear = document.getElementById("eventYear");

function openModal() {
  modal.classList.remove("hidden");
  preencherSelects();
}

function closeModal() {
  modal.classList.add("hidden");
  eventTitle.value = "";
}

function preencherSelects() {
  eventDay.innerHTML = "";
  eventMonth.innerHTML = "";
  eventYear.innerHTML = "";

  // Dias
  for (let d = 1; d <= 31; d++) {
    eventDay.innerHTML += `<option value="${pad(d)}">${d}</option>`;
  }

  // Meses
  monthNames.forEach((m, i) => {
    eventMonth.innerHTML += `<option value="${pad(i + 1)}">${m}</option>`;
  });

  // Anos (rápido viajar no tempo)
  const base = current.getFullYear();
  for (let y = base - 10; y <= base + 10; y++) {
    eventYear.innerHTML += `<option value="${y}">${y}</option>`;
  }

  eventYear.value = base;
  eventMonth.value = pad(current.getMonth() + 1);
}

/****************************************************
 * BOTÃO ADICIONAR EVENTO
 ****************************************************/
document.getElementById("addRandom").onclick = openModal;

document.getElementById("cancelEvent").onclick = closeModal;

document.getElementById("saveEvent").onclick = () => {
  if (!eventTitle.value.trim()) return;

  const date = `${eventYear.value}-${eventMonth.value}-${eventDay.value}`;

  userEvents.push({
    id: Date.now(),
    title: eventTitle.value,
    date,
    type: "user",
  });

  closeModal();
  carregarCalendario();
};

/****************************************************
 * SELETOR DE ANO
 ****************************************************/
const yearJump = document.getElementById("yearJump");

function preencherYearJump() {
  yearJump.innerHTML = "";
  const base = new Date().getFullYear();

  for (let y = base - 20; y <= base + 20; y++) {
    yearJump.innerHTML += `<option value="${y}">${y}</option>`;
  }

  yearJump.value = current.getFullYear();
}

yearJump.onchange = () => {
  current.setFullYear(Number(yearJump.value));
  carregarCalendario();
};

/****************************************************
 * CARREGAMENTO PRINCIPAL
 ****************************************************/

async function carregarCalendario() {
  const year = current.getFullYear();

  let feriados;

  feriados = await buscarFeriados(year);

  const pontes = gerarPontes(feriados);
  const comemorativas = datasComemorativas(year);

  window.calEvents = [...userEvents, ...feriados, ...pontes, ...comemorativas];
  preencherYearJump();
  render();
}

/****************************************************
 * NAVEGAÇÃO
 ****************************************************/
document.getElementById("prevBtn").onclick = () => {
  current.setMonth(current.getMonth() - 1);
  carregarCalendario();
};
document.getElementById("nextBtn").onclick = () => {
  current.setMonth(current.getMonth() + 1);
  carregarCalendario();
};
document.getElementById("todayBtn").onclick = () => {
  current = new Date();
  carregarCalendario();
};

// Inicialização
carregarCalendario();
/****************************************************
 * FIM DO SCRIPT
 ****************************************************/
