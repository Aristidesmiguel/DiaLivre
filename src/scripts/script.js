// função para buscar os feriados na API - https://calendarific.com/
async function BuscarFriados() {
  try {
    const response = await fetch(
     "https://calendarific.com/api/v2/holidays?api_key=AqIR90xVhSLZwWTQ61gOC518QGZXlAlJ&country=AO&language=fr&year=2025"
    );

    if (!response.ok) {
      throw new Error("Erro na requisição");
    }

    const data = await response.json();
    console.log(data.response.holidays);
  } catch (error) {
    console.error(error);   
  }
}

BuscarFriados();

// Função para gerar os dias normais 
function GerarDiasNormais(year) {
  const days = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().split("T")[0];

    days.push({
      date: iso,
      type: "normal"
    });
  }

  return days;
}

console.log(GerarDiasNormais(2025));

