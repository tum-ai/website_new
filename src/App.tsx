import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Apply from "./pages/apply/Apply";
import Berlin from "./pages/apply/Berlin";
import Munich from "./pages/apply/Munich";
import Imprint from "./pages/footer/Imprint";
import DataPrivacy from "./pages/footer/Privacy";
import Community from "./pages/headerPages/Community";
import Entrepreneurship from "./pages/headerPages/Entrepreneurship";
import Events from "./pages/headerPages/Events";
import Partners from "./pages/headerPages/Partners";
import Projects from "./pages/headerPages/Projects";
import QandA from "./pages/headerPages/QandA";
import Research from "./pages/headerPages/Research";

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
      <Route path="/apply" element={<Apply />} />
      <Route path="/apply/munich" element={<Munich />} />
      <Route path="/apply/berlin" element={<Berlin />} />
    </Routes>
  );
}
