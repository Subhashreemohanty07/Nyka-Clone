
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AddressManager from "../components/AddressManger";

const API_URL =
  import.meta.env.VITE_API_URL ;

function Checkout() {
  const navigate = useNavigate();

  // CART
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  // DELIVERY ADDRESSES
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressReady, setAddressReady] = useState(false);
  const [addressError, setAddressError] = useState("");

  // PAYMENT
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // FETCH CART
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin", {
        replace: true,
        state: { from: "/checkout" },
      });
      return;
    }

    const controller = new AbortController();

    async function fetchCart() {
      try {
        setCartLoading(true);
        setCartError("");

        const response = await fetch(
          `${API_URL}/api/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          window.dispatchEvent(new Event("authUpdated"));

          navigate("/signin", {
            replace: true,
            state: { from: "/checkout" },
          });
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load cart."
          );
        }

        const items = Array.isArray(data.items)
          ? data.items
          : [];

        if (items.length === 0) {
          navigate("/cart", { replace: true });
          return;
        }

        setCartItems(items);
      } catch (error) {
        if (
          error.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setCartError(
            error.message || "Unable to load cart."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCartLoading(false);
        }
      }
    }

    fetchCart();

    return () => controller.abort();
  }, [navigate]);

  // RECEIVE ADDRESSES FROM ADDRESS MANAGER
  const handleAddressesChange = useCallback((updatedAddresses) => {
  setSavedAddresses(updatedAddresses);
  setAddressReady(true);
  setAddressError("");
  }, []);

  const handleSelectAddress = useCallback((id) => {
    setSelectedAddressId(id);
    setAddressError("");
  }, []);
  // CART SUBTOTAL
  const subtotal = cartItems.reduce((total, item) => {
    const product = item.product || {};

    const price = Number(
      product.discountPrice ?? product.price ?? 0
    );

    const quantity = Number(item.quantity || 1);

    return total + price * quantity;
  }, 0);

  // TOTAL ITEMS
  const totalItems = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );

  // CURRENT SELECTED DELIVERY ADDRESS
  const selectedAddress = savedAddresses.find(
    (item) => item._id === selectedAddressId
  );

  // ORDER API WILL BE CONNECTED LATER
  function handlePlaceOrder() {
    setAddressError("");

    if (!selectedAddress) {
      setAddressError(
        "Please select a delivery address."
      );
      return;
    }

    if (paymentMethod !== "COD") {
      setAddressError(
        "Please select a valid payment method."
      );
      return;
    }

    alert(
      "Delivery address selected successfully. " +
      "We will connect the Order API next."
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <main
        className="container pb-5"
        style={{ paddingTop: "190px" }}
      >
        {/* BREADCRUMB */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item">
              <Link
                to="/"
                className="text-secondary text-decoration-none"
              >
                Home
              </Link>
            </li>

            <li className="breadcrumb-item">
              <Link
                to="/cart"
                className="text-secondary text-decoration-none"
              >
                Cart
              </Link>
            </li>

            <li className="breadcrumb-item active">
              Checkout
            </li>
          </ol>
        </nav>

        {/* PAGE HEADING */}
        <div className="mb-4">
          <h2 className="fw-bold">
            Checkout
          </h2>

          <p className="text-secondary">
            Select your delivery address to continue.
          </p>
        </div>

        {/* LOADING CART */}
        {cartLoading ? (
          <div className="bg-white border rounded-3 text-center p-5">
            <div
              className="spinner-border"
              style={{ color: "#fc2779" }}
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="text-secondary mt-3 mb-0">
              Loading your checkout details...
            </p>
          </div>
        ) : cartError ? (
          <div className="alert alert-danger">
            <p className="mb-2">
              {cartError}
            </p>

            <Link
              to="/cart"
              className="btn btn-outline-danger"
            >
              Back to Cart
            </Link>
          </div>
        ) : (
          <div className="row g-4">

            {/* LEFT SIDE */}
            <div className="col-lg-8">

              {/* REUSABLE DELIVERY ADDRESS COMPONENT */}
              <div className="mb-4">
                <AddressManager
                  mode="checkout"
                  selectedAddressId={selectedAddressId}
                  onSelectAddress={handleSelectAddress}
                  onAddressesChange={handleAddressesChange}
                />
              </div>

              {/* PAYMENT METHOD */}
              <div className="bg-white border rounded-3 p-3 p-md-4">
                <h5 className="fw-bold mb-4">
                  <i
                    className="bi bi-credit-card me-2"
                    style={{ color: "#fc2779" }}
                  ></i>
                  Payment Method
                </h5>

                <div
                  className="border rounded-3 p-3"
                  style={{
                    backgroundColor: "#fff7fa",
                    borderColor: "#fc2779",
                  }}
                >
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="paymentMethod"
                      id="cod"
                      checked={paymentMethod === "COD"}
                      onChange={() =>
                        setPaymentMethod("COD")
                      }
                    />

                    <label
                      className="form-check-label fw-semibold"
                      htmlFor="cod"
                    >
                      <i className="bi bi-cash-coin me-2"></i>
                      Cash on Delivery (COD)
                    </label>
                  </div>

                  <p className="small text-secondary mt-2 mb-0 ms-4">
                    Pay when your order is delivered.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - ORDER SUMMARY */}
            <div className="col-lg-4">
              <div className="bg-white border rounded-3 p-3 p-md-4">
                <h5 className="fw-bold mb-4">
                  Order Summary ({totalItems} items)
                </h5>

                {/* CART PRODUCTS */}
                {cartItems.map((item) => {
                  const product = item.product || {};

                  const price = Number(
                    product.discountPrice ??
                    product.price ??
                    0
                  );

                  const quantity = Number(
                    item.quantity || 1
                  );

                  const image =
                    product.images?.[0]?.url ||
                    "https://placehold.co/100x120?text=Product";

                  return (
                    <div
                      key={item._id}
                      className="d-flex gap-3 mb-3 pb-3 border-bottom"
                    >
                      <img
                        src={image}
                        alt={
                          product.productName ||
                          "Product"
                        }
                        className="rounded border"
                        style={{
                          width: "65px",
                          height: "80px",
                          objectFit: "contain",
                        }}
                      />

                      <div className="flex-grow-1">
                        <h6 className="small fw-bold mb-1">
                          {product.productName ||
                            "Product"}
                        </h6>

                        {product.brand && (
                          <p className="small text-secondary mb-1">
                            {product.brand}
                          </p>
                        )}

                        <p className="small text-secondary mb-1">
                          Qty: {quantity}
                          {item.size &&
                            ` | Size: ${item.size}`}
                          {item.color &&
                            ` | Colour: ${item.color}`}
                        </p>

                        <span className="fw-semibold small">
                          ₹
                          {(
                            price * quantity
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* TOTAL ITEMS */}
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">
                    Total Items
                  </span>

                  <span>{totalItems}</span>
                </div>

                {/* SUBTOTAL */}
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* DELIVERY */}
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">
                    Delivery
                  </span>

                  <span className="text-success">
                    FREE
                  </span>
                </div>

                <hr />

                {/* TOTAL AMOUNT */}
                <div
                  className="d-flex justify-content-between align-items-center p-3 rounded-3 mb-4"
                  style={{
                    backgroundColor: "#fff0f6",
                  }}
                >
                  <h6 className="fw-bold mb-0">
                    Total Amount
                  </h6>

                  <h5 className="fw-bold mb-0">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </h5>
                </div>

                {/* ADDRESS ERROR */}
                {addressError && (
                  <div className="alert alert-danger">
                    {addressError}
                  </div>
                )}

                {/* PLACE ORDER */}
                <button
                  type="button"
                  className="btn w-100 py-3 fw-semibold text-white"
                  style={{
                    backgroundColor: "#fc2779",
                  }}
                  onClick={handlePlaceOrder}
                  disabled={
                    cartItems.length === 0 ||
                    !addressReady ||
                    !selectedAddress
                  }
                >
                  <i className="bi bi-bag-check me-2"></i>
                  PLACE ORDER
                </button>

                {!addressReady && (
                  <p className="small text-secondary text-center mt-2">
                    Loading delivery addresses...
                  </p>
                )}

                <p className="small text-secondary text-center mt-3 mb-0">
                  <i className="bi bi-shield-check me-1"></i>
                  Secure checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer showSocial={false} />
    </div>
  );
}

export default Checkout;
