import Homepage from "@/pages/Homepage";
import Apply from "@/pages/apply/Apply";
import Imprint from "@/pages/footer/Imprint";
import DataPrivacy from "@/pages/footer/Privacy";
import Community from "@/pages/headerPages/Community";
import Events from "@/pages/headerPages/Events";
import Partners from "@/pages/headerPages/Partners";
import Projects from "@/pages/headerPages/Projects";
import QandA from "@/pages/headerPages/QandA";
import Research from "@/pages/headerPages/Research";
import ELab from "@/pages/headerPages/e-lab/ELab";

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
];
