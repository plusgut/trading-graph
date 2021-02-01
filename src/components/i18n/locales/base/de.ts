import type base from "./en";
const numberFormatter = new Intl.NumberFormat("de");
const dateFormatter = new Intl.DateTimeFormat("de");

const result: typeof base = {
  number: numberFormatter.format,
  date: dateFormatter.format,
  noGist: "Bitte setze in die Url die gist-id als hash",
  gistError: "Gist konnte nicht geladen werden",
  invalidData: "Keine validaten Daten, bitte formatieren sie wie folgt",
  loading: "Laden...",
};

export default result;
