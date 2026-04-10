import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/playfair-display/wght.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
