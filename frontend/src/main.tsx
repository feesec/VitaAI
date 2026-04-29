import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Client as StyletronClient, Server as StyletronServer } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider, LightTheme } from "baseui";
import App from "./App.tsx";
import "./index.css";

const engine =
  typeof document !== "undefined"
    ? new StyletronClient()
    : new StyletronServer();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </BaseProvider>
    </StyletronProvider>
  </StrictMode>
);
