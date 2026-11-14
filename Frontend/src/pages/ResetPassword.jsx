
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!token || !email) {
      setMessage("Invalid or missing password reset link.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            token,
            newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage(data.message);
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      setMessage(error.message || "Unable to reset password.");
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
            className="text-center fw-bold mb-3"
            style={{ color: "#e91e63" }}
          >
            nykaa
          </h1>

          <h4 className="text-center mb-2">
            Reset Password
          </h4>

          <p className="text-center text-secondary small mb-4">
            Enter your new password below.
          </p>

          {!success && (
            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn w-100 text-white fw-semibold"
                style={{ backgroundColor: "#e91e63" }}
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>

            </form>
          )}

          {message && (
            <div
              className={`alert ${success ? "alert-success" : "alert-danger"} mt-3 mb-0 small`}
              role="status"
            >
              {message}
            </div>
          )}

          {success && (
            <Link
              to="/signin"
              className="btn w-100 text-white mt-3"
              style={{ backgroundColor: "#e91e63" }}
            >
              Go to Sign In
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
