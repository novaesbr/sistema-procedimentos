document.addEventListener(
    "DOMContentLoaded",
    () => {
  
      const formLogin =
        document.getElementById(
          "formLogin"
        );
  
      const mensagem =
        document.getElementById(
          "mensagemLogin"
        );
  
      const botao =
        document.getElementById(
          "btnEntrar"
        );
  
  
      formLogin?.addEventListener(
        "submit",
        async evento => {
  
          evento.preventDefault();
  
  
          const usuario =
            document
              .getElementById(
                "usuario"
              )
              .value
              .trim();
  
  
          const senha =
            document
              .getElementById(
                "senha"
              )
              .value;
  
  
          mensagem.textContent =
            "";
  
  
          botao.disabled =
            true;
  
          botao.textContent =
            "Entrando...";
  
  
          try {
  
            const resposta =
              await fetch(
                "/api/login",
                {
  
                  method:
                    "POST",
  
                  headers: {
  
                    "Content-Type":
                      "application/json"
  
                  },
  
                  body:
                    JSON.stringify({
                      usuario,
                      senha
                    })
  
                }
              );
  
  
            const resultado =
              await resposta.json();
  
  
            if (!resposta.ok) {
  
              throw new Error(
                resultado.erro ||
                "Não foi possível entrar."
              );
  
            }
  
  
            window.location.href =
              "/";
  
  
          } catch (erro) {
  
            mensagem.textContent =
              erro.message;
  
            mensagem.className =
              "login-message error";
  
  
          } finally {
  
            botao.disabled =
              false;
  
            botao.textContent =
              "Entrar";
  
          }
  
        }
      );
  
    }
  );