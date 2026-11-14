
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Wishlist({
  isAdmin = false,
  selectedCustomerId = "",
  onCountChange,
}) {
  const navigate = useNavigate();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  // FETCH CUSTOMER OR ADMIN WISHLIST
  useEffect(() => {
    const controller = new AbortController();

    async function fetchWishlist() {
      const token = localStorage.getItem("token");

      setWishlistProducts([]);
      setError("");

      if (!token) {
        setLoading(false);

        if (!isAdmin) {
          navigate("/signin", {
            state: { from: "/wishlist" },
            replace: true,
          });
        } else {
          setError("Please sign in as an admin.");
        }

        return;
      }

      if (isAdmin && !selectedCustomerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const endpoint = isAdmin
          ? `${API_URL}/api/admin/customers/${selectedCustomerId}/wishlist`
          : `${API_URL}/api/wishlist`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load wishlist."
          );
        }

        if (controller.signal.aborted) return;

        const products = Array.isArray(data.products)
          ? data.products
          : [];

        setWishlistProducts(products);

        if (isAdmin) {
          onCountChange?.(products.length);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          console.error("Wishlist fetch error:", err);
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchWishlist();

    return () => controller.abort();
  }, [isAdmin, selectedCustomerId, navigate, onCountChange]);

  // REMOVE PRODUCT - CUSTOMER ONLY
  const handleRemove = async (productId) => {
    if (isAdmin || removingId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin", {
        state: { from: "/wishlist" },
      });
      return;
    }

    try {
      setRemovingId(productId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/wishlist/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to remove product."
        );
      }

      const updatedProducts = Array.isArray(data.products)
        ? data.products
        : [];

      setWishlistProducts(updatedProducts);

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error("Remove wishlist error:", err);
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  // IMAGE HELPER
  const getProductImage = (product) =>
    product.images?.[0]?.url ||
    "https://placehold.co/400x500?text=No+Image";

  // PRICE HELPER
  const getProductPrice = (product) =>
    Number(product.discountPrice || product.price || 0);

  // DISCOUNT HELPER
  const getDiscount = (product) => {
    const price = Number(product.price);
    const discountPrice = Number(product.discountPrice);

    if (price > discountPrice && discountPrice > 0) {
      return Math.round(
        ((price - discountPrice) / price) * 100
      );
    }

    return 0;
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-3 p-md-4">

        {/* HEADER */}
        <div className="position-relative mb-4">

          {/* CENTER HEADING */}
          <div className="text-center">
            <h3 className="fw-bold mb-2">
              <i
                className="bi bi-heart-fill me-2"
                style={{ color: "#fc2779" }}
              ></i>

              {isAdmin ? "Customer Wishlist" : "My Wishlist"}
            </h3>

            <p className="text-secondary mb-0">
              {isAdmin
                ? "View the selected customer's saved products."
                : "View and manage your favourite clothing products."}
            </p>
          </div>

          {/* ITEM COUNT - TOP RIGHT */}
          <span
            className="badge rounded-pill px-3 py-2 position-absolute top-0 end-0"
            style={{ backgroundColor: "#fc2779" }}
          >
            {wishlistProducts.length} Items
          </span>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border"
              style={{ color: "#fc2779" }}
              role="status"
            >
              <span className="visually-hidden">
                Loading wishlist...
              </span>
            </div>

            <p className="text-secondary mt-3 mb-0">
              Loading wishlist...
            </p>
          </div>
        ) : isAdmin && !selectedCustomerId ? (
          <div className="text-center border rounded-3 py-5 px-3">
            <i className="bi bi-person-heart fs-1 text-secondary"></i>

            <h6 className="fw-bold mt-3">
              Select a Customer
            </h6>

            <p className="text-secondary small mb-0">
              Select a customer from Customer Activity to view
              their wishlist.
            </p>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center border rounded-3 py-5 px-3">
            <i
              className="bi bi-heart fs-1"
              style={{ color: "#fc2779" }}
            ></i>

            <h6 className="fw-bold mt-3">
              No Wishlist Products
            </h6>

            <p className="text-secondary small mb-3">
              {isAdmin
                ? "This customer has not saved any products yet."
                : "You haven't added any products to your wishlist yet."}
            </p>

            {!isAdmin && (
              <button
                type="button"
                className="btn text-white"
                style={{ backgroundColor: "#fc2779" }}
                onClick={() => navigate("/products")}
              >
                Explore Products
              </button>
            )}
          </div>
        ) : (
          /* WISHLIST PRODUCT GRID */
          <div className="row g-3">
            {wishlistProducts
              .filter(Boolean)
              .map((item, index) => {
                const product = item.product || item;
                const discount = getDiscount(product);

                return (
                  <div
                    className="col-12 col-sm-6 col-lg-4 col-xl-3"
                    key={product._id || index}
                  >
                    <div className="card h-100 border rounded-3 overflow-hidden">

                      {/* PRODUCT IMAGE */}
                      <div className="position-relative">
                        <img
                          src={getProductImage(product)}
                          alt={product.productName}
                          className="card-img-top"
                          style={{
                            height: "230px",
                            objectFit: "cover",
                            objectPosition: "center top",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            navigate(`/products/${product._id}`)
                          }
                        />

                        {discount > 0 && (
                          <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                            {discount}% OFF
                          </span>
                        )}

                        {/* REMOVE - CUSTOMER ONLY */}
                        {!isAdmin && (
                          <button
                            type="button"
                            className="btn btn-light rounded-circle position-absolute top-0 end-0 m-2 shadow-sm"
                            aria-label="Remove from wishlist"
                            title="Remove from wishlist"
                            disabled={removingId !== null}
                            onClick={() =>
                              handleRemove(product._id)
                            }
                          >
                            {removingId === product._id ? (
                              <span
                                className="spinner-border spinner-border-sm text-danger"
                                role="status"
                              ></span>
                            ) : (
                              <i
                                className="bi bi-heart-fill"
                                style={{ color: "#fc2779" }}
                              ></i>
                            )}
                          </button>
                        )}
                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="card-body d-flex flex-column">
                        <h6 className="fw-bold mb-1">
                          {product.brand || "Nykaa Store"}
                        </h6>

                        <p className="small text-secondary mb-2">
                          {product.productName}
                        </p>

                        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                          <strong>
                            ₹{getProductPrice(product).toLocaleString("en-IN")}
                          </strong>

                          {discount > 0 && (
                            <>
                              <del className="small text-secondary">
                                ₹{Number(product.price).toLocaleString("en-IN")}
                              </del>

                              <span className="small text-danger">
                                {discount}% OFF
                              </span>
                            </>
                          )}
                        </div>

                        <div className="mt-auto">
                          <button
                            type="button"
                            className="btn btn-outline-dark btn-sm w-100"
                            onClick={() =>
                              navigate(`/products/${product._id}`)
                            }
                          >
                            View Product
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
