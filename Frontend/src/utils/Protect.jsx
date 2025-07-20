import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Protect({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.token);

  if (isAuthenticated === null) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}
