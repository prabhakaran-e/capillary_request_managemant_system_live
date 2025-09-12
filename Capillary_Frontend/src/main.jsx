import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

// const clientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID_TEST;
const clientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;

console.log("clendtid",clientId)
console.log(import.meta.env);


ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientId}>
    <App />
  </GoogleOAuthProvider>
);
