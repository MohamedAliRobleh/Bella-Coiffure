import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'Lato', sans-serif",
              background: "#2C1810",
              color: "#FDF6EE",
              borderRadius: "12px",
              border: "1px solid rgba(212,168,83,.3)",
            },
            success: { iconTheme: { primary: "#D4A853", secondary: "#2C1810" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
