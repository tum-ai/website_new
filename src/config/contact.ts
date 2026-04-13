export const registeredOfficeStreetAddress = "Arcisstr. 21";

export const registeredOfficeAddressLine = `${registeredOfficeStreetAddress}, 80333 München`;

export const registeredOfficePostalAddress = {
  streetAddress: registeredOfficeStreetAddress,
  postalCode: "80333",
  addressLocality: "Munich",
  addressCountry: "Germany",
} as const;
