import "./css/style.css";
import "./img/favicon.png";
import renderStart from "./components/start";
import { renderGithubIcon } from "./components/utility";

if (module.hot) {
  module.hot.accept();
}

renderStart();
renderGithubIcon();
