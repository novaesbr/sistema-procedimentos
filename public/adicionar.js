document.addEventListener(
  "DOMContentLoaded",
  () => {

    configurarModos();

    configurarCadastroManual();

    configurarImportacao();

  }
);


/* =========================================================
   MODO
========================================================= */

function configurarModos() {

  document
    .getElementById("btnModoManual")
    ?.addEventListener(
      "click",
      () => alterarModo("manual")
    );


  document
    .getElementById("btnModoPlanilha")
    ?.addEventListener(
      "click",
      () => alterarModo("planilha")
    );

}


function alterarModo(modo) {

  const btnManual =
    document.getElementById("btnModoManual");

  const btnPlanilha =
    document.getElementById("btnModoPlanilha");

  const painelManual =
    document.getElementById("painelManual");

  const painelPlanilha =
    document.getElementById("painelPlanilha");


  if (modo === "manual") {

    btnManual.classList.add("active");
    btnPlanilha.classList.remove("active");

    painelManual.classList.remove("hidden");
    painelPlanilha.classList.add("hidden");

  } else {

    btnPlanilha.classList.add("active");
    btnManual.classList.remove("active");

    painelPlanilha.classList.remove("hidden");
    painelManual.classList.add("hidden");

  }

}


/* =========================================================
   CADASTRO MANUAL
========================================================= */

function configurarCadastroManual() {

  document
    .getElementById("formCadastroManual")
    ?.addEventListener(
      "submit",
      salvarProcedimento
    );

}


async function salvarProcedimento(evento) {

  evento.preventDefault();


  const botao =
    document.getElementById(
      "btnSalvarProcedimento"
    );


    const dados = {

      descricao_projeto:
        document
          .getElementById("descricaoProjeto")
          .value
          .trim(),
    
      titulo:
        document
          .getElementById("titulo")
          .value
          .trim(),
    
      cliente:
        document
          .getElementById("cliente")
          .value
          .trim(),
    
      site:
        document
          .getElementById("site")
          .value
          .trim(),
    
      tipo_procedimento:
        document
          .getElementById("tipoProcedimento")
          .value,
    
      tipo_documento:
        document
          .getElementById("tipoDocumento")
          .value,
    
      numero_release:
        document
          .getElementById("numeroRelease")
          .value
          .trim(),
    
      etapa:
        document
          .getElementById("etapa")
          .value
    
    };


  mostrarMensagem(
    "mensagemCadastro",
    "Salvando procedimento...",
    "info"
  );


  botao.disabled = true;

  botao.textContent =
    "Salvando...";


  try {

    const resposta =
      await fetch(
        "/api/procedimentos",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(dados)

        }
      );


    const resultado =
      await resposta.json();


    if (!resposta.ok) {

      let mensagem =
        resultado.erro ||
        resultado.detalhe ||
        "Não foi possível cadastrar o procedimento.";


      if (
        Array.isArray(
          resultado.detalhes
        )
      ) {

        mensagem =
          resultado.detalhes.join(" ");

      }


      throw new Error(mensagem);

    }


    mostrarMensagem(
      "mensagemCadastro",
      "Procedimento cadastrado com sucesso.",
      "success"
    );


    document
      .getElementById("formCadastroManual")
      .reset();


    document
      .getElementById("etapa")
      .value =
        "Em elaboração";


  } catch (erro) {

    mostrarMensagem(
      "mensagemCadastro",
      erro.message,
      "error"
    );


  } finally {

    botao.disabled = false;

    botao.textContent =
      "Salvar procedimento";

  }

}


/* =========================================================
   IMPORTAÇÃO
========================================================= */

function configurarImportacao() {

  const input =
    document.getElementById(
      "arquivoPlanilha"
    );

  const btnSelecionar =
    document.getElementById(
      "btnSelecionarPlanilha"
    );

  const uploadArea =
    document.getElementById(
      "uploadArea"
    );


  btnSelecionar
    ?.addEventListener(
      "click",
      evento => {

        evento.stopPropagation();

        input.click();

      }
    );


  uploadArea
    ?.addEventListener(
      "click",
      () => {

        input.click();

      }
    );


  input
    ?.addEventListener(
      "change",
      atualizarArquivoSelecionado
    );


  document
    .getElementById("formImportacao")
    ?.addEventListener(
      "submit",
      importarPlanilha
    );


  document
    .getElementById("btnLimparPlanilha")
    ?.addEventListener(
      "click",
      limparImportacao
    );

}


function atualizarArquivoSelecionado() {

  const input =
    document.getElementById(
      "arquivoPlanilha"
    );

  const elemento =
    document.getElementById(
      "arquivoSelecionado"
    );


  if (
    input.files &&
    input.files.length > 0
  ) {

    elemento.textContent =
      input.files[0].name;

    elemento.classList.add(
      "has-file"
    );

  } else {

    elemento.textContent =
      "Nenhum arquivo selecionado";

    elemento.classList.remove(
      "has-file"
    );

  }

}


async function importarPlanilha(evento) {

  evento.preventDefault();


  const input =
    document.getElementById(
      "arquivoPlanilha"
    );

  const botao =
    document.getElementById(
      "btnImportarPlanilha"
    );


  if (
    !input.files ||
    input.files.length === 0
  ) {

    mostrarMensagem(
      "mensagemImportacao",
      "Selecione uma planilha antes de importar.",
      "error"
    );

    return;

  }


  const arquivo =
    input.files[0];


  const extensao =
    arquivo.name
      .split(".")
      .pop()
      .toLowerCase();


  if (
    ![
      "xlsx",
      "xls",
      "xlsm"
    ].includes(extensao)
  ) {

    mostrarMensagem(
      "mensagemImportacao",
      "Selecione um arquivo Excel válido.",
      "error"
    );

    return;

  }


  const formData =
    new FormData();


  formData.append(
    "planilha",
    arquivo
  );


  botao.disabled = true;

  botao.textContent =
    "Importando...";


  mostrarMensagem(
    "mensagemImportacao",
    "Lendo e validando a planilha...",
    "info"
  );


  ocultarResultadoImportacao();


  try {

    const resposta =
      await fetch(
        "/api/importar",
        {
          method: "POST",
          body: formData
        }
      );


    const resultado =
      await resposta.json();


    if (!resposta.ok) {

      if (
        Array.isArray(
          resultado.linhas_com_erro
        )
      ) {

        mostrarResultadoComErros(
          resultado
        );


        mostrarMensagem(
          "mensagemImportacao",
          "A importação não foi realizada porque existem linhas com erro.",
          "error"
        );


        return;

      }


      throw new Error(
        resultado.erro ||
        resultado.detalhe ||
        "Erro ao importar planilha."
      );

    }


    mostrarMensagem(
      "mensagemImportacao",
      `${resultado.importados} procedimento(s) importado(s) com sucesso.`,
      "success"
    );


    mostrarResultadoSucesso(
      resultado
    );


  } catch (erro) {

    mostrarMensagem(
      "mensagemImportacao",
      erro.message,
      "error"
    );


  } finally {

    botao.disabled = false;

    botao.textContent =
      "Importar procedimentos";

  }

}


function mostrarResultadoSucesso(
  resultado
) {

  const painel =
    document.getElementById(
      "resultadoImportacao"
    );


  painel.classList.remove("hidden");


  document.getElementById(
    "resultadoTotal"
  ).textContent =
    resultado.importados || 0;


  document.getElementById(
    "resultadoValidas"
  ).textContent =
    resultado.importados || 0;


  document.getElementById(
    "resultadoInvalidas"
  ).textContent =
    "0";


  document.getElementById(
    "listaErrosImportacao"
  ).innerHTML = "";

}


function mostrarResultadoComErros(
  resultado
) {

  const painel =
    document.getElementById(
      "resultadoImportacao"
    );


  painel.classList.remove("hidden");


  document.getElementById(
    "resultadoTotal"
  ).textContent =
    resultado.total_linhas || 0;


  document.getElementById(
    "resultadoValidas"
  ).textContent =
    resultado.validas || 0;


  document.getElementById(
    "resultadoInvalidas"
  ).textContent =
    resultado.invalidas || 0;


  const lista =
    document.getElementById(
      "listaErrosImportacao"
    );


  lista.innerHTML = "";


  const titulo =
    document.createElement("div");


  titulo.className =
    "import-error-title";


  titulo.textContent =
    "Linhas que precisam ser corrigidas:";


  lista.appendChild(titulo);


  resultado
    .linhas_com_erro
    .forEach(item => {

      const div =
        document.createElement("div");


      div.className =
        "import-error-item";


      div.innerHTML = `

        <strong>
          Linha ${item.linha}
        </strong>

        <span>
          ${escaparHtml(
            item.erros.join(" ")
          )}
        </span>

      `;


      lista.appendChild(div);

    });

}


function limparImportacao() {

  const input =
    document.getElementById(
      "arquivoPlanilha"
    );


  input.value = "";


  atualizarArquivoSelecionado();


  limparMensagem(
    "mensagemImportacao"
  );


  ocultarResultadoImportacao();

}


function ocultarResultadoImportacao() {

  document
    .getElementById("resultadoImportacao")
    ?.classList.add("hidden");

}


/* =========================================================
   MENSAGENS
========================================================= */

function mostrarMensagem(
  elementoId,
  texto,
  tipo
) {

  const elemento =
    document.getElementById(
      elementoId
    );


  if (!elemento) {
    return;
  }


  elemento.textContent =
    texto;


  elemento.className =
    `form-message ${tipo}`;

}


function limparMensagem(elementoId) {

  const elemento =
    document.getElementById(
      elementoId
    );


  if (!elemento) {
    return;
  }


  elemento.textContent = "";

  elemento.className =
    "form-message";

}


function escaparHtml(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }


  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

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