const euroCurrencyFormatter = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "EUR",
});
const dateFormatter = new Intl.DateTimeFormat("en");

export default {
  currency: euroCurrencyFormatter.format,
  date: dateFormatter.format,
  valueInformation: (amount: number, date: Date) =>
    `Your stocks are worth ${euroCurrencyFormatter.format(
      amount
    )} at the ${dateFormatter.format(date)}}`,
  buyinInformation: (amount: number, date: Date) =>
    `Your bought stock for ${euroCurrencyFormatter.format(
      amount
    )} at the ${dateFormatter.format(date)}}`,
  noGist: "Please put in an url with your gists id as a hash",
  gistError: "Could not load gist",
  invalidData: "No Valid data, please format each row like this",
  loading: "Loading...",
};
