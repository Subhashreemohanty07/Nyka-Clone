
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function EditProduct({ product, onClose, onUpdated }) {
  const [editForm, setEditForm] = useState({
    productName: "",
    description: "",
    category: "men",
    subCategory: "",
    brand: "",
    price: "",
    discountPrice: "",
    sizes: "",
    colors: "",
    stock: "",
  });

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // Load the selected product details into the form
  useEffect(() => {
    if (product) {
      setEditForm({
        productName: product.productName || "",
        description: product.description || "",
        category: product.category || "men",
        subCategory: product.subCategory || "",
        brand: product.brand || "",
        price: product.price ?? "",
        discountPrice: product.discountPrice ?? "",
        sizes: Array.isArray(product.sizes)
          ? product.sizes.join(", ")
          : product.sizes || "",
        colors: Array.isArray(product.colors)
          ? product.colors.join(", ")
          : product.colors || "",
        stock: product.stock ?? "",
      });
    }
  }, [product]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!product?._id) return;

    setUpdating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      Object.entries(editForm).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(
        `${API_URL}/api/products/${product._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update product.");
      }

      const updatedProduct = data.product || data.data || data;

      onUpdated?.(updatedProduct);
      onClose();

    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!product) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
        overflowY: "auto",
      }}
    >
      <div
        className="bg-white rounded-4 shadow p-4 w-100"
        style={{
          maxWidth: "650px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">Edit Product</h5>

          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            disabled={updating}
          />
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <form onSubmit={handleUpdateProduct}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              className="form-control"
              value={editForm.productName}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Description
            </label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={editForm.description}
              onChange={handleEditChange}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Category
              </label>
              <select
                name="category"
                className="form-select"
                value={editForm.category}
                onChange={handleEditChange}
                required
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Sub Category
              </label>
              <input
                type="text"
                name="subCategory"
                className="form-control"
                value={editForm.subCategory}
                onChange={handleEditChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              className="form-control"
              value={editForm.brand}
              onChange={handleEditChange}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                className="form-control"
                min="0"
                value={editForm.price}
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Discount Price (₹)
              </label>
              <input
                type="number"
                name="discountPrice"
                className="form-control"
                min="0"
                value={editForm.discountPrice}
                onChange={handleEditChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Sizes (comma separated)
              </label>
              <input
                type="text"
                name="sizes"
                className="form-control"
                placeholder="S, M, L, XL"
                value={editForm.sizes}
                onChange={handleEditChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Colors (comma separated)
              </label>
              <input
                type="text"
                name="colors"
                className="form-control"
                placeholder="Black, Blue, White"
                value={editForm.colors}
                onChange={handleEditChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              className="form-control"
              min="0"
              value={editForm.stock}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={updating}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn text-white"
              style={{ backgroundColor: "#fc2779" }}
              disabled={updating}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
