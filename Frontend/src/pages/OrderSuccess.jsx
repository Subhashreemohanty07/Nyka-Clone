
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <main
        className="container text-center pb-5"
        style={{ paddingTop: "190px" }}
      >
        <div className="bg-white border rounded-3 shadow-sm p-4 p-md-5 mx-auto"
          style={{ maxWidth: "650px" }}
        >
          <i
            className="bi bi-check-circle-fill"
            style={{
              fontSize: "75px",
              color: "#28a745",
            }}
          ></i>

          <h2 className="fw-bold mt-3">
            Order Placed Successfully!
          </h2>

          <p className="text-secondary">
            Thank you for shopping with us.
            Your order has been confirmed.
          </p>

          {order && (
            <div className="bg-light rounded-3 p-3 my-4 text-start">
              <p>
                <strong>Order ID:</strong> {order._id}
              </p>

              <p>
                <strong>Order Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>

              <p>
                <strong>Total Amount:</strong>{" "}
                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
              </p>

              <p>
                <strong>Payment Method:</strong>{" "}
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </p>

              <p className="mb-0">
                <strong>Payment Status:</strong>{" "}
                {order.paymentStatus}
              </p>
            </div>
          )}

          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            <Link
              to="/"
              className="btn btn-outline-secondary"
            >
              Continue Shopping
            </Link>

            <Link
              to="/my-orders"
              className="btn text-white"
              style={{ backgroundColor: "#fc2779" }}
            >
              View My Orders
            </Link>
          </div>
        </div>
      </main>

      <Footer showSocial={false} />
    </div>
  );
}

export default OrderSuccess;
