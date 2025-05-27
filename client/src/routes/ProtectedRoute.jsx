import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken"); //checks login

  if (!token) {
    return <Navigate to="/login" replace />; // if not logged in -> redirect to login
  }

  return children; // show protected component (Dashboard)
}

export default ProtectedRoute;
