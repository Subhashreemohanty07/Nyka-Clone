import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;


function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
        `${API_URL}/api/products/${id}`
      );

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();
        const productData = data.product || data.data || data;

        setProduct(productData);
        setSelectedImage(productData.images?.[0]?.url || "");
        setSelectedSize(productData.sizes?.[0] || "");
        setSelectedColor(productData.colors?.[0] || "");
      } catch (err) {
        console.error(err);
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const price = Number(product?.price || 0);
  const discountedPrice = Number(
    product?.discountPrice || product?.price || 0
  );

  const discount =
    price > discountedPrice
      ? Math.round(((price - discountedPrice) / price) * 100)
      : 0;

  const images = product?.images || [];

  
const handleAddToBag = async () => {
  if (!product || addingToCart) return;

  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/signin", {
      state: { from: `/products/${id}` },
    });
    return;
  }

  if (product.sizes?.length && !selectedSize) {
    alert("Please select a size");
    return;
  }

  if (product.colors?.length && !selectedColor) {
    alert("Please select a colour");
    return;
  }

  if (
    Number(product.stock) <= 0 ||
    quantity > Number(product.stock)
  ) {
    alert("Requested quantity is not available.");
    return;
  }

  try {
    setAddingToCart(true);

    const response = await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product._id,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
      }),
    });

    const data = await response.json();

    if (response.status === 401) {
      navigate("/signin", {
        state: { from: `/products/${id}` },
      });
      return;
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to add product to cart."
      );
    }

    window.dispatchEvent(new Event("cartUpdated"));

    navigate("/cart");
  } catch (error) {
    console.error("Add to cart error:", error);
    alert(error.message || "Something went wrong.");
  } finally {
    setAddingToCart(false);
  }
};

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container text-center py-5">
          <div className="spinner-border text-danger"></div>
          <p className="mt-3">Loading product...</p>
        </div>
        <Footer showSocial={false} />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="container text-center py-5">
          <i className="bi bi-bag-x display-1 text-secondary"></i>
          <h4 className="mt-3">Product not found</h4>
          <p className="text-secondary">{error}</p>
          <Link to="/products" className="btn btn-dark">
            Continue Shopping
          </Link>
        </div>
        <Footer showSocial={false} />
      </>
    );
  }

  return (
    <div className="bg-white min-vh-100">
      <Navbar />

      <main className="container pb-4" style={{ paddingTop: "150px" }}>
        

        {/* BREADCRUMB */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item">
              <Link to="/" className="text-secondary text-decoration-none">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products" className="text-secondary text-decoration-none">
                Clothing
              </Link>
            </li>
            <li className="breadcrumb-item active">
              {product.productName}
            </li>
          </ol>
        </nav>

        <div className="row g-4 g-lg-5 align-item-start">

          {/* PRODUCT IMAGES */}
          <div className="col-lg-6">
            <div className="row g-3">

              {images.length > 1 && (
                <div className="col-2 d-none d-md-block">
                  <div className="d-flex flex-column gap-3">
                    {images.map((image, index) => (
                      <button
                        type="button"
                        key={image.publicId || index}
                        className="btn p-1"
                        style={{
                          border: selectedImage === image.url
                            ? "2px solid #c2185b"
                            : "1px solid #ddd"
                        }}
                        onClick={() => setSelectedImage(image.url)}
                      >
                        <img
                          src={image.url}
                          alt="Product"
                          className="img-fluid"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={images.length > 1 ? "col-12 col-md-10" : "col-12"}>
                <div className="position-relative bg-light rounded overflow-hidden d-flex justify-content-center align-items-center">
                    <img
                        src={
                        selectedImage ||
                        "https://placehold.co/600x750?text=No+Image"
                        }
                        alt={product.productName}
                        className="img-fluid w-100"
                        style={{
                        height: "min(65vh, 520px)",
                        objectFit: "contain"
                        }}
                    />

                  {discount > 0 && (
                    <span className="badge bg-danger position-absolute top-0 start-0 m-3 p-2">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* MOBILE THUMBNAILS */}
              {images.length > 1 && (
                <div className="col-12 d-md-none">
                  <div className="d-flex gap-2 overflow-auto">
                    {images.map((image, index) => (
                      <button
                        type="button"
                        key={image.publicId || index}
                        className="btn p-1 flex-shrink-0"
                        style={{
                          width: "75px",
                          border: selectedImage === image.url
                            ? "2px solid #c2185b"
                            : "1px solid #ddd"
                        }}
                        onClick={() => setSelectedImage(image.url)}
                      >
                        <img
                          src={image.url}
                          alt="Product"
                          className="img-fluid"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="col-lg-6">
            <div className="ps-lg-4 text-start">

              <p className="text-secondary fw-semibold mb-2">
                {product.brand || "NYKAA STORE"}
              </p>

              <h3 className="fw-bold mb-3">
                {product.productName}
              </h3>

              <p className="text-secondary">
                {product.description}
              </p>

              {/* PRICE */}
              <div className="d-flex align-items-center gap-3 flex-wrap my-4">
                <h4 className="fw-bold mb-0">
                  ₹{discountedPrice.toLocaleString("en-IN")}
                </h4>

                {discount > 0 && (
                  <>
                    <del className="text-secondary">
                      ₹{price.toLocaleString("en-IN")}
                    </del>
                    <span className="text-danger fw-semibold">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-secondary small">
                Inclusive of all taxes
              </p>

              {/* SIZE */}
              {product.sizes?.length > 0 && (
                <div className="my-4">
                  <h6 className="fw-bold mb-3">Select Size</h6>

                  <div className="d-flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        type="button"
                        key={size}
                        className={`btn ${
                          selectedSize === size
                            ? "btn-dark"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COLOUR */}
              {product.colors?.length > 0 && (
                <div className="my-4">
                  <h6 className="fw-bold mb-3">
                    Select Colour: {selectedColor}
                  </h6>

                  <div className="d-flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        type="button"
                        key={color}
                        className={`btn btn-sm ${
                          selectedColor === color
                            ? "btn-dark"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUANTITY */}
              <div className="my-4">
                <h6 className="fw-bold mb-3">Quantity</h6>

                <div className="d-flex align-items-center border rounded"
                  style={{ width: "140px" }}>
                  <button
                    className="btn btn-light rounded-0"
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    −
                  </button>

                  <span className="flex-grow-1 text-center">
                    {quantity}
                  </span>

                  <button
                    className="btn btn-light rounded-0"
                    type="button"
                    disabled={quantity >= Number(product.stock || 1)}
                    onClick={() =>
                      setQuantity(q =>
                        Math.min(Number(product.stock || 1), q + 1)
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {/* STOCK */}
              <p className={`small fw-semibold ${
                Number(product.stock) > 0
                  ? "text-success"
                  : "text-danger"
              }`}>
                {Number(product.stock) > 0
                  ? `${product.stock} items available`
                  : "Out of stock"}
              </p>

              
              {/* ACTION BUTTONS */}
              <div className="d-grid gap-3 mt-4">
                <button
                  type="button"
                  className="btn btn-dark btn-lg"
                  onClick={handleAddToBag}
                  disabled={Number(product.stock) <= 0 || addingToCart}
                >
                  <i className="bi bi-bag me-2"></i>
                  {addingToCart ? "ADDING..." : "ADD TO BAG"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-dark btn-lg"
                  onClick={handleAddToBag}
                  disabled={Number(product.stock) <= 0 || addingToCart}
                >
                  BUY NOW
                </button>
              </div>


              {/* DELIVERY INFORMATION */}
              <div className="mt-4">

                <div className="d-flex gap-3 align-items-center border-bottom py-3">
                  <i className="bi bi-truck fs-4"></i>
                  <div>
                    <h6 className="fw-semibold mb-1">
                      Delivery Information
                    </h6>
                    <p className="small text-secondary mb-0">
                      Delivery details will be available at checkout.
                    </p>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-center border-bottom py-3">
                  <i className="bi bi-arrow-repeat fs-4"></i>
                  <div>
                    <h6 className="fw-semibold mb-1">
                      Return & Exchange
                    </h6>
                    <p className="small text-secondary mb-0">
                      Please check the return policy before ordering.
                    </p>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-center py-3">
                  <i className="bi bi-shield-check fs-4"></i>
                  <div>
                    <h6 className="fw-semibold mb-1">
                      Product Information
                    </h6>
                    <p className="small text-secondary mb-0">
                      Product details are provided by the seller.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer showSocial={false} />
    </div>
  );
}

export default ProductDetails;
