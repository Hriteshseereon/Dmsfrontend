import React from "react";
import ReactDOM from "react-dom/client";
// Must come before anything that can call message.* / Modal.confirm (static antd helpers render nothing on React 19 otherwise)
import "./utils/antdReact19Compat";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      cacheTime: 1000 * 60 * 10,       // 10 minutes
      retry: 1,                        // retry failed requests once
      refetchOnWindowFocus: false,     // disable refetch on tab focus
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,                        // do not retry mutations
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Global Auth Context */}
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
