import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "./styles/app.css";
import { StoreProvider } from "./lib/store";
import { TimerProvider } from "./lib/timer";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <TimerProvider>
        <App />
      </TimerProvider>
    </StoreProvider>
  </StrictMode>,
);
