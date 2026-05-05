import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import logo from '../assets/logo.png';
import '../styles/notfound.css';

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found | PDR World" description="The page you're looking for doesn't exist." canonical="https://pdrworld.com/404" />
      <div className="nf-wrap">
        <img src={logo} alt="PDR World" className="logo" style={{ marginBottom: 24, height: 48 }} />
        <h1>404</h1>
        <h2>Page not found</h2>
        <p>
          The page you're looking for doesn't exist or may have been moved. If you're looking for a specific product or specification, try
          our product catalogue.
        </p>
        <div className="actions">
          <Link className="btn btn-primary" to="/">Back to Homepage</Link>
          <Link className="btn btn-ghost" to="/products">Browse Products</Link>
          <Link className="btn btn-ghost" to="/contact">Contact Us</Link>
        </div>
        <div className="footer-note">
          © PDR Videotronics India Pvt. Ltd. — <a href="mailto:info@pdrworld.com">info@pdrworld.com</a>
        </div>
      </div>
    </>
  );
}
