
function ProductTable({
  products = [],
  loading = false,
  onEdit,
  onDelete,
  onAddToCart,
  showEdit = false,
  showDelete = false,
  showAddToCart = false,
}) {
  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-3 p-md-4">

        {loading ? (
          <p className="text-secondary">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-secondary mb-0">
            No products available.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3">Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.productName}
                            className="rounded"
                            style={{
                              width: "50px",
                              height: "65px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light rounded d-flex justify-content-center align-items-center"
                            style={{
                              width: "50px",
                              height: "65px",
                            }}
                          >
                            <i className="bi bi-image text-secondary"></i>
                          </div>
                        )}

                        <span className="fw-semibold">
                          {product.productName}
                        </span>
                      </div>
                    </td>

                    <td className="text-capitalize">
                      {product.subCategory || product.category}
                    </td>

                    <td>
                      ₹{product.discountPrice || product.price}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          Number(product.stock) > 0
                            ? "bg-success-subtle text-success"
                            : "bg-danger-subtle text-danger"
                        }`}
                      >
                        {Number(product.stock) > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex justify-content-end gap-2 pe-4">
                        {showEdit && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Edit product"
                            onClick={() => onEdit?.(product)}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                        )}

                        {showDelete && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Delete product"
                            onClick={() => onDelete?.(product._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}

                        {showAddToCart && (
                          <button
                            type="button"
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: "#fc2779" }}
                            disabled={Number(product.stock) <= 0}
                            onClick={() => onAddToCart?.(product)}
                          >
                            <i className="bi bi-bag-plus me-1"></i>
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductTable;
