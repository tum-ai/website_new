import { Container, PageHero, Prose, Section } from "@/components/ds";
import {
  AddressCard,
  LegalNav,
  LegalSection,
  LegalSubsection,
  legalLinkClass,
} from "./legal-document";
import { LegalToc, type LegalTocItem } from "./legal-toc";

/** Section headings, verbatim; also feed the table of contents. */
const sections = [
  {
    id: "verantwortlicher",
    number: "1.",
    title: "Name und Kontaktdaten des für die Verarbeitung Verantwortlichen",
  },
  {
    id: "personenbezogene-daten",
    number: "2.",
    title:
      "Erhebung und Speicherung personenbezogener Daten sowie Art und Zweck deren Verwendung",
  },
  {
    id: "anonymisierte-daten",
    number: "3.",
    title:
      "Erhebung und Speicherung anonymisierter Daten sowie Art und Zweck deren Verwendung",
  },
  { id: "weitergabe-von-daten", number: "4.", title: "Weitergabe von Daten" },
  { id: "drittanbieter", number: "5.", title: "Drittanbieter" },
  { id: "cookies", number: "6.", title: "Cookies" },
  { id: "betroffenenrechte", number: "7.", title: "Betroffenenrechte" },
  { id: "widerspruchsrecht", number: "8.", title: "Widerspruchsrecht" },
  { id: "datensicherheit", number: "9.", title: "Datensicherheit" },
  {
    id: "aktualitaet",
    number: "10.",
    title: "Aktualität und Änderung dieser Datenschutzerklärung",
  },
] satisfies LegalTocItem[];

export function PrivacyPage() {
  const [
    verantwortlicher,
    personenbezogen,
    anonymisiert,
    weitergabe,
    drittanbieter,
    cookies,
    betroffenenrechte,
    widerspruch,
    datensicherheit,
    aktualitaet,
  ] = sections;

  return (
    <main lang="de">
      <PageHero
        size="md"
        title="Datenschutzerklärung TUM.ai e.V."
        actions={<LegalNav current="/data-privacy" />}
        // "Datenschutzerklärung" is ~9.7em wide. SplitWords renders each word
        // as an inline-block, so hyphenating it strands a lone syllable
        // ("rung") on phones; instead the size eases down just enough for the
        // word to fit the column (plain display-lg from ~430px up).
        // `hyphens-auto` stays only as an overflow guard.
        className="[&_h1]:hyphens-auto [&_h1]:text-[length:min(var(--text-display-lg),calc((100vw-2*var(--gutter))/10))]"
      />

      <Section as="div" tone="paper" spacing="lg">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,16.5rem)_minmax(0,46rem)] lg:gap-[clamp(3.5rem,7vw,7rem)]">
          <LegalToc items={sections} label="Inhalt" />

          <Prose className="[overflow-wrap:break-word]">
            <LegalSection {...verantwortlicher}>
              <p>
                Diese Datenschutz-Information gilt für die Datenverarbeitung
                durch die
              </p>
              <AddressCard title="TUM e.V." className="sm:max-w-sm">
                <p>Arcistrasse 21</p>
                <p>80333 München</p>
                <p>
                  E-Mail:{" "}
                  <a
                    href="mailto:invoice@tum-ai.com"
                    className={legalLinkClass}
                  >
                    invoice@tum-ai.com
                  </a>
                </p>
              </AddressCard>
            </LegalSection>

            <LegalSection {...personenbezogen}>
              <LegalSubsection letter="a)" title="Beim Besuch der Website">
                <p>
                  Beim Aufrufen der Website{" "}
                  <a href="https://www.tum-ai.com/">https://www.tum-ai.com/</a>{" "}
                  (kurz: "TUM.ai Website") werden durch den auf Ihrem Endgerät
                  zum Einsatz kommenden Browser automatisch Informationen an den
                  Server unserer Website gesendet. Diese Informationen werden
                  temporär in einem sog. Logfile gespeichert. Folgende
                  Informationen werden dabei ohne Ihr Zutun erfasst und bis zur
                  automatisierten Löschung gespeichert:
                </p>
                <ul>
                  <li>IP-Adresse des anfragenden Rechners,</li>
                  <li>Geographische und technische Daten des Rechners,</li>
                  <li>Datum und Uhrzeit des Zugriffs,</li>
                  <li>Name und URL der abgerufenen Datei,</li>
                  <li>Referrer-URL,</li>
                  <li>
                    Verwendeter Browser und ggf. das Betriebssystem Ihres
                    Rechners sowie der Name Ihres Access-Providers,
                  </li>
                  <li>Daten über das Userverhalten,</li>
                  <li>Benutzerflussdaten.</li>
                </ul>
                <p>
                  Die genannten Daten werden durch uns zu folgenden Zwecken
                  verarbeitet:
                </p>
                <ul>
                  <li>
                    Gewährleistung eines reibungslosen Verbindungsaufbaus der
                    Website,
                  </li>
                  <li>
                    Gewährleistung einer komfortablen Nutzung unserer Website,
                  </li>
                  <li>Auswertung der Systemsicherheit und -stabilität sowie</li>
                  <li>zu weiteren administrativen Zwecken.</li>
                </ul>
                <p>
                  Die Rechtsgrundlage für die Datenverarbeitung ist Art. 6 Abs.
                  1 S. 1 f) DSGVO. Unser berechtigtes Interesse folgt aus oben
                  aufgelisteten Zwecken zur Datenerhebung. In keinem Fall
                  verwenden wir die erhobenen Daten zu dem Zweck, Rückschlüsse
                  auf Ihre Person zu ziehen.
                </p>
              </LegalSubsection>

              <LegalSubsection
                letter="b)"
                title="Bei Nutzung unseres Bewerbungsformulars"
              >
                <p>
                  Für die Bewerbung auf eine Mitgliedschaft ist das Ausfüllen
                  eines Kontaktformulars notwendig,{" "}
                  <a href="https://www.tum-ai.com/apply">
                    https://www.tum-ai.com/apply
                  </a>
                  .
                </p>
                <p>
                  Dabei ist die Angabe Ihres Namens und einer gültigen
                  E-Mail-Adresse erforderlich, damit wir wissen, von wem die
                  Anfrage stammt und um diese beantworten zu können. Weitere
                  Angaben können freiwillig getätigt werden.
                </p>
                <p>
                  Die Datenverarbeitung zum Zwecke der Kontaktaufnahme mit uns
                  erfolgt nach Art. 6 Abs. 1 S. 1 a) DSGVO auf Grundlage Ihrer
                  freiwillig erteilten Einwilligung, nach Art. 6 Abs. 1 S. 1 b)
                  DSGVO zur Erfüllung eines Vertrags oder zur Durchführung
                  vorvertraglicher Maßnahmen und nach Art. 6 Abs. 1 S. 1 f)
                  DSGVO auch zur Wahrung unserer berechtigten Interessen sowie
                  derer Dritter.
                </p>
                <p>
                  Die für die Benutzung des Kontaktformulars von uns erhobenen
                  personenbezogenen Daten werden nach Erledigung der von Ihnen
                  gestellten Anfrage gelöscht.
                </p>
              </LegalSubsection>

              <LegalSubsection
                letter="c)"
                title="Bei Nutzung unseres Newsletters"
              >
                <p>
                  Für die fortlaufende Information über unseren Verein, dessen
                  Aktivität sowie seine verfolgten Ziele besteht die
                  Möglichkeit, sich bei einem von uns eingerichteten und auf
                  unseren Servern betriebenen Newsletter anzumelden.
                </p>
                <p>
                  Dabei ist die Angabe einer gültigen E-Mail-Adresse
                  erforderlich, um die Zustellung zu gewährleisten.
                </p>
                <p>
                  Die Datenverarbeitung zum Zwecke Ihrer Information erfolgt
                  nach Art. 6 Abs. 1 S. 1 a) DSGVO auf Grundlage Ihrer
                  freiwillig erteilten Einwilligung.
                </p>
              </LegalSubsection>

              <LegalSubsection
                letter="d)"
                title="Bei Anmeldung zu Veranstaltungen und Projekten"
              >
                <p>
                  Für die Anmeldung zu Veranstaltungen oder Projekten unseres
                  Vereins stellen wir ein Antragsformular zur Verfügung.
                  Verlangt wird die Angabe Ihres Namens, Ihres Wohnortes, Ihres
                  Geburtstages, Ihres Geschlechts, Ihrer Mailadresse, Ihrer
                  Nationalität, Ihres akademischen Hintergrundes und z.T. auch
                  das Hochladen Ihres Lebenslaufes. Weitere Angaben können
                  freiwillig getätigt werden.
                </p>
                <p>
                  Diese Angaben sind erforderlich, damit wir unsere
                  Veranstaltungen angemessen vorbereiten und verlässlich sowie
                  interessengerecht durchführen können. Wir verwenden die
                  angegebenen Daten nur im Zusammenhang mit der Vorbereitung und
                  Durchführung der jeweiligen Veranstaltung.
                </p>
                <p>
                  Die Datenverarbeitung zum Zwecke der Anmeldung zu
                  Veranstaltungen bei uns erfolgt nach Art. 6 Abs. 1 S. 1 a)
                  DSGVO auf Grundlage Ihrer freiwillig erteilten Einwilligung,
                  nach Art. 6 Abs. 1 S. 1 b) DSGVO zur Erfüllung eines Vertrags
                  oder zur Durchführung vorvertraglicher Maßnahmen und nach Art.
                  6 Abs. 1 S. 1 f) DSGVO auch zur Wahrung unserer berechtigten
                  Interessen sowie derer Dritter.
                </p>
              </LegalSubsection>
            </LegalSection>

            <LegalSection {...anonymisiert}>
              <p>
                Wir verwenden Google Analytics zur Analyse und statistischen
                Auswertung der Nutzung der Website. Hierzu werden eingesetzt.
                Die dadurch erhaltenen Informationen über die Websitenutzung
                werden ausschließlich an unsere Server übertragen und in
                pseudonymen Nutzungsprofilen zusammengefasst. Die Daten
                verwenden wir zur Auswertung der Nutzung der Website. Eine
                Weitergabe der erfassten Daten an Dritte erfolgt nicht.
              </p>
              <p>
                Die IP-Adressen werden anonymisiert (IPMasking), sodass eine
                Zuordnung zu einzelnen Nutzern nicht möglich ist.
              </p>
              <p>
                Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 S.
                1 lit. f) DSGVO. Wir verfolgen damit unser berechtigtes
                Interesse an der Optimierung unserer Webseite für unsere
                Außendarstellung.
              </p>
            </LegalSection>

            <LegalSection {...weitergabe}>
              <p>
                Eine Übermittlung Ihrer persönlichen Daten an Dritte zu anderen
                als den im Folgenden aufgeführten Zwecken findet nicht statt.
              </p>
              <p>
                Wir geben Ihre persönlichen Daten nur an Dritte weiter, wenn:
              </p>
              <ul>
                <li>
                  Sie nach Art. 6 Abs. 1 S. 1 a) DSGVO ihre ausdrückliche
                  Einwilligung dazu erteilt haben,
                </li>
                <li>
                  die Weitergabe nach Art. 6 Abs. 1 S. 1 f) DSGVO zur
                  Geltendmachung, Ausübung oder Verteidigung von
                  Rechtsansprüchen erforderlich ist und kein Grund zur Annahme
                  besteht, dass Sie ein überwiegendes schutzwürdiges Interesse
                  an der Nichtweitergabe Ihrer Daten haben,
                </li>
                <li>
                  für den Fall, dass für die Weitergabe nach Art. 6 Abs. 1 S. 1
                  c) DSGVO eine gesetzliche Verpflichtung besteht, sowie
                </li>
                <li>
                  dies gesetzlich zulässig und nach Art. 6 Abs. 1 S. 1 b) DSGVO
                  für die Abwicklung von Vertragsverhältnissen mit Ihnen
                  erforderlich ist.
                </li>
              </ul>
            </LegalSection>

            <LegalSection {...drittanbieter}>
              <LegalSubsection letter="a)" title="Social Media Buttons">
                <p>
                  Auf unserer Website befinden sich Schaltflächen mit Links zu
                  unseren Social Media Seiten. Diese übermitteln Ihre Daten
                  nicht schon beim Besuch unserer Website, sondern erst mit
                  Betätigung der entsprechenden Schaltfläche ggf. an das
                  jeweilige soziale Netzwerk.
                </p>
                <p>
                  Wir weisen Sie darauf hin, dass hierbei auch Nutzungsdaten an
                  einen Server in einem Drittland übermittelt werden und somit
                  außerhalb der Europäischen Union verarbeitet werden können.
                  Sofern Sie auf dem verwendeten Endgerät in Ihrem persönlichen
                  Benutzerkonto des jeweiligen Netzwerks eingeloggt sind, kann
                  der Netzwerkbetreiber den Besuch auch Ihrem Konto zuordnen.
                </p>
                <p>
                  Die erhobenen personenbezogenen Daten, ihre Verarbeitung sowie
                  die Zwecke der Verarbeitung und Ihre Betroffenenrechte können
                  Sie den vom jeweiligen Betreiber bereitgestellten
                  Informationen entnehmen:
                </p>
                <div className="not-prose mt-6 grid gap-4 md:grid-cols-2">
                  <AddressCard title="Für Instagram:" className="mt-0">
                    <p>Meta Platforms Ireland Limited</p>
                    <p>4 Grand Canal Square</p>
                    <p>Grand Canal Harbour, Dublin 2</p>
                    <p>Irland</p>
                    <p className="mt-3">
                      <a
                        href="https://privacycenter.instagram.com/policy"
                        className={legalLinkClass}
                      >
                        https://privacycenter.instagram.com/policy
                      </a>
                    </p>
                  </AddressCard>
                  <AddressCard title="Für LinkedIn:" className="mt-0">
                    <p>
                      LinkedIn Ireland Unlimited Company, Attn: Legal Dept.
                      (Privacy Policy and User Agreement),
                    </p>
                    <p>Wilton Plaza</p>
                    <p>Wilton Place, Dublin 2</p>
                    <p>Irland</p>
                    <p className="mt-3">
                      <a
                        href="https://de.linkedin.com/legal/privacy-policy"
                        className={legalLinkClass}
                      >
                        https://de.linkedin.com/legal/privacy-policy
                      </a>
                    </p>
                  </AddressCard>
                </div>
              </LegalSubsection>

              <LegalSubsection letter="b)" title="Für Mitglieder">
                <p>
                  Die interne Organisation und Kommunikation erfolgt über die
                  Salesforce Applikation Slack Technologies LLC („Slack"). Diese
                  erfüllt europäische Datenschutzstandards. Die Daten werden
                  ausschließlich in den in Europa befindlichen Rechenzentren von
                  Salesforce gespeichert und die Daten werden nicht für
                  Werbezwecke verwendet.
                </p>
                <p>
                  Wir weisen darauf hin, dass die US-Regierung aufgrund des US
                  Cloud Act grundsätzlich von Salesforce Zugriff auf Daten
                  verlangen kann, die auf Salesforce Servern abgelegt sind.
                </p>
                <p>
                  Das Ausfüllen von Online-Formularen erfolgt über den
                  belgischen Anbieter Tally B.V. („Tally Forms) und unterliegt
                  der Europäischen Datenschutz-Grundverordnung (DSGVO).
                </p>
                <p>
                  Mit Ausfüllen des Mitgliedsantrags willigen Sie gem. Art. 6
                  Abs. 1 S. 1 a) DSGVO in die Speicherung Ihrer Daten durch
                  Salesforce und Tally ein. Die Einwilligung kann jederzeit
                  widerrufen werden, wobei dann eine reibungslose Teilnahme am
                  Vereinsleben nicht gewährleistet werden kann.
                </p>
              </LegalSubsection>

              <LegalSubsection letter="c)" title="Für Nichtmitglieder">
                <p>
                  Das Ausfüllen von Online-Formularen erfolgt über den
                  belgischen Anbieter Tally B.V. („Tally Forms) und unterliegt
                  der Europäischen Datenschutz-Grundverordnung (DSGVO).
                  Grundlage der Datenverarbeitung ist einerseits Ihre
                  konkludente Einwilligung durch das Ausfüllen des Formulars
                  gem. Art. 6 Abs. 1 S. 1 a) DSGVO und Art. 6 Abs. 1 S. 1 f)
                  DSGVO.
                </p>
              </LegalSubsection>
            </LegalSection>

            <LegalSection {...cookies}>
              <p>
                Wir verwenden auf einigen unserer Internetseiten ggf. sog.
                Cookies, u.a. um Ihnen websitespezifische Leistungen anbieten zu
                können, Sie bei einem wiederholten Besuch auf unserer Website
                wiedererkennen zu können, und/oder um unser Angebot an Ihre
                persönlichen Vorlieben anpassen zu können.
              </p>
              <p>
                Cookies sind kleine Textdateien, die auf dem Computer eines
                Besuchers gespeichert werden und Daten zum jeweiligen Nutzer
                enthalten, um diesem Zugang zu verschiedenen Funktionen zu
                ermöglichen. Auf unserer Website werden sowohl Session Cookies
                als auch dauerhafte Cookies verwendet. Ein Session Cookie wird
                vorübergehend auf dem von Ihnen genutzten Computer gespeichert,
                während Sie durch die Website navigieren. Ein Session Cookie
                wird gelöscht, sobald Sie Ihren Internet-Browser schließen oder
                sobald nach einer bestimmten Zeit Ihre Session abgelaufen ist.
                Ein dauerhaftes Cookie bleibt auf Ihrem Computer bis es gelöscht
                wird. Durch die Speicherung eines Cookies ist gewährleistet,
                dass Sie nicht bei jedem Besuch Ihre persönlichen Einstellungen
                und Vorlieben wiederholt eingeben müssen. Das erspart Ihnen Zeit
                und macht die Nutzung unserer Website komfortabler für Sie.
              </p>
              <p>
                Wir arbeiten unter Umständen bei einigen unserer Internetseiten
                mit Dritten zusammen, und daher werden bei Ihrem Besuch einer
                solchen Internetseite ggf. auch Cookies von Partnerunternehmen
                auf Ihrer Festplatte gespeichert (Cookies von Drittanbietern).
                Wir informieren Sie nachfolgend über den Einsatz derartiger
                Cookies und den Umfang der jeweils erhobenen Daten.
              </p>
              <p>
                Sie können dauerhaft installierte Cookies über die Einstellungen
                Ihres Browsers löschen. Die meisten Browser akzeptieren Cookies
                automatisch – falls Sie also den Einsatz von Cookies
                unterdrücken möchten, müssen Sie möglicherweise Cookies aktiv
                löschen oder blockieren oder die Speicherung der Cookies durch
                eine Einstellung Ihrer Browser-Software verhindern. Beachten Sie
                jedoch, dass Sie, wenn Sie die Verwendung von Cookies ablehnen,
                unsere Website zwar weiter besuchen können, einige Funktionen
                jedoch in ihrer Arbeitsweise beeinträchtigt sein könnten.
              </p>
              <p>
                Wir verwenden notwendige Cookies, die erforderlich sind, um die
                Erbringung der von uns geschuldeten Leistungen zu ermöglichen
                oder, um die Funktionalität unserer Dienste zu gewährleisten.
                Die diesbezügliche Datenverarbeitung erfolgt sodann auf
                Grundlage des Art. 6 Abs. 1 S. 1 lit. b DSGVO, der die
                Verarbeitung von Daten zur Erfüllung eines Vertrags oder
                vorvertraglicher Maßnahmen gestattet oder nach Art. 6 Abs. 1 S.
                1 lit. f DSGVO, der die Datenbearbeitung zur Wahrung der
                berechtigten Interessen des Verantwortlichen erlaubt, sofern
                nicht die Interessen oder die Grundrechte und Grundfreiheiten
                der betroffenen Person das Interesse des Verantwortlichen an der
                Datenverarbeitung überwiegen. Unser Interesse liegt dann in der
                Gewährleistung der Funktionalität unserer Website.
              </p>
              <p>
                Für die Verwendung anderer, nicht erforderlicher Cookies holen
                wir gegebenenfalls Ihre Zustimmung ein. Die Datenverarbeitung
                erfolgt dann auf der Grundlage Ihrer Einwilligung gemäß Art. 6
                Abs. 1 S. 1 lit. a DSGVO. Sie können Ihre Einwilligung jederzeit
                widerrufen. Die Rechtmäßigkeit der bereits durchgeführten
                Datenverarbeitungen bleibt von dem Widerruf unberührt.
              </p>
            </LegalSection>

            <LegalSection {...betroffenenrechte}>
              <p>Sie haben das Recht:</p>
              <ul>
                <li>
                  gemäß Art. 15 DSGVO Auskunft über Ihre von uns verarbeiteten
                  personenbezogenen Daten zu verlangen. Insbesondere können Sie
                  Auskunft über die Verarbeitungszwecke, die Kategorie der
                  personenbezogenen Daten, die Kategorien von Empfängern,
                  gegenüber denen Ihre Daten offengelegt wurden oder werden, die
                  geplante Speicherdauer, das Bestehen eines Rechts auf
                  Berichtigung, Löschung, Einschränkung der Verarbeitung oder
                  Widerspruch, das Bestehen eines Beschwerderechts, die Herkunft
                  ihrer Daten, sofern diese nicht bei uns erhoben wurden, sowie
                  über das Bestehen einer automatisierten Entscheidungsfindung
                  einschließlich Profiling und ggf. aussagekräftigen
                  Informationen zu deren Einzelheiten verlangen;
                </li>
                <li>
                  gemäß Art. 16 DSGVO unverzüglich die Berichtigung unrichtiger
                  oder Vervollständigung Ihrer bei uns gespeicherten
                  personenbezogenen Daten zu verlangen;
                </li>
                <li>
                  gemäß Art. 17 DSGVO die Löschung Ihrer bei uns gespeicherten
                  personenbezogenen Daten zu verlangen, soweit nicht die
                  Verarbeitung zur Ausübung des Rechts auf freie
                  Meinungsäußerung und Information, zur Erfüllung einer
                  rechtlichen Verpflichtung, aus Gründen des öffentlichen
                  Interesses oder zur Geltendmachung, Ausübung oder Verteidigung
                  von Rechtsansprüchen erforderlich ist;
                </li>
                <li>
                  gemäß Art. 18 DSGVO die Einschränkung der Verarbeitung Ihrer
                  personenbezogenen Daten zu verlangen, soweit die Richtigkeit
                  der Daten von Ihnen bestritten wird, die Verarbeitung
                  unrechtmäßig ist, Sie aber deren Löschung ablehnen und wir die
                  Daten nicht mehr benötigen, Sie jedoch diese zur
                  Geltendmachung, Ausübung oder Verteidigung von
                  Rechtsansprüchen benötigen oder Sie gemäß Art. 21 DSGVO
                  Widerspruch gegen die Verarbeitung eingelegt haben;
                </li>
                <li>
                  gemäß Art. 20 DSGVO Ihre personenbezogenen Daten, die Sie uns
                  bereitgestellt haben, in einem strukturierten, gängigen und
                  maschinenlesebaren Format zu erhalten oder die Übermittlung an
                  einen anderen Verantwortlichen zu verlangen;
                </li>
                <li>
                  gemäß Art. 7 Abs. 3 DSGVO Ihre einmal erteilte Einwilligung
                  jederzeit gegenüber uns zu widerrufen. Dies hat zur Folge,
                  dass wir die Datenverarbeitung, die auf dieser Einwilligung
                  beruhte, für die Zukunft nicht mehr fortführen dürfen und
                </li>
                <li>
                  gemäß Art. 77 DSGVO sich bei einer Aufsichtsbehörde zu
                  beschweren. In der Regel können Sie sich hierfür an die
                  Aufsichtsbehörde Ihres üblichen Aufenthaltsortes oder
                  Arbeitsplatzes oder unseres Vereinssitzes wenden.
                </li>
              </ul>
            </LegalSection>

            <LegalSection {...widerspruch}>
              <p>
                Sofern Ihre personenbezogenen Daten auf Grundlage von
                berechtigten Interessen gemäß Art. 6 Abs. 1 S. 1 f) DSGVO
                verarbeitet werden, haben Sie das Recht, gemäß Art. 21 DSGVO
                Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten
                einzulegen, soweit dafür Gründe vorliegen, die sich aus Ihrer
                besonderen Situation ergeben oder sich der Widerspruch gegen
                Direktwerbung richtet. Im letzteren Fall haben Sie ein
                generelles Widerspruchsrecht, das ohne Angabe einer besonderen
                Situation von uns umgesetzt wird.
              </p>
              <p>
                Möchten Sie von Ihrem Widerrufs- oder Widerspruchsrecht Gebrauch
                machen, genügt eine E-Mail an{" "}
                <a href="mailto:invoice@tum-ai.com">invoice@tum-ai.com</a>
              </p>
            </LegalSection>

            <LegalSection {...datensicherheit}>
              <p>
                Wir verwenden innerhalb des Website-Besuchs das verbreitete
                SSL-Verfahren (Secure Socket Layer) in Verbindung mit der
                jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser
                unterstützt wird. In der Regel handelt es sich dabei um eine 256
                Bit Verschlüsselung. Falls Ihr Browser keine 256 Bit
                Verschlüsselung unterstützt, greifen wir stattdessen auf 128 Bit
                v3 Technologie zurück. Ob eine einzelne Seite unseres
                Internetauftritts verschlüsselt übertragen wird, erkennen Sie an
                der geschlossenen Darstellung des Schüssel- beziehungsweise
                Schloss-Symbols in der Statusleiste Ihres Browsers.
              </p>
              <p>
                Wir bedienen uns im Übrigen geeigneter technischer und
                organisatorischer Sicherheitsmaßnahmen, um Ihre Daten gegen
                zufällige oder vorsätzliche Manipulationen, teilweisen oder
                vollständigen Verlust, Zerstörung oder gegen den unbefugten
                Zugriff Dritter zu schützen. Unsere Sicherheitsmaßnahmen werden
                entsprechend der technologischen Entwicklung fortlaufend
                verbessert.
              </p>
            </LegalSection>

            <LegalSection {...aktualitaet}>
              <p>
                Diese Datenschutzerklärung ist aktuell gültig und hat den Stand
                August 2024.
              </p>
              <p>
                Durch die Weiterentwicklung unserer Website und Angebote darüber
                oder aufgrund geänderter gesetzlicher beziehungsweise
                behördlicher Vorgaben kann es notwendig werden, diese
                Datenschutzerklärung zu ändern. Die jeweils aktuelle
                Datenschutzerklärung kann jederzeit auf unserer Website unter{" "}
                <a href="https://www.tum-ai.com/data-privacy">
                  https://www.tum-ai.com/data-privacy
                </a>{" "}
                von Ihnen abgerufen und ausgedruckt werden.
              </p>
            </LegalSection>
          </Prose>
        </Container>
      </Section>
    </main>
  );
}
