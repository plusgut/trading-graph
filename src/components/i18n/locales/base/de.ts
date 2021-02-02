import type base from "./en";
const euroCurrencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const dateFormatter = new Intl.DateTimeFormat("de");

const result: typeof base = {
  currency: euroCurrencyFormatter.format,
  date: dateFormatter.format,
  valueInformation: (amount: number, date: Date) =>
    `Deine Aktien sind ${euroCurrencyFormatter.format(
      amount
    )}€ Wert, zum Zeitpunk ${dateFormatter.format(date)}}`,
  buyinInformation: (amount: number, date: Date) =>
    `Du hast Aktien im Wert von ${euroCurrencyFormatter.format(
      amount
    )}€ gekauft, zum Zeitpunkt ${dateFormatter.format(date)}`,
  noGist: "Bitte setze in die Url die gist-id als hash",
  gistError: "Gist konnte nicht geladen werden",
  invalidData: "Keine validaten Daten, bitte formatieren sie wie folgt",
  loading: "Laden...",
};

export default result;
