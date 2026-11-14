
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function AcceptAdminInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Invalid invitation link.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/accept-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            name,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to accept invitation."
        );
      }

      setSuccess(true);
      setPassword("");
      setMessage(data.message);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "480px" }}>
      <div className="card shadow-sm p-4">
        <h3 className="text-center mb-3">
          Accept Admin Invitation
        </h3>

        <p className="text-muted text-center">
          Create your Nykaa administrator account.
        </p>

        {message && (
          <div
            className={`alert ${
              success ? "alert-success" : "alert-danger"
            }`}
          >
            {message}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={60}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn btn-danger w-100"
              disabled={loading || !token}
            >
              {loading ? "Creating Account..." : "Create Admin Account"}
            </button>
          </form>
        )}

        {success && (
          <button
            className="btn btn-dark w-100 mt-3"
            onClick={() => navigate("/signin")}
          >
            Go to Sign In
          </button>
        )}
      </div>
    </div>
  );
}

export default AcceptAdminInvite;
