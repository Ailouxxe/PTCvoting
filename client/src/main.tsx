import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import firebase to ensure it's initialized
import "./lib/firebase";

createRoot(document.getElementById("root")!).render(<App />);
