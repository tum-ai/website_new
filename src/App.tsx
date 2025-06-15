import { Route, Routes } from "react-router-dom";
import Community from "./pages/headerPages/Community";
import Entrepreneurship from "./pages/headerPages/Entrepreneurship";
import Events from "./pages/headerPages/Events";
import Homepage from "./pages/Homepage";
import Partners from "./pages/headerPages/Partners";
import Projects from "./pages/headerPages/Projects";
import QandA from "./pages/headerPages/QandA";
import Research from "./pages/headerPages/Research";
import Imprint from "./pages/footer/Imprint";
import DataPrivacy from "./pages/footer/Privacy";

export default function Index() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/events" element={<Events />} />
      <Route path="/research" element={<Research />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/entrepreneur" element={<Entrepreneurship />} />
      <Route path="/community" element={<Community />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/qanda" element={<QandA />} />
      <Route path="/imprint" element={<Imprint />} />
      <Route path="/data-privacy" element={<DataPrivacy />} />

    </Routes>
  );
}
