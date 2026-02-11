import { Navigate } from "react-router-dom";
import useSessionStore from "../store/sessionStrore";

const PrivateRoute = ({ children }) => {
  const accessToken = useSessionStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
