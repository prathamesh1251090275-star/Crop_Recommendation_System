import { useNavigate } from "react-router-dom";

function Splash() {
  const navigate = useNavigate();

  return (
    <div className="splash-page">

      {/* Dark green overlay */}
      <div className="splash-overlay"></div>

      <div className="splash-content">

        {/* Logo / Title */}
        <div className="splash-logo">
          <div className="leaf-icon">🌱</div>

          <h1>पीक मित्र</h1>

          <div className="logo-curve"></div>

          <p>
            शेतकऱ्यांचा विश्वास,<br />
            उज्ज्वल भविष्य
          </p>
        </div>


        {/* Start Button */}
        <button
          className="start-button"
          onClick={() => navigate("/dashboard")}
        >
          <span>सुरू करा</span>
          <span className="arrow">→</span>
        </button>


        {/* Description */}
        <p className="splash-description">
          तुमच्या शेतासाठी योग्य पिकाची माहिती मिळवा
        </p>


        {/* Features */}
        <div className="feature-container">

          {/* Feature 1 */}
          <div className="feature-item">
            <div className="feature-icon">🌱</div>
            <p>
              योग्य पिकाची
              <br />
              शिफारस
            </p>
          </div>


          {/* Feature 2 */}
          <div className="feature-item">
            <div className="feature-icon">☀️</div>
            <p>
              हवामान
              <br />
              माहिती
            </p>
          </div>


          {/* Feature 3 */}
          <div className="feature-item">
            <div className="feature-icon">🌿</div>
            <p>
              माती
              <br />
              विश्लेषण
            </p>
          </div>


          {/* Feature 4 */}
          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <p>
              बाजारभाव
              <br />
              माहिती
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Splash;