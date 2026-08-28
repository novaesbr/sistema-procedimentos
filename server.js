const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const XLSX = require("xlsx");
const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();


const app = express();

const PORT =
  process.env.PORT || 3000;


/* =========================================================
   CONFIGURAÇÕES DO EXPRESS
========================================================= */

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);


/* =========================================================
   SESSÃO
========================================================= */

app.use(
  session({
    secret:
      process.env.SESSION_SECRET,

    resave:
      false,

    saveUninitialized:
      false,

    cookie: {
      httpOnly:
        true,

      secure:
        false,

      sameSite:
        "lax",

      maxAge:
        1000 * 60 * 60 * 8
    }
  })
);


/* =========================================================
   AUTENTICAÇÃO
========================================================= */

function exigirLogin(
  req,
  res,
  next
) {

  if (
    req.session &&
    req.session.autenticado
  ) {

    return next();

  }


  if (
    req.path.startsWith(
      "/api/"
    )
  ) {

    return res
      .status(401)
      .json({
        erro:
          "Não autenticado."
      });

  }


  return res.redirect(
    "/login"
  );

}

/* =========================================================
   ROTAS DE LOGIN
========================================================= */

app.get(
  "/login",
  (req, res) => {

    if (
      req.session &&
      req.session.autenticado
    ) {

      return res.redirect(
        "/"
      );

    }


    return res.sendFile(
      path.join(
        __dirname,
        "public",
        "login.html"
      )
    );

  }
);


app.post(
  "/api/login",
  (req, res) => {

    const {
      usuario,
      senha
    } = req.body;


    const usuarioCorreto =
      process.env.LOGIN_USER;

    const senhaCorreta =
      process.env.LOGIN_PASSWORD;


    if (
      !usuarioCorreto ||
      !senhaCorreta
    ) {

      return res
        .status(500)
        .json({
          erro:
            "Login não configurado no servidor."
        });

    }


    if (
      usuario === usuarioCorreto &&
      senha === senhaCorreta
    ) {

      req.session.autenticado =
        true;


      req.session.usuario =
        usuario;


      return req.session.save(
        erro => {

          if (erro) {

            console.error(
              "Erro ao salvar sessão:",
              erro
            );


            return res
              .status(500)
              .json({
                erro:
                  "Erro ao iniciar sessão."
              });

          }


          return res.json({
            sucesso:
              true
          });

        }
      );

    }


    return res
      .status(401)
      .json({
        erro:
          "Usuário ou senha incorretos."
      });

  }
);


app.get(
  "/api/sessao",
  (req, res) => {

    res.json({
      autenticado:
        Boolean(
          req.session &&
          req.session.autenticado
        )
    });

  }
);


app.post(
  "/api/logout",
  (req, res) => {

    req.session.destroy(
      erro => {

        if (erro) {

          console.error(
            "Erro ao encerrar sessão:",
            erro
          );


          return res
            .status(500)
            .json({
              erro:
                "Erro ao sair do sistema."
            });

        }


        res.clearCookie(
          "connect.sid"
        );


        return res.json({
          sucesso:
            true
        });

      }
    );

  }
);


/* =========================================================
   ARQUIVOS PÚBLICOS E PROTEGIDOS
========================================================= */

/*
  Libera apenas os arquivos necessários
  para a tela de login.
*/

app.get(
  "/login.html",
  (req, res) => {

    return res.sendFile(
      path.join(
        __dirname,
        "public",
        "login.html"
      )
    );

  }
);


app.get(
  "/login.js",
  (req, res) => {

    return res.sendFile(
      path.join(
        __dirname,
        "public",
        "login.js"
      )
    );

  }
);


app.get(
  "/style.css",
  (req, res) => {

    return res.sendFile(
      path.join(
        __dirname,
        "public",
        "style.css"
      )
    );

  }
);


/*
  Daqui para baixo, todos os arquivos
  do sistema exigem login.
*/

app.use(
  exigirLogin
);


app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);


/* =========================================================
   UPLOADS
========================================================= */

const pastaUploads =
  path.join(
    __dirname,
    "uploads"
  );

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, {
    recursive: true
  });
}

const upload = multer({
  dest: pastaUploads,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {

  supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

} else {

  console.warn(
    "Supabase não configurado no arquivo .env"
  );

}


/* =========================================================
   CONSTANTES
========================================================= */

const ETAPAS_VALIDAS = [
  "Em elaboração",
  "Dryrun",
  "Revisão da qualidade",
  "Análise de risco",
  "Validação interna",
  "Enviado ao cliente",
  "Completo"
];

const TIPOS_VALIDOS = [
  "MOP",
  "SOP",
  "EOP",
  "Corretiva",
  "Instalação",
  "Retrofit"
];

const DOCUMENTOS_VALIDOS = [
  "Principal",
  "Replica"
];


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function texto(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }

  return String(valor).trim();
}


function normalizarTipo(valor) {

  const valorTexto =
    texto(valor);

  if (!valorTexto) {
    return "";
  }


  const valorComparacao =
    valorTexto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();


  if (valorComparacao === "mop") {
    return "MOP";
  }

  if (valorComparacao === "sop") {
    return "SOP";
  }

  if (valorComparacao === "eop") {
    return "EOP";
  }

  if (valorComparacao === "corretiva") {
    return "Corretiva";
  }

  if (valorComparacao === "instalacao") {
    return "Instalação";
  }

  if (valorComparacao === "retrofit") {
    return "Retrofit";
  }


  return valorTexto;
}


function normalizarDocumento(valor) {

  const valorTexto =
    texto(valor)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  if (valorTexto === "principal") {
    return "Principal";
  }

  if (valorTexto === "replica") {
    return "Replica";
  }

  return texto(valor);
}


function normalizarEtapa(valor) {

  const valorTexto =
    texto(valor);

  if (!valorTexto) {
    return "Em elaboração";
  }

  const encontrada =
    ETAPAS_VALIDAS.find(
      etapa =>
        etapa.toLowerCase() ===
        valorTexto.toLowerCase()
    );

  return encontrada || valorTexto;
}


function montarProcedimento(dados) {

  return {

    titulo:
      texto(dados.titulo),

    cliente:
      texto(dados.cliente),

    site:
      texto(dados.site),

    tipo_procedimento:
      normalizarTipo(
        dados.tipo_procedimento
      ),

    tipo_documento:
      normalizarDocumento(
        dados.tipo_documento
      ),

    numero_release:
      texto(dados.numero_release)
        || null,

    etapa:
      normalizarEtapa(
        dados.etapa
      ),

    descricao_projeto:
      texto(
        dados.descricao_projeto
      ) || null

  };

}


function validarProcedimento(
  procedimento
) {

  const erros = [];


  if (!procedimento.titulo) {

    erros.push(
      "Título é obrigatório."
    );

  }


  if (!procedimento.cliente) {

    erros.push(
      "Cliente é obrigatório."
    );

  }


  if (!procedimento.site) {

    erros.push(
      "Site é obrigatório."
    );

  }


  if (
    !TIPOS_VALIDOS.includes(
      procedimento.tipo_procedimento
    )
  ) {

    erros.push(
      "Tipo de procedimento deve ser MOP, SOP ou EOP."
    );

  }


  if (
    !DOCUMENTOS_VALIDOS.includes(
      procedimento.tipo_documento
    )
  ) {

    erros.push(
      "Documento deve ser Principal ou Replica."
    );

  }


  if (
    !ETAPAS_VALIDAS.includes(
      procedimento.etapa
    )
  ) {

    erros.push(
      "Etapa inválida."
    );

  }


  return erros;
}


function verificarSupabase(
  resposta
) {

  if (!supabase) {

    resposta.status(500).json({
      erro:
        "Supabase não configurado."
    });

    return false;
  }

  return true;
}


/* =========================================================
   STATUS
========================================================= */

app.get(
  "/api/status",
  async (req, res) => {

    if (!supabase) {

      return res.json({
        servidor: true,
        supabase: false
      });

    }

    try {

      const {
        error
      } =
        await supabase
          .from("procedimentos")
          .select("id")
          .limit(1);


      if (error) {

        return res.json({
          servidor: true,
          supabase: false,
          erro: error.message
        });

      }


      res.json({
        servidor: true,
        supabase: true
      });


    } catch (erro) {

      res.status(500).json({
        servidor: true,
        supabase: false,
        erro: erro.message
      });

    }

  }
);


/* =========================================================
   LISTAR PROCEDIMENTOS
========================================================= */

app.get(
  "/api/procedimentos",
  async (req, res) => {

    if (!verificarSupabase(res)) {
      return;
    }


    try {

      const {
        site,
        documento,
        tipo,
        etapa,
        busca,
        descricao_projeto
      } = req.query;


      const tamanhoLote =
        1000;

      let inicio =
        0;

      let registros =
        [];


      while (true) {

        const fim =
          inicio +
          tamanhoLote -
          1;


        let consulta =
          supabase
            .from("procedimentos")
            .select("*")
            .order(
              "criado_em",
              {
                ascending: false
              }
            );


        if (
          site &&
          site !== "Todos"
        ) {

          consulta =
            consulta.eq(
              "site",
              site
            );

        }


        if (
          documento &&
          documento !== "Todos"
        ) {

          consulta =
            consulta.eq(
              "tipo_documento",
              documento
            );

        }


        if (
          descricao_projeto &&
          descricao_projeto !== "Todas"
        ) {

          consulta =
            consulta.eq(
              "descricao_projeto",
              descricao_projeto
            );

        }


        if (
          tipo &&
          tipo !== "Todos"
        ) {

          consulta =
            consulta.eq(
              "tipo_procedimento",
              tipo
            );

        }


        if (
          etapa &&
          etapa !== "Todas"
        ) {

          consulta =
            consulta.eq(
              "etapa",
              etapa
            );

        }


        if (busca) {

          const termo =
            texto(busca)
              .replaceAll(",", " ");


          consulta =
            consulta.or(
              [
                `titulo.ilike.%${termo}%`,
                `cliente.ilike.%${termo}%`,
                `site.ilike.%${termo}%`,
                `numero_release.ilike.%${termo}%`,
                `descricao_projeto.ilike.%${termo}%`
              ].join(",")
            );

        }


        const {
          data,
          error
        } =
          await consulta
            .range(
              inicio,
              fim
            );


        if (error) {

          return res
            .status(500)
            .json({
              erro:
                "Erro ao consultar procedimentos.",
              detalhe:
                error.message
            });

        }


        const lote =
          data || [];


        registros.push(
          ...lote
        );


        if (
          lote.length <
          tamanhoLote
        ) {

          break;

        }


        inicio +=
          tamanhoLote;

      }


      res.json(
        registros
      );


    } catch (erro) {

      console.error(
        "Erro interno ao consultar procedimentos:",
        erro
      );


      res
        .status(500)
        .json({
          erro:
            "Erro interno ao consultar procedimentos.",
          detalhe:
            erro.message
        });

    }

  }
);


/* =========================================================
   CONSULTAR UM PROCEDIMENTO
========================================================= */

app.get(
  "/api/procedimentos/:id",
  async (req, res) => {

    if (!verificarSupabase(res)) {
      return;
    }


    try {

      const {
        data,
        error
      } =
        await supabase
          .from("procedimentos")
          .select("*")
          .eq(
            "id",
            req.params.id
          )
          .single();


      if (error) {

        return res
          .status(404)
          .json({
            erro:
              "Procedimento não encontrado.",
            detalhe:
              error.message
          });

      }


      res.json(data);


    } catch (erro) {

      res
        .status(500)
        .json({
          erro:
            "Erro interno.",
          detalhe:
            erro.message
        });

    }

  }
);


/* =========================================================
   CRIAR PROCEDIMENTO
========================================================= */

app.post(
  "/api/procedimentos",
  async (req, res) => {

    if (!verificarSupabase(res)) {
      return;
    }


    try {

      const procedimento =
        montarProcedimento(
          req.body
        );


      const erros =
        validarProcedimento(
          procedimento
        );


      if (erros.length > 0) {

        return res
          .status(400)
          .json({
            erro:
              "Existem campos inválidos.",
            detalhes:
              erros
          });

      }


      const {
        data,
        error
      } =
        await supabase
          .from("procedimentos")
          .insert(
            procedimento
          )
          .select()
          .single();


      if (error) {

        return res
          .status(500)
          .json({
            erro:
              "Erro ao cadastrar procedimento.",
            detalhe:
              error.message
          });

      }


      res
        .status(201)
        .json(data);


    } catch (erro) {

      res
        .status(500)
        .json({
          erro:
            "Erro interno ao cadastrar procedimento.",
          detalhe:
            erro.message
        });

    }

  }
);


/* =========================================================
   EDITAR PROCEDIMENTO
========================================================= */

app.put(
  "/api/procedimentos/:id",
  async (req, res) => {

    if (!verificarSupabase(res)) {
      return;
    }


    try {

      const procedimento =
        montarProcedimento(
          req.body
        );


      const erros =
        validarProcedimento(
          procedimento
        );


      if (erros.length > 0) {

        return res
          .status(400)
          .json({
            erro:
              "Existem campos inválidos.",
            detalhes:
              erros
          });

      }


      procedimento.atualizado_em =
        new Date().toISOString();


      const {
        data,
        error
      } =
        await supabase
          .from("procedimentos")
          .update(
            procedimento
          )
          .eq(
            "id",
            req.params.id
          )
          .select()
          .single();


      if (error) {

        return res
          .status(500)
          .json({
            erro:
              "Erro ao atualizar procedimento.",
            detalhe:
              error.message
          });

      }


      res.json(data);


    } catch (erro) {

      res
        .status(500)
        .json({
          erro:
            "Erro interno ao atualizar procedimento.",
          detalhe:
            erro.message
        });

    }

  }
);


/* =========================================================
   EXCLUIR PROCEDIMENTO
========================================================= */

app.delete(
  "/api/procedimentos/:id",
  async (req, res) => {

    if (!verificarSupabase(res)) {
      return;
    }


    try {

      const {
        error
      } =
        await supabase
          .from("procedimentos")
          .delete()
          .eq(
            "id",
            req.params.id
          );


      if (error) {

        return res
          .status(500)
          .json({
            erro:
              "Erro ao excluir procedimento.",
            detalhe:
              error.message
          });

      }


      res.json({
        sucesso: true
      });


    } catch (erro) {

      res
        .status(500)
        .json({
          erro:
            "Erro interno ao excluir procedimento.",
          detalhe:
            erro.message
        });

    }

  }
);


/* =========================================================
   IMPORTAÇÃO EXCEL
========================================================= */

app.post(
  "/api/importar",
  upload.single("planilha"),
  async (req, res) => {

    if (!verificarSupabase(res)) {

      if (req.file?.path) {

        fs.unlink(
          req.file.path,
          () => {}
        );

      }

      return;
    }


    if (!req.file) {

      return res
        .status(400)
        .json({
          erro:
            "Nenhuma planilha enviada."
        });

    }


    try {

      const workbook =
        XLSX.readFile(
          req.file.path
        );


      const primeiraAba =
        workbook.SheetNames[0];


      if (!primeiraAba) {

        return res
          .status(400)
          .json({
            erro:
              "A planilha não possui abas."
          });

      }


      const worksheet =
        workbook.Sheets[
          primeiraAba
        ];


      const linhas =
        XLSX.utils
          .sheet_to_json(
            worksheet,
            {
              defval: ""
            }
          );


      if (
        !linhas ||
        linhas.length === 0
      ) {

        return res
          .status(400)
          .json({
            erro:
              "A planilha não possui dados para importar."
          });

      }


      function valorColuna(
        linha,
        nomes
      ) {

        const chaves =
          Object.keys(linha);


        for (
          const nome of nomes
        ) {

          const chave =
            chaves.find(
              item => {

                const a =
                  item
                    .normalize("NFD")
                    .replace(
                      /[\u0300-\u036f]/g,
                      ""
                    )
                    .trim()
                    .toLowerCase();

                const b =
                  nome
                    .normalize("NFD")
                    .replace(
                      /[\u0300-\u036f]/g,
                      ""
                    )
                    .trim()
                    .toLowerCase();

                return a === b;

              }
            );


          if (chave) {

            return linha[chave];

          }

        }


        return "";

      }


      const procedimentos = [];

      const linhasComErro = [];


      linhas.forEach(
        (linha, indice) => {

          const procedimento =
            montarProcedimento({

              titulo:
                valorColuna(
                  linha,
                  [
                    "Titulo",
                    "Título",
                    "Titulo do procedimento",
                    "Título do procedimento"
                  ]
                ),

              cliente:
                valorColuna(
                  linha,
                  [
                    "Cliente"
                  ]
                ),

              site:
                valorColuna(
                  linha,
                  [
                    "Site"
                  ]
                ),

              tipo_procedimento:
                valorColuna(
                  linha,
                  [
                    "Tipo de procedimento",
                    "Tipo",
                    "Tipo procedimento"
                  ]
                ),

              tipo_documento:
                valorColuna(
                  linha,
                  [
                    "Documento",
                    "Tipo de documento",
                    "Tipo documento"
                  ]
                ),

              numero_release:
                valorColuna(
                  linha,
                  [
                    "Numero de release",
                    "Número de release",
                    "Release",
                    "Numero release",
                    "Número release"
                  ]
                ),

                etapa:
                valorColuna(
                  linha,
                  [
                    "Etapa"
                  ]
                ),
              
              descricao_projeto:
                valorColuna(
                  linha,
                  [
                    "Descricao do projeto",
                    "Descrição do projeto",
                    "Descricao projeto",
                    "Descrição projeto"
                  ]
                )

            });


          const erros =
            validarProcedimento(
              procedimento
            );


          if (erros.length > 0) {

            linhasComErro.push({

              linha:
                indice + 2,

              erros

            });

          } else {

            procedimentos.push(
              procedimento
            );

          }

        }
      );


      if (
        linhasComErro.length > 0
      ) {

        return res
          .status(400)
          .json({

            erro:
              "Existem linhas inválidas na planilha.",

            total_linhas:
              linhas.length,

            validas:
              procedimentos.length,

            invalidas:
              linhasComErro.length,

            linhas_com_erro:
              linhasComErro

          });

      }


      const {
        data,
        error
      } =
        await supabase
          .from("procedimentos")
          .insert(
            procedimentos
          )
          .select();


      if (error) {

        return res
          .status(500)
          .json({
            erro:
              "Erro ao importar os procedimentos.",
            detalhe:
              error.message
          });

      }


      res.json({

        sucesso: true,

        importados:
          data?.length ||
          procedimentos.length

      });


    } catch (erro) {

      res
        .status(500)
        .json({
          erro:
            "Erro ao processar planilha.",
          detalhe:
            erro.message
        });


    } finally {

      if (
        req.file?.path &&
        fs.existsSync(
          req.file.path
        )
      ) {

        fs.unlink(
          req.file.path,
          () => {}
        );

      }

    }

  }
);


/* =========================================================
   DASHBOARD
========================================================= */

app.get(
  "/api/dashboard",
  async (req, res) => {

    if (!verificarSupabase(res)) {

      return;

    }


    try {

      const {
        site,
        documento,
        descricao_projeto
      } = req.query;


      const tamanhoLote =
        1000;

      let inicio =
        0;

      let registros =
        [];


      /*
        Busca os procedimentos em lotes de 1000
        para não ficar limitado ao máximo padrão
        retornado pelo Supabase.
      */

      while (true) {

        const fim =
          inicio +
          tamanhoLote -
          1;


        let consulta =
          supabase
            .from("procedimentos")
            .select(
              "tipo_procedimento, tipo_documento, site, etapa, descricao_projeto"
            );


        if (
          site &&
          site !== "Todos"
        ) {

          consulta =
            consulta.eq(
              "site",
              site
            );

        }


        if (
          documento &&
          documento !== "Todos"
        ) {

          consulta =
            consulta.eq(
              "tipo_documento",
              documento
            );

        }


        if (
          descricao_projeto &&
          descricao_projeto !== "Todas"
        ) {

          consulta =
            consulta.eq(
              "descricao_projeto",
              descricao_projeto
            );

        }


        const {
          data,
          error
        } =
          await consulta
            .order(
              "id",
              {
                ascending: true
              }
            )
            .range(
              inicio,
              fim
            );


        if (error) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao carregar dashboard.",

              detalhe:
                error.message

            });

        }


        const lote =
          data || [];


        registros.push(
          ...lote
        );


        /*
          Se vier menos de 1000 registros,
          chegamos ao último lote.
        */

        if (
          lote.length <
          tamanhoLote
        ) {

          break;

        }


        inicio +=
          tamanhoLote;

      }


      /* =====================================================
         CONTAGEM POR TIPO
      ===================================================== */

      const porTipo = {

        MOP: 0,
        SOP: 0,
        EOP: 0,
        Corretiva: 0,
        "Instalação": 0,
        Retrofit: 0
      
      };


      /* =====================================================
         CONTAGEM POR ETAPA
      ===================================================== */

      const porEtapa = {};


      ETAPAS_VALIDAS.forEach(
        etapa => {

          porEtapa[etapa] =
            0;

        }
      );


      /* =====================================================
         PROCESSAR REGISTROS
      ===================================================== */

      registros.forEach(
        item => {

          if (
            porTipo[
              item.tipo_procedimento
            ] !== undefined
          ) {

            porTipo[
              item.tipo_procedimento
            ]++;

          }


          if (
            porEtapa[
              item.etapa
            ] !== undefined
          ) {

            porEtapa[
              item.etapa
            ]++;

          }

        }
      );


      /* =====================================================
         RESPOSTA
      ===================================================== */

      res.json({

        total:
          registros.length,

        por_tipo:
          porTipo,

        por_etapa:
          porEtapa

      });


    } catch (erro) {

      console.error(
        "Erro interno ao carregar dashboard:",
        erro
      );


      res
        .status(500)
        .json({

          erro:
            "Erro interno ao carregar dashboard.",

          detalhe:
            erro.message

        });

    }

  }
);


/* =========================================================
   FILTROS
========================================================= */

app.get(
  "/api/filtros",
  async (req, res) => {

    if (!verificarSupabase(res)) {
      return;
    }


    try {

      const {
        site
      } = req.query;


      const tamanhoLote =
        1000;

      let inicio =
        0;

      let registros =
        [];


      while (true) {

        const fim =
          inicio +
          tamanhoLote -
          1;


        let consulta =
          supabase
            .from("procedimentos")
            .select(
              "site, descricao_projeto"
            )
            .order(
              "id",
              {
                ascending: true
              }
            );


        if (
          site &&
          site !== "Todos"
        ) {

          consulta =
            consulta.eq(
              "site",
              site
            );

        }


        const {
          data,
          error
        } =
          await consulta
            .range(
              inicio,
              fim
            );


        if (error) {

          return res
            .status(500)
            .json({
              erro:
                "Erro ao carregar filtros.",
              detalhe:
                error.message
            });

        }


        const lote =
          data || [];


        registros.push(
          ...lote
        );


        if (
          lote.length <
          tamanhoLote
        ) {

          break;

        }


        inicio +=
          tamanhoLote;

      }


      const sites =
        [
          ...new Set(
            registros
              .map(
                item =>
                  item.site
              )
              .filter(
                Boolean
              )
          )
        ]
          .sort(
            (a, b) =>
              a.localeCompare(
                b
              )
          );


      const descricoesProjetos =
        [
          ...new Set(
            registros
              .map(
                item =>
                  item.descricao_projeto
              )
              .filter(
                Boolean
              )
          )
        ]
          .sort(
            (a, b) =>
              a.localeCompare(
                b
              )
          );


      res.json({

        sites,

        descricoes_projetos:
          descricoesProjetos,

        documentos: [
          "Principal",
          "Replica"
        ],

        tipos:
          TIPOS_VALIDOS,

        etapas:
          ETAPAS_VALIDAS

      });


    } catch (erro) {

      console.error(
        "Erro ao carregar filtros:",
        erro
      );


      res
        .status(500)
        .json({
          erro:
            "Erro interno ao carregar filtros.",
          detalhe:
            erro.message
        });

    }

  }
);


/* =========================================================
   HOME
========================================================= */

app.get(
  "/",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "public",
        "index.html"
      )
    );

  }
);


/* =========================================================
   SERVIDOR
========================================================= */

app.listen(
  PORT,
  () => {

    console.log(
      `Sistema de procedimentos rodando na porta ${PORT}`
    );

  }
);