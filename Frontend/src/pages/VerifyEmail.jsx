
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const [message, setMessage] = useState("Verifying your email...");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setMessage("Invalid verification link.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/verify-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, token })
          }
        );

        const data = await response.json();

        setMessage(data.message);

        if (response.ok) {
          setSuccess(true);
        }
      } catch (error) {
        setMessage("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="container d-flex justify-content-center align-items-center"
         style={{ minHeight: "80vh" }}>
      <div className="card shadow p-4 text-center"
           style={{ maxWidth: "450px", width: "100%" }}>

        <h3 className="mb-3">Email Verification</h3>

        {loading ? (
          <div className="spinner-border text-danger mx-auto mb-3"
               role="status">
          </div>
        ) : (
          <h5 className={success ? "text-success" : "text-danger"}>
            {message}
          </h5>
        )}

        {success && (
          <Link to="/signin" className="btn btn-danger mt-3">
            Go to Sign In
          </Link>
        )}

      </div>
    </div>
  );
}

export default VerifyEmail;
