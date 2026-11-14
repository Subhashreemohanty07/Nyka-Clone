
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  // Read JWT and user details saved during sign in
  const token = localStorage.getItem("token");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // 1. User is not signed in
  if (!token || !user) {
    return (
      <Navigate
        to="/signin"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 2. User does not have permission
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. User is allowed to access the page
  return children;
}

export default ProtectedRoute;
