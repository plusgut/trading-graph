import plusnew from "@plusnew/core";
import driver from "@plusnew/driver-dom";
import i18n from "components/i18n";
import App from "./App";

plusnew.render(
  <i18n.Provider language={navigator.language.slice(0, 2)}>
    <App />
  </i18n.Provider>,
  {
    driver: driver(document.body),
  }
);
