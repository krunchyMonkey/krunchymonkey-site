import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { PixelStudy } from "./features/pixel-study/PixelStudy";
import "./styles/tokens.css";
import "./features/pixel-study/pixel-theme.css";

const root = document.getElementById("root");
const pixelStudyEnabled = new URLSearchParams(window.location.search).get("preview") === "8bitcn";

if (!root) {
  throw new Error("KrunchOS root element is missing.");
}

createRoot(root).render(
  <React.StrictMode>{pixelStudyEnabled ? <PixelStudy /> : <App />}</React.StrictMode>,
);
