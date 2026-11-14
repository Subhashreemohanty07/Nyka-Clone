
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileDetails from "../components/ProfileDetails";
import AddressManager from "../components/AddressManger";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // FETCH LOGGED-IN USER PROFILE
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/signin", { replace: true });
          return;
        }

        const response = await fetch(
          `${API_URL}/api/auth/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (controller.signal.aborted) return;

        // INVALID OR EXPIRED TOKEN
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          window.dispatchEvent(
            new Event("authUpdated")
          );

          navigate("/signin", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load profile."
          );
        }

        const profileUser = data.user;

        // ADMIN REDIRECT
        if (profileUser.role === "admin") {
          navigate("/admin-dashboard?tab=profile", {
            replace: true,
          });
          return;
        }

        // VENDOR REDIRECT
        if (profileUser.role === "vendor") {
          navigate("/vendor-dashboard", {
            replace: true,
          });
          return;
        }

        // CUSTOMER PROFILE
        setUser(profileUser);

      } catch (error) {
        if (error.name !== "AbortError") {
          setMessage(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => controller.abort();
  }, [navigate]);

  // LOGOUT
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(
      new Event("authUpdated")
    );

    navigate("/signin", { replace: true });
  }

  // LOADING
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div
          className="spinner-border"
          style={{ color: "#fc2779" }}
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="mt-3 text-secondary">
          Loading your profile...
        </p>
      </div>
    );
  }

  // ERROR
  if (message) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {message}
        </div>

        <button
          type="button"
          className="btn text-white"
          style={{ backgroundColor: "#fc2779" }}
          onClick={handleLogout}
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="min-vh-100 py-4 py-md-5"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="container">

        {/* PAGE HEADING */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">
            My Account
          </h3>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>

        {/* CUSTOMER PROFILE DETAILS */}
        <ProfileDetails
          user={user}
          role="customer"
        />

        {/* CUSTOMER SAVED ADDRESSES */}
        <div className="mt-4">
          <AddressManager />
        </div>

        {/* CUSTOMER ORDERS */}
        <div className="card border-0 shadow-sm rounded-4 mt-4">
          <div className="card-body p-3 p-md-4">

            <div className="d-flex align-items-center gap-3">

              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#fff0f5",
                  color: "#fc2779",
                }}
              >
                <i className="bi bi-bag-check fs-4"></i>
              </div>

              <div className="flex-grow-1">
                <h5 className="fw-bold mb-1">
                  My Orders
                </h5>

                <p className="text-secondary small mb-0">
                  View your order history and track your purchases.
                </p>
              </div>

              <span
                className="badge rounded-pill"
                style={{
                  backgroundColor: "#fff0f5",
                  color: "#fc2779",
                }}
              >
                Coming Soon
              </span>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
