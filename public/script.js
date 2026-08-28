let graficoTipos = null;

let graficoEtapas = null;

const coresTipos = [
  "#2f56b3",
  "#38bdf8",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6"
];

const coresEtapas = [
  "#2f56b3",
  "#38bdf8",
  "#8b5cf6",
  "#eab308",
  "#f97316",
  "#64748b",
  "#22c55e"
];

const nomesEtapas = [
  "Em elaboração",
  "Dryrun",
  "Revisão da qualidade",
  "Análise de risco",
  "Validação interna",
  "Enviado ao cliente",
  "Completo"
];


document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await carregarFiltros();

    await carregarDashboard();

    configurarEventos();

  }
);


function configurarEventos() {

  const filtroSite =
    document.getElementById(
      "filtroSite"
    );

  const filtroDescricaoProjeto =
    document.getElementById(
      "filtroDescricaoProjeto"
    );

  const filtroDocumento =
    document.getElementById(
      "filtroDocumento"
    );


  if (filtroSite) {

    filtroSite.addEventListener(
      "change",
      async () => {

        await carregarDescricoesPorSite();

        await carregarDashboard();

      }
    );

  }


  if (filtroDescricaoProjeto) {

    filtroDescricaoProjeto.addEventListener(
      "change",
      carregarDashboard
    );

  }


  if (filtroDocumento) {

    filtroDocumento.addEventListener(
      "change",
      carregarDashboard
    );

  }

}


/* =========================================================
   PREENCHER FILTRO DE DESCRIÇÃO
========================================================= */

function preencherFiltroDescricao(
  select,
  dados
) {

  if (!select) {
    return;
  }


  select.innerHTML =
    `<option value="Todas">Todas</option>`;


  const descricoesProjetos =
    Array.isArray(
      dados.descricoes_projetos
    )
      ? dados.descricoes_projetos
      : [];


  const descricoesProjetosCompletas =
    Array.isArray(
      dados.descricoes_projetos_completas
    )
      ? dados.descricoes_projetos_completas
      : [];


  descricoesProjetos.forEach(
    descricao => {

      const option =
        document.createElement(
          "option"
        );


      /*
        O valor utilizado pelo filtro continua
        sendo somente a descrição original.
      */

      option.value =
        descricao;


      /*
        O check é apenas visual.
      */

      const estaCompleta =
        descricoesProjetosCompletas.includes(
          descricao
        );


      option.textContent =
        estaCompleta
          ? `${descricao} ✓`
          : descricao;


      select.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   CARREGAR FILTROS
========================================================= */

async function carregarFiltros() {

  try {

    const resposta =
      await fetch(
        "/api/filtros"
      );


    if (!resposta.ok) {

      console.warn(
        "Filtros ainda não disponíveis."
      );

      return;

    }


    const dados =
      await resposta.json();


    /* =====================================================
       SITE
    ===================================================== */

    const selectSite =
      document.getElementById(
        "filtroSite"
      );


    if (selectSite) {

      selectSite.innerHTML =
        `<option value="Todos">Todos</option>`;


      const sites =
        Array.isArray(
          dados.sites
        )
          ? dados.sites
          : [];


      sites.forEach(
        site => {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            site;


          option.textContent =
            site;


          selectSite.appendChild(
            option
          );

        }
      );

    }


    /* =====================================================
       DESCRIÇÃO DO PROJETO
    ===================================================== */

    const selectDescricaoProjeto =
      document.getElementById(
        "filtroDescricaoProjeto"
      );


    preencherFiltroDescricao(
      selectDescricaoProjeto,
      dados
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar filtros:",
      erro
    );

  }

}


/* =========================================================
   CARREGAR DESCRIÇÕES PELO SITE
========================================================= */

async function carregarDescricoesPorSite() {

  const site =
    document.getElementById(
      "filtroSite"
    )?.value || "Todos";


  const selectDescricaoProjeto =
    document.getElementById(
      "filtroDescricaoProjeto"
    );


  if (!selectDescricaoProjeto) {
    return;
  }


  try {

    const parametros =
      new URLSearchParams({
        site
      });


    const resposta =
      await fetch(
        `/api/filtros?${parametros.toString()}`
      );


    if (!resposta.ok) {

      console.warn(
        "Não foi possível carregar as descrições do projeto."
      );

      return;

    }


    const dados =
      await resposta.json();


    /*
      Utilizamos a mesma função para garantir
      que o check também apareça quando
      o usuário trocar o Site.
    */

    preencherFiltroDescricao(
      selectDescricaoProjeto,
      dados
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar descrições por site:",
      erro
    );

  }

}


/* =========================================================
   CARREGAR DASHBOARD
========================================================= */

async function carregarDashboard() {

  const site =
    document.getElementById(
      "filtroSite"
    )?.value || "Todos";


  const descricaoProjeto =
    document.getElementById(
      "filtroDescricaoProjeto"
    )?.value || "Todas";


  const documento =
    document.getElementById(
      "filtroDocumento"
    )?.value || "Todos";


  const parametros =
    new URLSearchParams({

      site,

      documento,

      descricao_projeto:
        descricaoProjeto

    });


  try {

    const resposta =
      await fetch(
        `/api/dashboard?${parametros.toString()}`
      );


    if (!resposta.ok) {

      console.warn(
        "Dashboard aguardando configuração do banco."
      );

      aplicarDashboardVazio();

      return;

    }


    const dados =
      await resposta.json();


    atualizarCards(
      dados
    );

    atualizarEtapas(
      dados
    );

    criarGraficoTipos(
      dados
    );

    criarGraficoEtapas(
      dados
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar dashboard:",
      erro
    );

    aplicarDashboardVazio();

  }

}


/* =========================================================
   CARDS
========================================================= */

function atualizarCards(
  dados
) {

  definirTexto(
    "cardTotal",
    dados.total
  );

  definirTexto(
    "cardMop",
    dados.por_tipo?.MOP || 0
  );

  definirTexto(
    "cardSop",
    dados.por_tipo?.SOP || 0
  );

  definirTexto(
    "cardEop",
    dados.por_tipo?.EOP || 0
  );

  definirTexto(
    "cardCompleto",
    dados.por_etapa?.[
      "Completo"
    ] || 0
  );

}


/* =========================================================
   ETAPAS
========================================================= */

function atualizarEtapas(
  dados
) {

  const etapas =
    dados.por_etapa || {};


  definirTexto(
    "etapaElaboracao",
    etapas[
      "Em elaboração"
    ] || 0
  );

  definirTexto(
    "etapaDryrun",
    etapas[
      "Dryrun"
    ] || 0
  );

  definirTexto(
    "etapaQualidade",
    etapas[
      "Revisão da qualidade"
    ] || 0
  );

  definirTexto(
    "etapaRisco",
    etapas[
      "Análise de risco"
    ] || 0
  );

  definirTexto(
    "etapaValidacao",
    etapas[
      "Validação interna"
    ] || 0
  );

  definirTexto(
    "etapaCliente",
    etapas[
      "Enviado ao cliente"
    ] || 0
  );

  definirTexto(
    "etapaCompleto",
    etapas[
      "Completo"
    ] || 0
  );

}


/* =========================================================
   GRÁFICO POR TIPO
========================================================= */

function criarGraficoTipos(
  dados
) {

  const canvas =
    document.getElementById(
      "graficoTipos"
    );


  if (!canvas) {
    return;
  }


  const valores = [

    dados.por_tipo?.MOP || 0,

    dados.por_tipo?.SOP || 0,

    dados.por_tipo?.EOP || 0,

    dados.por_tipo?.Corretiva || 0,

    dados.por_tipo?.["Instalação"] || 0,

    dados.por_tipo?.Retrofit || 0

  ];


  const labels = [

    "MOP",

    "SOP",

    "EOP",

    "Corretiva",

    "Instalação",

    "Retrofit"

  ];


  definirTexto(
    "totalTipos",
    dados.total || 0
  );


  criarLegenda(
    "legendaTipos",
    labels,
    valores,
    coresTipos,
    dados.total
  );


  if (graficoTipos) {
    graficoTipos.destroy();
  }


  graficoTipos =
    new Chart(
      canvas,
      {

        type:
          "doughnut",

        data: {

          labels,

          datasets: [
            {
              data:
                valores,

              backgroundColor:
                coresTipos,

              borderColor:
                "#ffffff",

              borderWidth:
                3,

              hoverOffset:
                4
            }
          ]

        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          cutout:
            "68%",

          plugins: {

            legend: {
              display:
                false
            },

            tooltip: {

              callbacks: {

                label:
                  function(
                    context
                  ) {

                    const valor =
                      context.raw || 0;

                    const total =
                      dados.total || 0;

                    const percentual =
                      total > 0
                        ? (
                            (
                              valor /
                              total
                            ) *
                            100
                          ).toFixed(1)
                        : 0;

                    return (
                      `${context.label}: ` +
                      `${valor} (${percentual}%)`
                    );

                  }

              }

            }

          }

        }

      }
    );

}


/* =========================================================
   GRÁFICO POR ETAPA
========================================================= */

function criarGraficoEtapas(
  dados
) {

  const canvas =
    document.getElementById(
      "graficoEtapas"
    );


  if (!canvas) {
    return;
  }


  const valores =
    nomesEtapas.map(
      etapa =>
        dados.por_etapa?.[
          etapa
        ] || 0
    );


  definirTexto(
    "totalEtapas",
    dados.total || 0
  );


  criarLegenda(
    "legendaEtapas",
    nomesEtapas,
    valores,
    coresEtapas,
    dados.total
  );


  if (graficoEtapas) {
    graficoEtapas.destroy();
  }


  graficoEtapas =
    new Chart(
      canvas,
      {

        type:
          "doughnut",

        data: {

          labels:
            nomesEtapas,

          datasets: [
            {
              data:
                valores,

              backgroundColor:
                coresEtapas,

              borderColor:
                "#ffffff",

              borderWidth:
                3,

              hoverOffset:
                4
            }
          ]

        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          cutout:
            "68%",

          plugins: {

            legend: {
              display:
                false
            },

            tooltip: {

              callbacks: {

                label:
                  function(
                    context
                  ) {

                    const valor =
                      context.raw || 0;

                    const total =
                      dados.total || 0;

                    const percentual =
                      total > 0
                        ? (
                            (
                              valor /
                              total
                            ) *
                            100
                          ).toFixed(1)
                        : 0;

                    return (
                      `${context.label}: ` +
                      `${valor} (${percentual}%)`
                    );

                  }

              }

            }

          }

        }

      }
    );

}


/* =========================================================
   LEGENDA DOS GRÁFICOS
========================================================= */

function criarLegenda(
  elementoId,
  labels,
  valores,
  cores,
  total
) {

  const container =
    document.getElementById(
      elementoId
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  labels.forEach(
    (
      label,
      indice
    ) => {

      const valor =
        valores[
          indice
        ] || 0;


      const percentual =
        total > 0
          ? Math.round(
              (
                valor /
                total
              ) *
              100
            )
          : 0;


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "legend-item";


      item.innerHTML =
        `
          <span
            class="legend-dot"
            style="
              background:${cores[indice]}
            "
          ></span>

          <span class="legend-name">
            ${label}
          </span>

          <span class="legend-value">
            ${valor} (${percentual}%)
          </span>
        `;


      container.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   DEFINIR TEXTO
========================================================= */

function definirTexto(
  id,
  valor
) {

  const elemento =
    document.getElementById(
      id
    );


  if (elemento) {

    elemento.textContent =
      valor ?? 0;

  }

}


/* =========================================================
   DASHBOARD VAZIO
========================================================= */

function aplicarDashboardVazio() {

  const dados = {

    total:
      0,

    por_tipo: {

      MOP:
        0,

      SOP:
        0,

      EOP:
        0,

      Corretiva:
        0,

      "Instalação":
        0,

      Retrofit:
        0

    },

    por_etapa: {

      "Em elaboração":
        0,

      "Dryrun":
        0,

      "Revisão da qualidade":
        0,

      "Análise de risco":
        0,

      "Validação interna":
        0,

      "Enviado ao cliente":
        0,

      "Completo":
        0

    }

  };


  atualizarCards(
    dados
  );

  atualizarEtapas(
    dados
  );

  criarGraficoTipos(
    dados
  );

  criarGraficoEtapas(
    dados
  );

}


/* =========================================================
   LOGOUT
========================================================= */

const btnLogout =
  document.getElementById(
    "btnLogout"
  );


btnLogout?.addEventListener(
  "click",
  async () => {

    btnLogout.disabled =
      true;

    btnLogout.textContent =
      "Saindo...";


    try {

      const resposta =
        await fetch(
          "/api/logout",
          {
            method:
              "POST"
          }
        );


      if (!resposta.ok) {

        throw new Error(
          "Não foi possível sair do sistema."
        );

      }


      window.location.href =
        "/login";


    } catch (erro) {

      console.error(
        "Erro ao sair:",
        erro
      );


      alert(
        erro.message
      );


      btnLogout.disabled =
        false;

      btnLogout.textContent =
        "Sair";

    }

  }
);