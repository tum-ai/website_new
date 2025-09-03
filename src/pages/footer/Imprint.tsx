import { cx } from "class-variance-authority";

export default function Imprint() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <img
          src="/assets/tu_cropped.jpg"
          alt="Hero background image"
          className="absolute h-full w-full object-cover transition-transform"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="relative container mx-auto flex min-h-[30vh] max-w-4xl flex-col justify-center p-8 text-white md:p-16">
          <div className="absolute top-1/2 left-0 h-32 w-1 -translate-y-1/2 bg-linear-to-b from-blue-500 to-purple-500 opacity-50" />
          <div className="space-y-6">
            <h1
              className={cx(
                "text-6xl font-medium tracking-tight md:text-7xl",
                "bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent",
                "animate-fade-in-up",
              )}
            >
              Impressum
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto p-6 bg-white">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Organisation
          </h2>
          <p className="text-gray-700 mb-4">
            TUM.ai e.V. Vereinsregisternummer: VR209059 <br />
            Arcistrasse 21, 80333 München <br />
            Vertreter: Paul Schneider, Ju-Shan Chao, Fiona Mokhtarzadeh, William
            Homburg, Hamze Al-Zamkan <br />
            Mail: contact@tum-ai.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Haftung für Inhalte
          </h2>
          <p className="text-gray-700 mb-4">
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen, die auf eine
            rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung
            oder Sperrung der Nutzung von Informationen nach den allgemeinen
            Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist
            jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
            Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
            Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Haftung für Links
          </h2>
          <p className="text-gray-700 mb-4">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
            fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
            der Seiten verantwortlich. Die verlinkten Seiten wurden zum
            Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
            Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht
            erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten
            Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung
            nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
            derartige Links umgehend entfernen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Urheberrecht
          </h2>
          <p className="text-gray-700 mb-4">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht. Die
            Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
            Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
            schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            Downloads und Kopien dieser Seite sind nur für den privaten, nicht
            kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser
            Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte
            Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
            gekennzeichnet. Sollten Sie trotzdem auf eine
            Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
            entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
            werden wir derartige Inhalte umgehend entfernen. Quelle: eRecht24
          </p>
        </section>
      </div>
    </>
  );
}
