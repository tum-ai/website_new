import { Route, Routes } from "react-router-dom";
import Community from "./pages/Community";
import Entrepreneurship from "./pages/Entrepreneurship";
import Events from "./pages/Events";
import Homepage from "./pages/Homepage";
import Partners from "./pages/Partners";
import Projects from "./pages/Projects";
import QandA from "./pages/QandA";
import Research from "./pages/Research";

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
    </Routes>
  );
}
