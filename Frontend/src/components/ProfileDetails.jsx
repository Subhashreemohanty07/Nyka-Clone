
import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL;

function ProfileDetails({
  user,
  role = "customer",
  onProfileUpdated,
}) {
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "Not available";
  const displayRole = user?.role || role;
  const isAdmin = displayRole === "admin";

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  const handleSaveName = async (event) => {
    event.preventDefault();

    if (!isAdmin || saving) return;

    const name = newName.trim();

    if (name.length < 2 || name.length > 60) {
      setProfileError("Name must contain between 2 and 60 characters.");
      return;
    }

    try {
      setSaving(true);
      setProfileError("");
      setProfileMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch(
        `${API_URL}/api/admin/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update name.");
      }

      if (onProfileUpdated) {
        onProfileUpdated(data.admin);
      } else {
        let existingUser = {};

        try {
          existingUser = JSON.parse(
            localStorage.getItem("user") || "{}"
          ) || {};
        } catch {
          existingUser = {};
        }

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...existingUser,
            ...data.admin,
          })
        );

        window.dispatchEvent(new Event("authUpdated"));
      }

      setIsEditing(false);
      setProfileMessage("Name updated successfully!");
    } catch (error) {
      setProfileError(
        error.message || "Unable to update name."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInviteAdmin = async (event) => {
    event.preventDefault();

    if (!isAdmin || inviting) return;

    const email = inviteEmail.trim().toLowerCase();

    if (!email) {
      setInviteError("Please enter an email address.");
      return;
    }

    try {
      setInviting(true);
      setInviteError("");
      setInviteMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch(
        `${API_URL}/api/admin/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send invitation."
        );
      }

      setInviteMessage(
        data.message || "Invitation sent successfully."
      );
      setInviteEmail("");
    } catch (error) {
      setInviteError(
        error.message || "Unable to send invitation."
      );
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-3 p-md-4">

          {/* PROFILE HEADER */}
          <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-3 text-center text-sm-start">

            <div
              className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold flex-shrink-0"
              style={{
                width: "76px",
                height: "76px",
                backgroundColor: "#ec5891",
                fontSize: "30px",
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-grow-1 w-100">
              {isAdmin && isEditing ? (
                <form
                  onSubmit={handleSaveName}
                  className="mb-2"
                >
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <input
                      type="text"
                      className="form-control"
                      style={{ maxWidth: "280px" }}
                      value={newName}
                      minLength={2}
                      maxLength={60}
                      onChange={(e) =>
                        setNewName(e.target.value)
                      }
                      required
                      autoFocus
                      disabled={saving}
                    />

                    <button
                      type="submit"
                      className="btn btn-sm text-white"
                      style={{ backgroundColor: "#ec5891" }}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={saving}
                      onClick={() => {
                        setIsEditing(false);
                        setProfileError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="d-flex flex-wrap justify-content-center justify-content-sm-start align-items-center gap-3 mb-1">
                  <h4 className="fw-bold mb-0">
                    {displayName}
                  </h4>

                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setNewName(displayName);
                        setProfileError("");
                        setProfileMessage("");
                        setIsEditing(true);
                      }}
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Edit
                    </button>
                  )}
                </div>
              )}

              <p className="text-secondary mb-2 text-break">
                {displayEmail}
              </p>

              <span
                className="badge rounded-pill px-3 py-2 text-capitalize"
                style={{
                  backgroundColor: "#fff0f5",
                  color: "#c2185b",
                }}
              >
                <i className="bi bi-shield-check me-1"></i>
                {displayRole}
              </span>

              {profileMessage && (
                <div
                  className="alert alert-success mt-3 mb-0 py-2"
                  role="status"
                >
                  {profileMessage}
                </div>
              )}

              {profileError && (
                <div
                  className="alert alert-danger mt-3 mb-0 py-2"
                  role="alert"
                >
                  {profileError}
                </div>
              )}
            </div>
          </div>

          {/* OPTIONAL DETAILS */}
          {(user?.phone ||
            user?.mobile ||
            user?.createdAt) && (
            <div className="mt-4 pt-3 border-top">
              {(user?.phone || user?.mobile) && (
                <p className="mb-2 text-secondary">
                  <i className="bi bi-telephone me-2"></i>
                  {user.phone || user.mobile}
                </p>
              )}

              {user?.createdAt && (
                <p className="mb-0 text-secondary">
                  <i className="bi bi-calendar-check me-2"></i>
                  Member since{" "}
                  {new Date(
                    user.createdAt
                  ).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          )}

          {/* ADMIN INVITATION */}
          {isAdmin && (
            <div className="mt-4 pt-4 border-top">
              <div className="d-flex align-items-start gap-3 mb-4">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "46px",
                    height: "46px",
                    backgroundColor: "#fff0f5",
                    color: "#ec5891",
                  }}
                >
                  <i className="bi bi-envelope-plus fs-4"></i>
                </div>

                <div>
                  <h5 className="fw-bold mb-1">
                    Invite New Admin
                  </h5>
                  <p className="text-secondary small mb-0">
                    Send an invitation to add another
                    administrator to your store.
                  </p>
                </div>
              </div>

              <form onSubmit={handleInviteAdmin}>
                <div className="row g-3 align-items-end">
                  <div className="col-12 col-md-8">
                    <label
                      htmlFor="adminInviteEmail"
                      className="form-label fw-semibold"
                    >
                      Email Address
                    </label>

                    <input
                      id="adminInviteEmail"
                      type="email"
                      className="form-control"
                      placeholder="Enter new admin email"
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setInviteError("");
                        setInviteMessage("");
                      }}
                      required
                      disabled={inviting}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <button
                      type="submit"
                      className="btn text-white w-100"
                      style={{
                        backgroundColor: "#ec5891",
                      }}
                      disabled={inviting}
                    >
                      {inviting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Send Invitation
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {inviteMessage && (
                  <div
                    className="alert alert-success mt-3 mb-0"
                    role="status"
                  >
                    {inviteMessage}
                  </div>
                )}

                {inviteError && (
                  <div
                    className="alert alert-danger mt-3 mb-0"
                    role="alert"
                  >
                    {inviteError}
                  </div>
                )}

                <p className="text-secondary small mt-3 mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Invitation links expire after 24 hours.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileDetails;
