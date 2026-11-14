
import { useState } from "react";
import { signinUser } from "../services/authService";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from;

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = await signinUser(email, password);

      // Save the JWT token in the browser
      localStorage.setItem("token", data.token);

      // Save the user's details in the browser
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect customer back to checkout after signing in
      if (
        data.user.role === "customer" &&
        redirectTo === "/checkout"
      ) {
        navigate("/checkout", { replace: true });
        return;
      }

      // Normal role-based navigation
      if (data.user.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (data.user.role === "vendor") {
        navigate("/vendor-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div
        className="card shadow border-0 p-4"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div className="card-body">
          <h1
            className="text-center fw-bold mb-2"
            style={{ color: "#e91e63" }}
          >
            nykaa
          </h1>

          <p className="text-center text-secondary mb-4">
            Welcome back! Sign in to continue
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-end mb-3">
              <Link
                to="/forget-password"
                className="text-decoration-none small"
                style={{ color: "#e91e63" }}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn w-100 text-white fw-semibold"
              style={{ backgroundColor: "#e91e63" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {message && (
            <div className="alert alert-info mt-3 mb-0" role="status">
              {message}
            </div>
          )}

          <p className="text-center mt-4 mb-0">
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#e91e63" }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signin;
