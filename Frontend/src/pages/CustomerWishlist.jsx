
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Wishlist from "../components/Wishlist";

function CustomerWishlist() {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar />

      {/* PAGE CONTENT */}
      <main
        className="container wishlist-page flex-grow-1 pb-5"
        style={{
          paddingTop: "190px",
          maxWidth: "1400px",
        }}
      >


        {/* WISHLIST PRODUCTS */}
        <Wishlist />
      </main>

      <Footer showSocial={false} />
    </div>
  );
}

export default CustomerWishlist;
