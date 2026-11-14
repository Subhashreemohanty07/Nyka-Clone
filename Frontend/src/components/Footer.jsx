
import { Link } from "react-router-dom";

function Footer({ showSocial = true })  {
  return (
    <>
      {/* SOCIAL MEDIA SECTION */}
      {showSocial && (
      <section className="social-section container-fluid text-center">
        <h2>COME SAY HI TO US</h2>

        <div className="social-icons d-flex justify-content-center align-items-center flex-wrap gap-4">

          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle"
            aria-label="Facebook"
          >
            <i className="bi bi-facebook"></i>
          </a>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle"
            aria-label="Instagram"
          >
            <i className="bi bi-instagram"></i>
          </a>

          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle"
            aria-label="YouTube"
          >
            <i className="bi bi-youtube"></i>
          </a>

          <a
            href="https://x.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle"
            aria-label="X"
          >
            <i className="bi bi-twitter-x"></i>
          </a>

        </div>
      </section>
      )}

      {/* FOOTER */}
      <footer className="nykaa-footer" id="help">

        {/* FOOTER TOP */}
        <div className="footer-top row g-4">

          {/* NEWSLETTER */}
          <div className="footer-newsletter col-12 col-md-4">
            <h5>
              <i className="bi bi-envelope"></i>
              Get special discount on your inbox
            </h5>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing!");
              }}
            >
              <input
                type="email"
                placeholder="Your Email"
                required
              />

              <button type="submit">SEND</button>
            </form>
          </div>

          {/* MOBILE APP */}
          <div className="col-12 col-md-4">
            <h5>
              <i className="bi bi-phone"></i>
              EXPERIENCE THE NYKAA MOBILE APP
            </h5>

            <div className="app-links d-flex flex-wrap gap-2">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-google-play"></i> Google Play
              </a>

              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-apple"></i> App Store
              </a>
            </div>
          </div>

          {/* CONTACT */}
          <div className="col-12 col-md-4">
            <h5>
              <i className="bi bi-telephone"></i>
              FOR ANY HELP, YOU MAY CALL US AT
            </h5>

            <p>1800-267-4444</p>
            <p>(All days, 8 AM to 10 PM)</p>
          </div>

        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom row g-4">

          <div className="footer-brand col-6 col-lg">
            <h2>
              <Link to="/">nykaa</Link>
            </h2>
            <p>Who are we?</p>
            <p>Careers</p>
            <p>Authenticity</p>
            <p>Press</p>
            <p>Testimonials</p>
            <p>Sustainability</p>
            <p>Investor Relations</p>
          </div>

          <div className="col-6 col-lg">
            <h5>Help</h5>
            <a href="#help">Contact Us</a>
            <a href="#help">Frequently Asked Questions</a>
            <a href="#help">Store Locator</a>
            <a href="#help">Cancellation & Return</a>
            <a href="#help">Shipping & Delivery</a>
            <a href="#help">Sell on Nykaa</a>
          </div>

          <div className="col-6 col-lg">
            <h5>Inspire Me</h5>
            <a href="#categories">Beauty Book</a>
            <a href="#categories">Games Board</a>
            <a href="#categories">Buying Guides</a>
          </div>

          <div className="col-6 col-lg">
            <h5>Quick Links</h5>
            <a href="#offers">Offer Zone</a>
            <a href="#categories">New Launches</a>
            <a href="#men">Nykaa Man</a>
            <a href="#women">Nykaa Fashion</a>
            <a href="#brands">Nykaa Pro</a>
            <a href="#footer">Sitemap</a>
          </div>

          <div className="col-6 col-lg">
            <h5>Top Categories</h5>
            <a href="#categories">Makeup</a>
            <a href="#categories">Skin</a>
            <a href="#categories">Hair</a>
            <a href="#categories">Bath & Body</a>
            <a href="#categories">Appliances</a>
            <a href="#women">Women</a>
            <a href="#men">Men</a>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="copyright">
          © {new Date().getFullYear()} Nykaa Clone. Made with love.
        </div>

      </footer>
    </>
  );
}

export default Footer;
