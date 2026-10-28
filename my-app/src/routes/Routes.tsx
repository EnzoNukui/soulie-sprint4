import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LayoutApp from "../components/LayoutApp/LayoutApp";
import AppSoulie from "./App";
import AcessoApp from "./AcessoApp";
import Comunidades from "./Comunidades";
import Contato from "./Contato";
import Error from "./Error";
import Faq from "./Faq";
import Home from "./Home";
import Integrantes from "./Integrantes";
import Sobre from "./Sobre";
import Solucao from "./Solucao";
import InicioApp from "./InicioApp";

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
        element: <Sobre />,
      },
      {
        path: "/solucao",
        element: <Solucao />,
      },
      {
        path: "/integrantes",
        element: <Integrantes />,
      },
      {
        path: "/integrantes/:rm",
        element: <Integrantes />,
      },
      {
        path: "/contato",
        element: <Contato />,
      },
      {
        path: "/faq",
        element: <Faq />,
      },
    ],
  },
  {
    path: "/app/acesso",
    element: <AcessoApp />,
    errorElement: <Error />,
  },
  {
    path: "/app",
    element: <LayoutApp />,
    errorElement: <Error />,
    children: [
      {
        path: "/app",
        element: <InicioApp />,
      },
      {
        path: "/app/missoes",
        element: <AppSoulie />,
      },
      {
        path: "/app/comunidades",
        element: <Comunidades />,
      },
    ],
  },
]);

export default router;
