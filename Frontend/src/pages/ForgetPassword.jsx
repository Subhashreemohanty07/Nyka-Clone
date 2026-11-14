
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage(data.message);
      setEmail("");

    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
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

          <h4 className="text-center mb-2">
            Forgot Password?
          </h4>

          <p className="text-center text-secondary small mb-4">
            Enter your registered email address.
            We'll send you a password reset link.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email Address
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

            <button
              type="submit"
              className="btn w-100 text-white fw-semibold"
              style={{ backgroundColor: "#e91e63" }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

          </form>

          {message && (
            <div className="alert alert-info mt-3 mb-0 small">
              {message}
            </div>
          )}

          <p className="text-center mt-4 mb-0">
            Remember your password?{" "}
            <Link to="/signin" style={{ color: "#e91e63" }}>
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
