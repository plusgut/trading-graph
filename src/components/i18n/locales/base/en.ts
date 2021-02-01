const numberFormatter = new Intl.NumberFormat("en");
const dateFormatter = new Intl.DateTimeFormat("en");

export default {
  number: numberFormatter.format,
  date: dateFormatter.format,
  noGist: "Please put in an url with your gists id as a hash",
  gistError: "Could not load gist",
  invalidData: "No Valid data, please format each row like this",
  loading: "Loading...",
};
