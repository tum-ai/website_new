/**
 * The key the site matches organisations by when all it has is a name.
 * Free of imports, so the Sanity CLI step of
 * `pnpm sanity:migrate-org-references` can load it by a relative path.
 */

/**
 * Other spellings of one organisation, from letters and digits to the
 * canonical letters and digits: the old partner documents' names ("HRT"),
 * event co-hosts ("Amazon Web Services") and research titles ("Helmholtz
 * Zentrum"). The old partner "Helmholtz" is the Munich centre too.
 */
const aliases: Readonly<Record<string, string>> = {
  hrt: "hudsonrivertrading",
  mckinsey: "mckinseycompany",
  mckinseyandcompany: "mckinseycompany",
  entire: "entireio",
  amazonwebservices: "aws",
  bmwgroup: "bmw",
  internationalbusinessmachines: "ibm",
  advancedmicrodevices: "amd",
  helmholtz: "helmholtzmunich",
  helmholtzzentrum: "helmholtzmunich",
  helmholtzcentermunich: "helmholtzmunich",
};

/**
 * A company's letters and digits, lower-cased, with the aliases above: how
 * the site matches partners, organisations and their artwork by name ("HRT"
 * and "Hudson River Trading" are one company). An organisation matches a
 * name when the key of its name, short name or key equals the name's.
 */
export function getPartnerKey(name: string) {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return aliases[key] ?? key;
}
