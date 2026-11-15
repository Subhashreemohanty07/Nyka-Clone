
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("token");

  // FETCH CART FROM MONGODB
  const fetchCart = async () => {
    const token = getToken();

    if (!token) {
      setCartItems([]);
      setLoading(false);
      navigate("/signin", { state: { from: "/cart" } });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/signin", { state: { from: "/cart" } });
          return;
        }
        throw new Error(data.message || "Unable to load cart.");
      }

      setCartItems(data.items || []);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // UPDATE PRODUCT QUANTITY IN MONGODB
  const changeQuantity = async (item, amount) => {
    const newQuantity = Number(item.quantity) + amount;

    if (newQuantity < 1 || updatingId !== null) return;

    try {
      setUpdatingId(item._id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/cart/${item._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update quantity.");
      }

      setCartItems(data.items || []);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Update quantity error:", err);
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // REMOVE PRODUCT FROM MONGODB
  const removeItem = async (itemId) => {
    if (updatingId !== null) return;

    try {
      setUpdatingId(itemId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/cart/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove product.");
      }

      setCartItems(data.items || []);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Remove cart error:", err);
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // PRODUCT HELPERS
  const getProduct = (item) => item.product || {};

  const getPrice = (item) => {
    const product = getProduct(item);
    return Number(
      product.discountPrice ?? product.price ?? 0
    );
  };

  const getImage = (item) => {
    const product = getProduct(item);

    const image =
      product.images?.[0]?.url ||
      product.images?.[0] ||
      product.image?.url ||
      product.image ||
      "";

    return typeof image === "string"
      ? image
      : "https://placehold.co/300x400?text=No+Image";
  };

  // CALCULATE TOTAL
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + getPrice(item) * Number(item.quantity || 1),
    0
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  // CHECKOUT
  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!getToken()) {
      navigate("/signin", {
        state: { from: "/checkout" },
      });
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="bg-white min-vh-100">
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
            <li className="breadcrumb-item active">
              Shopping Bag
            </li>
          </ol>
        </nav>

        {/* HEADING */}
        <div className="mb-4">
          <h2 className="fw-bold" style={{ color: "#f3338f" }}>My Shopping Bag</h2>
          <p className="text-secondary">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your bag
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger">
            {error}
            <button
              type="button"
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={fetchCart}
            >
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status"></div>
            <p className="text-secondary mt-3">
              Loading your shopping bag...
            </p>
          </div>
        ) : cartItems.length === 0 && !error ? (
          /* EMPTY CART */
          <div className="text-center py-5 border rounded-3">
            <i className="bi bi-bag display-1 text-secondary"></i>

            <h4 className="fw-bold mt-3">
              Your shopping bag is empty!
            </h4>

            <p className="text-secondary">
              Looks like you haven't added anything to your bag yet.
            </p>

            <Link to="/products" className="btn btn-dark mt-2">
              Continue Shopping
            </Link>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="row g-4">
            {/* CART PRODUCTS */}
            <div className="col-lg-8">
              <div className="border rounded-3 p-3 p-md-4">
                {cartItems.map((item, index) => {
                  const product = getProduct(item);
                  const price = getPrice(item);
                  const productName =
                    product.productName || product.name || "Product";

                  return (
                    <div key={item._id}>
                      <div className="row g-3 align-items-center">
                        {/* IMAGE */}
                        <div className="col-4 col-md-3">
                          <img
                            src={getImage(item)}
                            alt={productName}
                            className="img-fluid rounded"
                            style={{
                              width: "100%",
                              height: "170px",
                              objectFit: "contain",
                              backgroundColor: "#f8f8f8",
                            }}
                          />
                        </div>

                        {/* PRODUCT DETAILS */}
                        <div className="col-8 col-md-9">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="fw-bold mb-1">
                                {product.brand || "Nykaa Store"}
                              </h6>

                              <p className="mb-2">{productName}</p>
                            </div>

                            {/* REMOVE */}
                            <button
                              type="button"
                              className="btn btn-link text-danger p-0"
                              onClick={() => removeItem(item._id)}
                              disabled={updatingId !== null}
                              aria-label="Remove product"
                            >
                              <i className="bi bi-trash fs-5"></i>
                            </button>
                          </div>

                          {/* SIZE AND COLOR */}
                          <div className="small text-secondary mb-2">
                            {item.size && (
                              <span className="me-3">
                                Size: {item.size}
                              </span>
                            )}

                            {item.color && (
                              <span>
                                Colour: {item.color}
                              </span>
                            )}
                          </div>

                          {/* PRICE */}
                          <h6 className="fw-bold mb-3">
                            ₹{price.toLocaleString("en-IN")}
                          </h6>

                          {/* QUANTITY */}
                          <div className="d-flex align-items-center gap-2">
                            <span className="small text-secondary">
                              Quantity:
                            </span>

                            <div className="d-flex align-items-center border rounded">
                              <button
                                type="button"
                                className="btn btn-light btn-sm"
                                onClick={() => changeQuantity(item, -1)}
                                disabled={
                                  item.quantity <= 1 ||
                                  updatingId !== null
                                }
                              >
                                −
                              </button>

                              <span className="px-3">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                className="btn btn-light btn-sm"
                                onClick={() => changeQuantity(item, 1)}
                                disabled={updatingId !== null}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* ITEM TOTAL */}
                          <p className="fw-semibold mt-3 mb-0">
                            Item Total: ₹
                            {(
                              price * Number(item.quantity)
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {index !== cartItems.length - 1 && (
                        <hr className="my-4" />
                      )}
                    </div>
                  );
                })}
              </div>

              <Link
                to="/products"
                className="btn btn-outline-dark mt-3"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Continue Shopping
              </Link>
            </div>

            {/* PRICE SUMMARY */}
            <div className="col-lg-4">
              <div className="border rounded-3 p-4">
                <h5 className="fw-bold mb-4">
                  Price Details
                </h5>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">
                    Total Items
                  </span>
                  <span>{totalItems}</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">
                    Subtotal
                  </span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-secondary">
                    Delivery Charges
                  </span>
                  <span className="text-success">FREE</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-4">
                  <h6 className="fw-bold">Total Amount</h6>
                  <h5 className="fw-bold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </h5>
                </div>

                <button
                  type="button"
                  className="btn btn-dark w-100 py-3 fw-semibold"
                  onClick={handleCheckout}
                  disabled={
                    cartItems.length === 0 ||
                    updatingId !== null
                  }
                >
                  <i className="bi bi-lock-fill me-2"></i>
                  PROCEED TO CHECKOUT
                </button>

                <p className="small text-secondary text-center mt-3 mb-0">
                  <i className="bi bi-shield-check me-1"></i>
                  Safe and secure shopping
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <Footer showSocial={false} />
    </div>
  );
}

export default Cart;
