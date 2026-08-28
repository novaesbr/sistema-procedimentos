let procedimentosAtuais = [];

let idParaExcluir = null;

let idsSelecionados = new Set();


document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await carregarFiltros();

    configurarEventos();

    await carregarProcedimentos();

  }
);


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {

  document
    .getElementById("filtroSite")
    ?.addEventListener(
      "change",
      async () => {

        await carregarDescricoesPorSite();

        await carregarProcedimentos();

      }
    );


  document
    .getElementById("filtroDescricaoProjeto")
    ?.addEventListener(
      "change",
      carregarProcedimentos
    );


  document
    .getElementById("filtroDocumento")
    ?.addEventListener(
      "change",
      carregarProcedimentos
    );


  document
    .getElementById("filtroTipoTabela")
    ?.addEventListener(
      "change",
      carregarProcedimentos
    );


  document
    .getElementById("filtroEtapaTabela")
    ?.addEventListener(
      "change",
      carregarProcedimentos
    );


  let timerBusca;


  document
    .getElementById("campoBusca")
    ?.addEventListener(
      "input",
      () => {

        clearTimeout(
          timerBusca
        );

        timerBusca =
          setTimeout(
            carregarProcedimentos,
            350
          );

      }
    );


  document
    .getElementById("btnFecharModal")
    ?.addEventListener(
      "click",
      fecharModalEdicao
    );


  document
    .getElementById("btnCancelarEdicao")
    ?.addEventListener(
      "click",
      fecharModalEdicao
    );


  document
    .getElementById("formEdicao")
    ?.addEventListener(
      "submit",
      salvarEdicao
    );


  document
    .getElementById("btnFecharExclusao")
    ?.addEventListener(
      "click",
      fecharModalExclusao
    );


  document
    .getElementById("btnCancelarExclusao")
    ?.addEventListener(
      "click",
      fecharModalExclusao
    );


  document
    .getElementById("btnConfirmarExclusao")
    ?.addEventListener(
      "click",
      confirmarExclusao
    );


  document
    .getElementById("modalEdicao")
    ?.addEventListener(
      "click",
      evento => {

        if (
          evento.target.id ===
          "modalEdicao"
        ) {

          fecharModalEdicao();

        }

      }
    );


  document
    .getElementById("modalExclusao")
    ?.addEventListener(
      "click",
      evento => {

        if (
          evento.target.id ===
          "modalExclusao"
        ) {

          fecharModalExclusao();

        }

      }
    );


  document.getElementById("selecionarTodosProcedimentos")
    ?.addEventListener("change", evento => {
      selecionarTodos(evento.target.checked);
    });

  document.getElementById("btnEditarSelecionados")
    ?.addEventListener("click", abrirEdicaoLote);

  document.getElementById("btnFecharEdicaoLote")
    ?.addEventListener("click", fecharModalEdicaoLote);

  document.getElementById("btnCancelarEdicaoLote")
    ?.addEventListener("click", fecharModalEdicaoLote);

  document.getElementById("formEdicaoLote")
    ?.addEventListener("submit", salvarEdicaoLote);

  document.getElementById("modalEdicaoLote")
    ?.addEventListener("click", evento => {
      if (evento.target.id === "modalEdicaoLote") {
        fecharModalEdicaoLote();
      }
    });

  configurarCampoLote("acaoLoteDescricaoProjeto", "editarLoteDescricaoProjeto");
  configurarCampoLote("acaoLoteCliente", "editarLoteCliente");
  configurarCampoLote("acaoLoteSite", "editarLoteSite");
  configurarCampoLote("acaoLoteRelease", "editarLoteRelease");

}


/* =========================================================
   CARREGAR FILTROS INICIAIS
========================================================= */

async function carregarFiltros() {

  try {

    const resposta =
      await fetch(
        "/api/filtros"
      );


    if (!resposta.ok) {

      console.warn(
        "Não foi possível carregar os filtros."
      );

      return;

    }


    const dados =
      await resposta.json();


    /* =============================
       SITE
    ============================= */

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


    /* =============================
       DESCRIÇÃO DO PROJETO
    ============================= */

    preencherDescricoesProjeto(
      dados.descricoes_projetos
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar filtros:",
      erro
    );

  }

}


/* =========================================================
   DESCRIÇÕES POR SITE
========================================================= */

async function carregarDescricoesPorSite() {

  const site =
    document
      .getElementById(
        "filtroSite"
      )
      ?.value || "Todos";


  const selectDescricaoProjeto =
    document.getElementById(
      "filtroDescricaoProjeto"
    );


  if (!selectDescricaoProjeto) {
    return;
  }


  /*
    Ao mudar o Site, a descrição selecionada anteriormente
    deixa de valer.
  */

  selectDescricaoProjeto.innerHTML =
    `<option value="Todas">Todas</option>`;


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


    preencherDescricoesProjeto(
      dados.descricoes_projetos
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar descrições por site:",
      erro
    );

  }

}


/* =========================================================
   PREENCHER SELECT DE DESCRIÇÃO
========================================================= */

function preencherDescricoesProjeto(
  descricoes
) {

  const selectDescricaoProjeto =
    document.getElementById(
      "filtroDescricaoProjeto"
    );


  if (!selectDescricaoProjeto) {
    return;
  }


  selectDescricaoProjeto.innerHTML =
    `<option value="Todas">Todas</option>`;


  const lista =
    Array.isArray(
      descricoes
    )
      ? descricoes
      : [];


  lista.forEach(
    descricao => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        descricao;

      option.textContent =
        descricao;


      selectDescricaoProjeto
        .appendChild(
          option
        );

    }
  );

}


/* =========================================================
   CARREGAR PROCEDIMENTOS
========================================================= */

async function carregarProcedimentos() {

  limparSelecao();

  const tabela =
    document.getElementById(
      "tabelaProcedimentos"
    );


  if (!tabela) {
    return;
  }


  tabela.innerHTML = `

    <tr>

      <td
        colspan="10"
        class="empty-table"
      >
        Carregando procedimentos...
      </td>

    </tr>

  `;


  const parametros =
    new URLSearchParams();


  const site =
    document
      .getElementById(
        "filtroSite"
      )
      ?.value;


  const descricaoProjeto =
    document
      .getElementById(
        "filtroDescricaoProjeto"
      )
      ?.value;


  const documento =
    document
      .getElementById(
        "filtroDocumento"
      )
      ?.value;


  const tipo =
    document
      .getElementById(
        "filtroTipoTabela"
      )
      ?.value;


  const etapa =
    document
      .getElementById(
        "filtroEtapaTabela"
      )
      ?.value;


  const busca =
    document
      .getElementById(
        "campoBusca"
      )
      ?.value
      .trim();


  if (site) {

    parametros.set(
      "site",
      site
    );

  }


  if (descricaoProjeto) {

    parametros.set(
      "descricao_projeto",
      descricaoProjeto
    );

  }


  if (documento) {

    parametros.set(
      "documento",
      documento
    );

  }


  if (tipo) {

    parametros.set(
      "tipo",
      tipo
    );

  }


  if (etapa) {

    parametros.set(
      "etapa",
      etapa
    );

  }


  if (busca) {

    parametros.set(
      "busca",
      busca
    );

  }


  try {

    const resposta =
      await fetch(
        `/api/procedimentos?${parametros.toString()}`
      );


    if (!resposta.ok) {

      throw new Error(
        "Não foi possível carregar os procedimentos."
      );

    }


    procedimentosAtuais =
      await resposta.json();


    renderizarTabela();


  } catch (erro) {

    console.error(
      erro
    );


    procedimentosAtuais =
      [];


    tabela.innerHTML = `

      <tr>

        <td
          colspan="10"
          class="empty-table"
        >
          Não foi possível carregar os procedimentos.
        </td>

      </tr>

    `;


    atualizarTotal();

  }

}


/* =========================================================
   RENDERIZAR TABELA
========================================================= */

function renderizarTabela() {

  const tabela =
    document.getElementById(
      "tabelaProcedimentos"
    );


  if (!tabela) {
    return;
  }


  atualizarTotal();


  if (
    procedimentosAtuais.length === 0
  ) {

    tabela.innerHTML = `

      <tr>

        <td
          colspan="10"
          class="empty-table"
        >
          Nenhum procedimento encontrado.
        </td>

      </tr>

    `;

    return;

  }


  tabela.innerHTML =
    "";


  procedimentosAtuais.forEach(
    procedimento => {

      const linha =
        document.createElement(
          "tr"
        );


      linha.innerHTML = `

        <td class="selection-cell">

          <input
            type="checkbox"
            class="procedure-checkbox"
            data-id="${escaparHtml(procedimento.id)}"
            onchange="alternarSelecaoProcedimento(this)"
          >

        </td>


        <td>

          ${
            procedimento.descricao_projeto

              ? escaparHtml(
                  procedimento.descricao_projeto
                )

              : '<span class="empty-value">—</span>'
          }

        </td>


        <td>

          <strong>

            ${escaparHtml(
              procedimento.titulo
            )}

          </strong>

        </td>


        <td>

          ${escaparHtml(
            procedimento.cliente
          )}

        </td>


        <td>

          ${escaparHtml(
            procedimento.site
          )}

        </td>


        <td>

          <span
            class="type-badge type-${String(
              procedimento.tipo_procedimento
            ).toLowerCase()}"
          >

            ${escaparHtml(
              procedimento.tipo_procedimento
            )}

          </span>

        </td>


        <td>

          <span
            class="document-badge ${
              procedimento.tipo_documento ===
              "Principal"
                ? "principal"
                : "replica"
            }"
          >

            ${
              procedimento.tipo_documento ===
              "Replica"
                ? "Réplica"
                : "Principal"
            }

          </span>

        </td>


        <td>

          ${
            procedimento.numero_release

              ? escaparHtml(
                  procedimento.numero_release
                )

              : '<span class="empty-value">—</span>'
          }

        </td>


        <td>

          ${criarBadgeEtapa(
            procedimento.etapa
          )}

        </td>


        <td class="actions-cell">

          <button
            type="button"
            class="action-button edit"
            onclick="abrirEdicao('${procedimento.id}')"
          >
            Editar
          </button>


          <button
            type="button"
            class="action-button delete"
            onclick="abrirExclusao('${procedimento.id}')"
          >
            Excluir
          </button>

        </td>

      `;


      tabela.appendChild(
        linha
      );

    }
  );

}



/* =========================================================
   SELEÇÃO E EDIÇÃO EM LOTE
========================================================= */

function alternarSelecaoProcedimento(checkbox) {
  const id = String(checkbox.dataset.id || "");
  if (!id) return;

  if (checkbox.checked) {
    idsSelecionados.add(id);
  } else {
    idsSelecionados.delete(id);
  }

  atualizarEstadoSelecao();
}


function selecionarTodos(selecionar) {
  document.querySelectorAll(".procedure-checkbox").forEach(checkbox => {
    checkbox.checked = selecionar;

    const id = String(checkbox.dataset.id || "");
    if (!id) return;

    if (selecionar) {
      idsSelecionados.add(id);
    } else {
      idsSelecionados.delete(id);
    }
  });

  atualizarEstadoSelecao();
}


function limparSelecao() {
  idsSelecionados.clear();

  const checkboxTodos =
    document.getElementById("selecionarTodosProcedimentos");

  if (checkboxTodos) {
    checkboxTodos.checked = false;
    checkboxTodos.indeterminate = false;
  }

  atualizarEstadoSelecao();
}


function atualizarEstadoSelecao() {
  const quantidade = idsSelecionados.size;
  const total = procedimentosAtuais.length;

  const texto = document.getElementById("totalSelecionados");
  if (texto) {
    texto.textContent =
      `${quantidade} ${quantidade === 1 ? "selecionado" : "selecionados"}`;
  }

  const botao = document.getElementById("btnEditarSelecionados");
  if (botao) {
    botao.disabled = quantidade === 0;
  }

  const checkboxTodos =
    document.getElementById("selecionarTodosProcedimentos");

  if (checkboxTodos) {
    checkboxTodos.checked = total > 0 && quantidade === total;
    checkboxTodos.indeterminate = quantidade > 0 && quantidade < total;
  }
}


function configurarCampoLote(idAcao, idCampo) {
  const acao = document.getElementById(idAcao);
  const campo = document.getElementById(idCampo);

  if (!acao || !campo) return;

  const atualizar = () => {
    campo.disabled = acao.value !== "alterar";

    if (acao.value !== "alterar") {
      campo.value = "";
    }
  };

  acao.addEventListener("change", atualizar);
  atualizar();
}


function abrirEdicaoLote() {
  if (idsSelecionados.size === 0) return;

  resetarFormularioEdicaoLote();

  const quantidade = idsSelecionados.size;
  const resumo = document.getElementById("quantidadeEdicaoLote");

  if (resumo) {
    resumo.textContent =
      `${quantidade} ${quantidade === 1
        ? "procedimento selecionado"
        : "procedimentos selecionados"}`;
  }

  document.getElementById("modalEdicaoLote")
    ?.classList.add("show");

  document.body.classList.add("modal-open");
}


function fecharModalEdicaoLote() {
  document.getElementById("modalEdicaoLote")
    ?.classList.remove("show");

  document.body.classList.remove("modal-open");
  limparMensagemEdicaoLote();
}


function resetarFormularioEdicaoLote() {
  document.getElementById("formEdicaoLote")?.reset();

  [
    "editarLoteDescricaoProjeto",
    "editarLoteCliente",
    "editarLoteSite",
    "editarLoteRelease"
  ].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.disabled = true;
  });

  limparMensagemEdicaoLote();
}


function montarAlteracoesLote() {
  const alteracoes = {};

  const acaoDescricao =
    document.getElementById("acaoLoteDescricaoProjeto")?.value;

  if (acaoDescricao === "alterar") {
    alteracoes.descricao_projeto =
      document.getElementById("editarLoteDescricaoProjeto")?.value.trim() || "";
  } else if (acaoDescricao === "limpar") {
    alteracoes.descricao_projeto = null;
  }

  const acaoCliente =
    document.getElementById("acaoLoteCliente")?.value;

  if (acaoCliente === "alterar") {
    alteracoes.cliente =
      document.getElementById("editarLoteCliente")?.value.trim() || "";
  }

  const acaoSite =
    document.getElementById("acaoLoteSite")?.value;

  if (acaoSite === "alterar") {
    alteracoes.site =
      document.getElementById("editarLoteSite")?.value.trim() || "";
  }

  const tipo =
    document.getElementById("editarLoteTipo")?.value;

  if (tipo) {
    alteracoes.tipo_procedimento = tipo;
  }

  const documento =
    document.getElementById("editarLoteDocumento")?.value;

  if (documento) {
    alteracoes.tipo_documento = documento;
  }

  const acaoRelease =
    document.getElementById("acaoLoteRelease")?.value;

  if (acaoRelease === "alterar") {
    alteracoes.numero_release =
      document.getElementById("editarLoteRelease")?.value.trim() || "";
  } else if (acaoRelease === "limpar") {
    alteracoes.numero_release = null;
  }

  const etapa =
    document.getElementById("editarLoteEtapa")?.value;

  if (etapa) {
    alteracoes.etapa = etapa;
  }

  return alteracoes;
}


async function salvarEdicaoLote(evento) {
  evento.preventDefault();

  const ids = Array.from(idsSelecionados);
  const alteracoes = montarAlteracoesLote();

  if (ids.length === 0) {
    mostrarMensagemEdicaoLote(
      "Nenhum procedimento selecionado.",
      "error"
    );
    return;
  }

  if (Object.keys(alteracoes).length === 0) {
    mostrarMensagemEdicaoLote(
      "Escolha pelo menos um campo para alterar.",
      "error"
    );
    return;
  }

  if (
    Object.prototype.hasOwnProperty.call(alteracoes, "cliente") &&
    !alteracoes.cliente
  ) {
    mostrarMensagemEdicaoLote("Informe o novo Cliente.", "error");
    return;
  }

  if (
    Object.prototype.hasOwnProperty.call(alteracoes, "site") &&
    !alteracoes.site
  ) {
    mostrarMensagemEdicaoLote("Informe o novo Site.", "error");
    return;
  }

  const quantidade = ids.length;

  const confirmado = window.confirm(
    `${quantidade} ${quantidade === 1
      ? "procedimento será atualizado"
      : "procedimentos serão atualizados"}. Deseja continuar?`
  );

  if (!confirmado) return;

  const botao = document.getElementById("btnSalvarEdicaoLote");

  if (botao) {
    botao.disabled = true;
    botao.textContent = "Aplicando alterações...";
  }

  mostrarMensagemEdicaoLote(
    "Atualizando procedimentos...",
    "info"
  );

  try {
    const resposta = await fetch(
      "/api/procedimentos/lote",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ids,
          alteracoes
        })
      }
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
        resultado.detalhe ||
        "Erro ao atualizar procedimentos."
      );
    }

    mostrarMensagemEdicaoLote(
      `${resultado.atualizados || quantidade} procedimentos atualizados com sucesso.`,
      "success"
    );

    await carregarFiltros();
    await carregarProcedimentos();

    setTimeout(
      fecharModalEdicaoLote,
      700
    );

  } catch (erro) {
    mostrarMensagemEdicaoLote(
      erro.message,
      "error"
    );

  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Aplicar alterações";
    }
  }
}


function mostrarMensagemEdicaoLote(texto, tipo) {
  const mensagem =
    document.getElementById("mensagemEdicaoLote");

  if (!mensagem) return;

  mensagem.textContent = texto;
  mensagem.className = `form-message ${tipo}`;
}


function limparMensagemEdicaoLote() {
  const mensagem =
    document.getElementById("mensagemEdicaoLote");

  if (!mensagem) return;

  mensagem.textContent = "";
  mensagem.className = "form-message";
}


/* =========================================================
   BADGE ETAPA
========================================================= */

function criarBadgeEtapa(
  etapa
) {

  const classes = {

    "Em elaboração":
      "stage-elaboracao",

    "Dryrun":
      "stage-dryrun",

    "Revisão da qualidade":
      "stage-qualidade",

    "Análise de risco":
      "stage-risco",

    "Validação interna":
      "stage-validacao",

    "Enviado ao cliente":
      "stage-cliente",

    "Completo":
      "stage-completo"

  };


  const classe =
    classes[
      etapa
    ] ||
    "stage-default";


  return `

    <span
      class="stage-badge ${classe}"
    >

      ${escaparHtml(
        etapa
      )}

    </span>

  `;

}


/* =========================================================
   TOTAL
========================================================= */

function atualizarTotal() {

  const elemento =
    document.getElementById(
      "totalEncontrado"
    );


  if (elemento) {

    elemento.textContent =
      procedimentosAtuais.length;

  }

}


/* =========================================================
   ABRIR EDIÇÃO
========================================================= */

function abrirEdicao(
  id
) {

  const procedimento =
    procedimentosAtuais.find(
      item =>
        String(
          item.id
        ) ===
        String(
          id
        )
    );


  if (!procedimento) {
    return;
  }


  document.getElementById(
    "editarId"
  ).value =
    procedimento.id;


  document.getElementById(
    "editarDescricaoProjeto"
  ).value =
    procedimento.descricao_projeto ||
    "";


  document.getElementById(
    "editarTitulo"
  ).value =
    procedimento.titulo ||
    "";


  document.getElementById(
    "editarCliente"
  ).value =
    procedimento.cliente ||
    "";


  document.getElementById(
    "editarSite"
  ).value =
    procedimento.site ||
    "";


  document.getElementById(
    "editarTipo"
  ).value =
    procedimento.tipo_procedimento;


  document.getElementById(
    "editarDocumento"
  ).value =
    procedimento.tipo_documento;


  document.getElementById(
    "editarRelease"
  ).value =
    procedimento.numero_release ||
    "";


  document.getElementById(
    "editarEtapa"
  ).value =
    procedimento.etapa;


  limparMensagemEdicao();


  document
    .getElementById(
      "modalEdicao"
    )
    .classList.add(
      "show"
    );


  document.body
    .classList.add(
      "modal-open"
    );

}


/* =========================================================
   FECHAR EDIÇÃO
========================================================= */

function fecharModalEdicao() {

  document
    .getElementById(
      "modalEdicao"
    )
    ?.classList.remove(
      "show"
    );


  document.body
    .classList.remove(
      "modal-open"
    );


  limparMensagemEdicao();

}


/* =========================================================
   SALVAR EDIÇÃO
========================================================= */

async function salvarEdicao(
  evento
) {

  evento.preventDefault();


  const id =
    document.getElementById(
      "editarId"
    ).value;


  const dados = {

    descricao_projeto:
      document
        .getElementById(
          "editarDescricaoProjeto"
        )
        .value
        .trim(),

    titulo:
      document
        .getElementById(
          "editarTitulo"
        )
        .value
        .trim(),

    cliente:
      document
        .getElementById(
          "editarCliente"
        )
        .value
        .trim(),

    site:
      document
        .getElementById(
          "editarSite"
        )
        .value
        .trim(),

    tipo_procedimento:
      document
        .getElementById(
          "editarTipo"
        )
        .value,

    tipo_documento:
      document
        .getElementById(
          "editarDocumento"
        )
        .value,

    numero_release:
      document
        .getElementById(
          "editarRelease"
        )
        .value
        .trim(),

    etapa:
      document
        .getElementById(
          "editarEtapa"
        )
        .value

  };


  mostrarMensagemEdicao(
    "Salvando alterações...",
    "info"
  );


  try {

    const resposta =
      await fetch(
        `/api/procedimentos/${id}`,
        {

          method:
            "PUT",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify(
              dados
            )

        }
      );


    const resultado =
      await resposta.json();


    if (!resposta.ok) {

      throw new Error(
        resultado.erro ||
        resultado.detalhe ||
        "Erro ao atualizar procedimento."
      );

    }


    mostrarMensagemEdicao(
      "Procedimento atualizado com sucesso.",
      "success"
    );


    /*
      Recarrega os filtros porque a edição pode
      ter alterado o Site ou a Descrição do projeto.
    */

    const siteSelecionado =
      document.getElementById(
        "filtroSite"
      )?.value || "Todos";


    await carregarDescricoesPorSite();


    const selectSite =
      document.getElementById(
        "filtroSite"
      );


    if (
      selectSite &&
      Array.from(
        selectSite.options
      ).some(
        option =>
          option.value ===
          siteSelecionado
      )
    ) {

      selectSite.value =
        siteSelecionado;

    }


    await carregarProcedimentos();


    setTimeout(
      fecharModalEdicao,
      700
    );


  } catch (erro) {

    mostrarMensagemEdicao(
      erro.message,
      "error"
    );

  }

}


/* =========================================================
   ABRIR EXCLUSÃO
========================================================= */

function abrirExclusao(
  id
) {

  const procedimento =
    procedimentosAtuais.find(
      item =>
        String(
          item.id
        ) ===
        String(
          id
        )
    );


  if (!procedimento) {
    return;
  }


  idParaExcluir =
    procedimento.id;


  document.getElementById(
    "procedimentoExcluirTexto"
  ).textContent =
    `${procedimento.titulo} • ${procedimento.tipo_procedimento} • ${procedimento.site}`;


  document
    .getElementById(
      "modalExclusao"
    )
    .classList.add(
      "show"
    );


  document.body
    .classList.add(
      "modal-open"
    );

}


/* =========================================================
   FECHAR EXCLUSÃO
========================================================= */

function fecharModalExclusao() {

  idParaExcluir =
    null;


  document
    .getElementById(
      "modalExclusao"
    )
    ?.classList.remove(
      "show"
    );


  document.body
    .classList.remove(
      "modal-open"
    );

}


/* =========================================================
   CONFIRMAR EXCLUSÃO
========================================================= */

async function confirmarExclusao() {

  if (!idParaExcluir) {
    return;
  }


  const botao =
    document.getElementById(
      "btnConfirmarExclusao"
    );


  if (!botao) {
    return;
  }


  botao.disabled =
    true;


  botao.textContent =
    "Excluindo...";


  try {

    const resposta =
      await fetch(
        `/api/procedimentos/${idParaExcluir}`,
        {

          method:
            "DELETE"

        }
      );


    const resultado =
      await resposta.json();


    if (!resposta.ok) {

      throw new Error(
        resultado.erro ||
        "Erro ao excluir procedimento."
      );

    }


    fecharModalExclusao();


    /*
      A exclusão pode ter removido o último procedimento
      de uma descrição, então atualizamos as descrições.
    */

    await carregarDescricoesPorSite();

    await carregarProcedimentos();


  } catch (erro) {

    alert(
      erro.message
    );


  } finally {

    botao.disabled =
      false;


    botao.textContent =
      "Excluir procedimento";

  }

}


/* =========================================================
   MENSAGENS
========================================================= */

function mostrarMensagemEdicao(
  texto,
  tipo
) {

  const mensagem =
    document.getElementById(
      "mensagemEdicao"
    );


  if (!mensagem) {
    return;
  }


  mensagem.textContent =
    texto;


  mensagem.className =
    `form-message ${tipo}`;

}


function limparMensagemEdicao() {

  const mensagem =
    document.getElementById(
      "mensagemEdicao"
    );


  if (!mensagem) {
    return;
  }


  mensagem.textContent =
    "";


  mensagem.className =
    "form-message";

}


/* =========================================================
   SEGURANÇA HTML
========================================================= */

function escaparHtml(
  valor
) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  return String(
    valor
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
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