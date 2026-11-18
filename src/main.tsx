import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { I18n } from "aws-amplify/utils";
import { translations } from "@aws-amplify/ui-react";
import outputs from "../amplify_outputs.json";
import App from "./App.tsx";
import "@aws-amplify/ui-react/styles.css";
import "./index.css";

Amplify.configure(outputs);

I18n.putVocabularies(translations);
I18n.setLanguage("es");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
