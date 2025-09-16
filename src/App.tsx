import { Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { routes } from "./data/routes";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {routes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Routes>
    </>
  );
}
