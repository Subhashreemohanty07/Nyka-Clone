
import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyAddress = {
  addressType: "Home",
  fullName: "",
  phone: "",
  house: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
};

function AddressManager({
  mode = "profile",
  selectedAddressId = "",
  onSelectAddress,
  onAddressesChange,
}) {
  const isCheckout = mode === "checkout";

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [address, setAddress] = useState({ ...emptyAddress });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const getToken = () => localStorage.getItem("token");

  // FETCH ADDRESSES
  useEffect(() => {
    const controller = new AbortController();

    async function fetchAddresses() {
      try {
        const token = getToken();

        if (!token) {
          throw new Error("Please sign in to view your addresses.");
        }

        const response = await fetch(
          `${API_URL}/api/addresses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load addresses."
          );
        }

        if (!controller.signal.aborted) {
          const fetched = Array.isArray(data.addresses)
            ? data.addresses
            : [];

          setAddresses(fetched);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAddresses();

    return () => controller.abort();
  }, []);

  // NOTIFY CHECKOUT ABOUT ADDRESSES AND SELECTION
  useEffect(() => {
    if (!isCheckout || loading || error) return;

    onAddressesChange?.(addresses);

    const selectedExists = addresses.some(
      (item) => item._id === selectedAddressId
    );

    if (!selectedExists) {
      const preferred =
        addresses.find((item) => item.isDefault) ||
        addresses[0];

      const nextId = preferred?._id || "";

      if (nextId !== selectedAddressId) {
        onSelectAddress?.(nextId);
      }
    }
  }, [
    addresses,
    selectedAddressId,
    isCheckout,
    loading,
    error,
    onSelectAddress,
    onAddressesChange,
  ]);

  // REFRESH AFTER ADD / EDIT / DELETE / DEFAULT
  async function refreshAddresses() {
    const response = await fetch(`${API_URL}/api/addresses`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to refresh addresses."
      );
    }

    const updated = Array.isArray(data.addresses)
      ? data.addresses
      : [];

    setAddresses(updated);

    return updated;
  }

  // FORM INPUT
  function handleChange(e) {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ADD ADDRESS
  function handleAdd() {
    setEditingId(null);
    setAddress({ ...emptyAddress });
    setFormError("");
    setShowForm(true);
  }

  // EDIT ADDRESS
  function handleEdit(item) {
    setEditingId(item._id);

    setAddress({
      addressType: item.addressType || "Home",
      fullName: item.fullName || "",
      phone: item.phone || "",
      house: item.house || "",
      area: item.area || "",
      city: item.city || "",
      state: item.state || "",
      pincode: item.pincode || "",
    });

    setFormError("");
    setShowForm(true);
  }

  // CANCEL FORM
  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setFormError("");
    setAddress({ ...emptyAddress });
  }

  // SAVE / UPDATE
  async function handleSave(e) {
    e.preventDefault();

    setSaving(true);
    setFormError("");
    setError("");

    try {
      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `${API_URL}/api/addresses/${editingId}`
        : `${API_URL}/api/addresses`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(address),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save address."
        );
      }

      const savedId = data.address?._id;

      const updated = await refreshAddresses();

      if (isCheckout && savedId) {
        const savedExists = updated.some(
          (item) => item._id === savedId
        );

        if (savedExists) {
          onSelectAddress?.(savedId);
        }
      }

      handleCancel();
    } catch (err) {
      setFormError(err.message || "Unable to save address.");
    } finally {
      setSaving(false);
    }
  }

  // SET DEFAULT
  async function handleSetDefault(id) {
    setActionId(id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${id}/default`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to set default address."
        );
      }

      await refreshAddresses();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  // DELETE
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    setActionId(id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete address."
        );
      }

      await refreshAddresses();

      if (editingId === id) {
        handleCancel();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-3 p-md-4">

        {/* HEADER */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <h5 className="fw-bold mb-0">
            <i
              className="bi bi-geo-alt-fill me-2"
              style={{ color: "#fc2779" }}
            ></i>
            {isCheckout ? "Delivery Address" : "My Addresses"}
          </h5>

          {!showForm && (
            <button
              type="button"
              className="btn text-white fw-semibold"
              style={{ backgroundColor: "#fc2779" }}
              onClick={handleAdd}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Address
            </button>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="text-center py-4">
            <div
              className="spinner-border"
              style={{ color: "#fc2779" }}
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>
            <p className="text-secondary mt-2">
              Loading saved addresses...
            </p>
          </div>
        )}

        {/* NO ADDRESSES */}
        {!loading && !error && addresses.length === 0 && (
          <p className="text-secondary">
            No saved addresses found. Add your first address.
          </p>
        )}

        {/* ADDRESS CARDS */}
        {!loading &&
          addresses.map((item) => {
            const isSelected =
              isCheckout && selectedAddressId === item._id;

            const isBusy = actionId !== null || saving;

            return (
              <div
                key={item._id}
                className="rounded-3 p-3 mb-3"
                style={{
                  border: isSelected
                    ? "1.5px solid #fc2779"
                    : "1px solid #dee2e6",
                  backgroundColor: isSelected
                    ? "#fff7fa"
                    : "#ffffff",
                }}
              >
                <div className="d-flex align-items-start gap-3">

                  {/* CHECKOUT SELECTION */}
                  {isCheckout && (
                    <input
                      type="radio"
                      name="selectedDeliveryAddress"
                      className="form-check-input mt-1"
                      checked={isSelected}
                      onChange={() =>
                        onSelectAddress?.(item._id)
                      }
                      aria-label={`Deliver to ${item.fullName}, ${item.city}`}
                      disabled={isBusy}
                    />
                  )}

                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <strong>{item.fullName}</strong>

                      <span className="text-secondary small">
                        {item.phone}
                      </span>

                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#fce4ef",
                          color: "#c2185b",
                        }}
                      >
                        {item.addressType}
                      </span>

                      {item.isDefault && (
                        <span className="badge bg-success">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-secondary small mb-3">
                      {item.house}, {item.area},{" "}
                      {item.city}, {item.state} -{" "}
                      {item.pincode}
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className="d-flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none"
                        onClick={() => handleEdit(item)}
                        disabled={isBusy}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                        onClick={() => handleDelete(item._id)}
                        disabled={isBusy}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </button>

                      {!item.isDefault && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-decoration-none"
                          onClick={() =>
                            handleSetDefault(item._id)
                          }
                          disabled={isBusy}
                        >
                          <i className="bi bi-star me-1"></i>
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {/* ADD / EDIT FORM */}
        {showForm && (
          <form
            onSubmit={handleSave}
            className="border rounded-3 p-3 mt-3"
            style={{ backgroundColor: "#fffafd" }}
          >
            <h6 className="fw-bold mb-3">
              {editingId ? "Edit Address" : "Add New Address"}
            </h6>

            {formError && (
              <div className="alert alert-danger">
                {formError}
              </div>
            )}

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">
                  Address Type
                </label>
                <select
                  name="addressType"
                  className="form-select"
                  value={address.addressType}
                  onChange={handleChange}
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  value={address.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={address.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  House / Flat / Building
                </label>
                <input
                  type="text"
                  name="house"
                  className="form-control"
                  value={address.house}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  Area / Street / Landmark
                </label>
                <input
                  type="text"
                  name="area"
                  className="form-control"
                  value={address.area}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={address.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  className="form-control"
                  value={address.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pincode"
                  className="form-control"
                  value={address.pincode}
                  onChange={handleChange}
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn text-white fw-semibold"
                style={{ backgroundColor: "#fc2779" }}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Address"
                  : "Save Address"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddressManager;
