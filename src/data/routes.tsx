import Homepage from "@/views/Homepage";
import Apply from "@/views/apply/Apply";
import Disclaimer from "@/views/footer/Disclaimer";
import Imprint from "@/views/footer/Imprint";
import DataPrivacy from "@/views/footer/Privacy";
import Community from "@/views/headerPages/Community";
import Events from "@/views/headerPages/Events";
import Partners from "@/views/headerPages/Partners";
import Projects from "@/views/headerPages/Projects";
import QandA from "@/views/headerPages/QandA";
import Research from "@/views/headerPages/Research";
import ELab from "@/views/headerPages/e-lab/ELab";

export const routes = [
  { path: "/", element: <Homepage />, title: "Home" },
  { path: "/events", element: <Events />, title: "Events" },
  { path: "/research", element: <Research />, title: "Research" },
  { path: "/projects", element: <Projects />, title: "Projects" },
  { path: "/e-lab", element: <ELab />, title: "E-Lab" },
  { path: "/community", element: <Community />, title: "Community" },
  { path: "/partners", element: <Partners />, title: "Partners" },
  { path: "/qanda", element: <QandA />, title: "Q&A" },
  { path: "/imprint", element: <Imprint />, title: "Imprint" },
  { path: "/data-privacy", element: <DataPrivacy />, title: "Data Privacy" },
  { path: "/apply", element: <Apply />, title: "Apply" },
  { path: "/disclaimer", element: <Disclaimer />, title: "Apply" },
];
