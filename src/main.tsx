import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import Footer from "./components/Footer.tsx";
import { Header } from "./components/Header.tsx";
import { TitleManager } from "./lib/utils.ts";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TitleManager />
      <Header />
      <App />
      <Footer />
    </BrowserRouter>
  </StrictMode>,
);
