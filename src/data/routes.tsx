import Community from "@/pages/Community";
import Events from "@/pages/Events";
import Homepage from "@/pages/Homepage";
import Partners from "@/pages/Partners";
import Projects from "@/pages/Projects";
import QandA from "@/pages/QandA";
import Research from "@/pages/Research";
import Apply from "@/pages/apply/Apply";
import ELab from "@/pages/e-lab/ELab";
import Disclaimer from "@/pages/footer/Disclaimer";
import Imprint from "@/pages/footer/Imprint";
import DataPrivacy from "@/pages/footer/Privacy";

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
