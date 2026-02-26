import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isJwtToken } from "./authToken";

export default function Protect({ children }) {
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = isJwtToken(token);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}
