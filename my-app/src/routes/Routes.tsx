import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Error from "./Error";
import Home from "./Home";

// Carrega cada página apenas quando a rota é acessada, reduzindo o bundle inicial.
const carregar = (importar: () => Promise<{ default: ComponentType }>) => async () => {
  const modulo = await importar();
  return { Component: modulo.default };
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/sobre",
        lazy: carregar(() => import("./Sobre")),
      },
      {
        path: "/solucao",
        lazy: carregar(() => import("./Solucao")),
      },
      {
        path: "/integrantes",
        lazy: carregar(() => import("./Integrantes")),
      },
      {
        path: "/integrantes/:rm",
        lazy: carregar(() => import("./Integrantes")),
      },
      {
        path: "/contato",
        lazy: carregar(() => import("./Contato")),
      },
      {
        path: "/faq",
        lazy: carregar(() => import("./Faq")),
      },
    ],
  },
  {
    path: "/app/acesso",
    lazy: carregar(() => import("./AcessoApp")),
    errorElement: <Error />,
  },
  {
    path: "/app/cadastro",
    lazy: carregar(() => import("./CadastroApp")),
    errorElement: <Error />,
  },
  {
    path: "/app",
    lazy: carregar(() => import("../components/LayoutApp/LayoutApp")),
    errorElement: <Error />,
    children: [
      {
        path: "/app",
        lazy: carregar(() => import("./InicioApp")),
      },
      {
        path: "/app/missoes",
        lazy: carregar(() => import("./App")),
      },
      {
        path: "/app/comunidades",
        lazy: carregar(() => import("./Comunidades")),
      },
      {
        path: "/app/comunidades/:id",
        lazy: carregar(() => import("./ComunidadeDetalhe")),
      },
    ],
  },
]);

export default router;
