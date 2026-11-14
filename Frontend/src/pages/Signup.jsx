import { useState } from "react";
import { signupUser } from "../services/authService";
import { Link } from "react-router-dom";

function Signup() {
  // Common fields
  const [role, setRole] = useState("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // Vendor fields
  const [storeName, setStoreName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Status
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  // Reset form after successful signup
  function resetForm() {
    setRole("customer");
    setName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setStoreName("");
    setBusinessAddress("");
    setCity("");
    setState("");
    setPostalCode("");
  }

  // Submit form
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    setLoading(true);

    try {
      // Common fields for every account type
      const formData = {
        name: name.trim(),
        email: email.trim(),
        password,
        role
      };

      // Mobile number is required for both customer and vendor
      formData.mobile = mobile.trim();

      // Add business details only for vendors
      if (role === "vendor") {
        Object.assign(formData, {
          storeName: storeName.trim(),
          businessAddress: businessAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
        });
      }


    const data = await signupUser(formData);

    // Display the backend response
    setMessage(
      data.message ||
      "Registration successful! Please check your email to verify your account."
    );

    // Clear the signup form
    resetForm();

    } catch (error) {
      setMessage(error.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  // Reusable input styling
  const inputClass = "form-control form-control-sm";
  const labelClass = "form-label small fw-semibold mb-1";

  return (
    <div
      className="container-fluid min-vh-100 d-flex justify-content-center align-items-center py-3 px-2"
      style={{ backgroundColor: "#fff5f8" }}
    >
      <div
        className="card border-0 shadow-sm"
        style={{
          maxWidth: "850px",
          width: "100%",
          borderRadius: "14px"
        }}
      >
        <div className="card-body p-3 p-md-4">
          {/* Header */}
          <h1
            className="text-center fw-bold mb-1"
            style={{ color: "#e91e63", fontSize: "2rem" }}
          >
            nykaa
          </h1>

          <p className="text-center text-secondary small mb-3">
            Create your account
          </p>

          <form onSubmit={handleSubmit}>
            {/* Account type */}
            <div className="mb-2">
              <label htmlFor="role" className={labelClass}>
                Account Type
              </label>

              <select
                id="role"
                className="form-select form-select-sm"
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setMessage("");
                }}
                required
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
    
              </select>
            </div>

            {/* Name and Email */}
            <div className="row g-2">
              <div className="col-md-6">
                <label htmlFor="name" className={labelClass}>
                  {role === "vendor"
                    ? "Contact Person's Name"
                    : "Full Name"}
                </label>

                <input
                  id="name"
                  type="text"
                  className={inputClass}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="signup-email" className={labelClass}>
                  {role === "vendor" ? "Business Email" : "Email Address"}
                </label>

                <input
                  id="signup-email"
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            {/* Mobile Number: Customer and Vendor only */}
            
              <div className="row g-2 mt-0">
                <div className={role === "vendor" ? "col-md-6" : "col-12"}>
                  <label htmlFor="mobile" className={labelClass}>
                    Mobile Number
                  </label>

                  <input
                    id="mobile"
                    type="tel"
                    className={inputClass}
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    title="Enter a 10-digit mobile number"
                    required
                  />
                </div>

                {/* Vendor Store Name */}
                {role === "vendor" && (
                  <div className="col-md-6">
                    <label htmlFor="storeName" className={labelClass}>
                      Store Name
                    </label>

                    <input
                      id="storeName"
                      type="text"
                      className={inputClass}
                      value={storeName}
                      onChange={(event) => setStoreName(event.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            

            {/* Vendor-only fields */}
            {role === "vendor" && (
              <>
                <hr className="my-3" />

                <h6
                  className="fw-bold mb-2"
                  style={{ color: "#e91e63" }}
                >
                  Business Details
                </h6>

                {/* postal code */}
                <div className="row g-2">

                  <div className="col-md-12">
                    <label htmlFor="postalCode" className={labelClass}>
                      Postal Code
                    </label>

                    <input
                      id="postalCode"
                      type="text"
                      className={inputClass}
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* City and State */}
                <div className="row g-2 mt-0">
                  <div className="col-md-6">
                    <label htmlFor="city" className={labelClass}>
                      City
                    </label>

                    <input
                      id="city"
                      type="text"
                      className={inputClass}
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="state" className={labelClass}>
                      State
                    </label>

                    <input
                      id="state"
                      type="text"
                      className={inputClass}
                      value={state}
                      onChange={(event) => setState(event.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Business address */}
                <div className="mt-2">
                  <label htmlFor="businessAddress" className={labelClass}>
                    Business Address
                  </label>

                  <textarea
                    id="businessAddress"
                    className="form-control form-control-sm"
                    rows="2"
                    value={businessAddress}
                    onChange={(event) =>
                      setBusinessAddress(event.target.value)
                    }
                    required
                  />
                </div>


              </>
            )}

            {/* Password: All account types */}
            <div className="mt-2">
              <label htmlFor="signup-password" className={labelClass}>
                Password
              </label>

              <input
                id="signup-password"
                type="password"
                className={inputClass}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />

              <small className="text-secondary">
                Password must contain at least 8 characters.
              </small>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-sm w-100 text-white mt-3 py-2"
              style={{
                backgroundColor: "#e91e63",
                borderRadius: "6px"
              }}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className="alert alert-info mt-3 mb-0 py-2 small"
              role="status"
            >
              {message}
            </div>
          )}

          {/* Sign in link */}
          <p className="text-center small mt-3 mb-0">
            Already have an account?{" "}
            <Link
              to="/signin"
              style={{ color: "#e91e63", fontWeight: "600" }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;