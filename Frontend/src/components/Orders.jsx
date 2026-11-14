
import { useState } from "react";

function Orders({
  isAdmin = false,
  customers = [],
  orders = [],
}) {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name || ""} ${customer.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const customer = customers.find(
    (item) => item._id === selectedCustomer
  );

  const visibleOrders = isAdmin
    ? orders.filter((order) => {
        const customerId =
          typeof order.user === "object"
            ? order.user?._id
            : order.user;

        return customerId === selectedCustomer;
      })
    : orders;

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-3 p-md-4">
        <div className="mb-4">
          <h5 className="fw-bold mb-1">
            <i
              className="bi bi-bag-check me-2"
              style={{ color: "#fc2779" }}
            ></i>
            {isAdmin ? "Customer Purchase Orders" : "My Orders"}
          </h5>

          <p className="text-secondary small mb-0">
            {isAdmin
              ? "Select a customer to view their purchase history."
              : "View and track your purchase orders."}
          </p>
        </div>

        {/* ADMIN CUSTOMER SELECTION */}
        {isAdmin && (
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">
                Search Customer
              </label>

              <input
                type="search"
                className="form-control"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">
                Select Customer
              </label>

              <select
                className="form-select"
                value={selectedCustomer}
                onChange={(e) =>
                  setSelectedCustomer(e.target.value)
                }
              >
                <option value="">Choose customer</option>

                {filteredCustomers.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} ({item.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ADMIN SELECTED CUSTOMER */}
        {isAdmin && customer && (
          <div className="bg-light rounded-3 p-3 mb-4">
            <h6 className="fw-bold mb-1">
              {customer.name}
            </h6>

            <p className="small text-secondary mb-0">
              {customer.email}
            </p>
          </div>
        )}

        {/* ORDER CONTENT */}
        {isAdmin && !selectedCustomer ? (
          <div className="text-center border rounded-3 py-5 px-3">
            <i className="bi bi-person-check fs-1 text-secondary"></i>

            <h6 className="fw-bold mt-3">
              Select a Customer
            </h6>

            <p className="text-secondary small mb-0">
              Choose a customer to view their purchase orders.
            </p>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="text-center border rounded-3 py-5 px-3">
            <i className="bi bi-bag-x fs-1 text-secondary"></i>

            <h6 className="fw-bold mt-3">
              No Orders Available
            </h6>

            <p className="text-secondary small mb-0">
              {isAdmin
                ? "Order information will appear here after the Orders API is connected."
                : "Your orders will appear here once the Orders feature is implemented."}
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {visibleOrders.map((order) => (
              <div
                key={order._id}
                className="border rounded-3 p-3"
              >
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                  <h6 className="fw-bold mb-0">
                    Order #{order.orderNumber || order._id}
                  </h6>

                  <span className="badge bg-light text-dark border">
                    {order.status || "Pending"}
                  </span>
                </div>

                <p className="text-secondary small mb-2">
                  {order.createdAt
                    ? new Date(
                        order.createdAt
                      ).toLocaleDateString("en-IN")
                    : "Date unavailable"}
                </p>

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <span className="fw-semibold">
                    Total: ₹
                    {Number(
                      order.totalAmount || 0
                    ).toLocaleString("en-IN")}
                  </span>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled
                    title="Order details will be available later"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
