import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import Footer from "./components/Footer.tsx";
import { NewHeader } from "./components/NewHeader.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <NewHeader />
      <App />
      <Footer />
    </BrowserRouter>
  </StrictMode>
);
