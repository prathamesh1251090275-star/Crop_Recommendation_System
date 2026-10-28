import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">

        <div className="brand">
          <div className="brand-leaf">
            <span>🌱</span>
          </div>

          <div className="brand-content">
            <h1>पीक मित्र</h1>
            <p>
              तुमच्या शेतीसाठी योग्य माहिती,<br />
              योग्य निर्णय
            </p>
          </div>
        </div>

        <div className="language-switch">
          <button className="language-active">मराठी</button>
          <button>EN</button>
        </div>

      </header>


      {/* FARM IMAGE */}
      <section className="dashboard-hero">

        <img
          src="/pik_mitra-bg.png"
          alt="शेत आणि शेतकरी"
        />

      </section>


      {/* FARM DETAILS */}
      <section className="farm-details">

        <button className="farm-detail">

          <div className="detail-icon location-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
              <circle cx="12" cy="9" r="2.3" />
            </svg>
          </div>

          <div className="detail-text">
            <span>जिल्हा</span>
            <strong>लातूर</strong>
          </div>

          <span className="detail-arrow">›</span>

        </button>


        <button className="farm-detail">

          <div className="detail-icon">
            <svg viewBox="0 0 24 24">
              <path d="M4 21V5h16v16" />
              <path d="M8 9h2M14 9h2M8 13h2M14 13h2M8 17h2M14 17h2" />
            </svg>
          </div>

          <div className="detail-text">
            <span>तालुका</span>
            <strong>औसा</strong>
          </div>

          <span className="detail-arrow">›</span>

        </button>


        <button className="farm-detail">

          <div className="detail-icon">
            <svg viewBox="0 0 24 24">
              <path d="M4 20h16" />
              <path d="M6 17l5-10 7 7" />
              <path d="M9 14h5" />
            </svg>
          </div>

          <div className="detail-text">
            <span>जमीन</span>
            <strong>2 एकर</strong>
          </div>

          <span className="detail-arrow">›</span>

        </button>

      </section>


      {/* MAIN ACTIONS */}
      <section className="dashboard-actions">

        {/* Recommendation */}
        <button
          className="dashboard-action action-green"
          onClick={() => navigate("/farm")}
        >

          <div className="action-icon">

            <svg viewBox="0 0 24 24">
              <path d="M12 21V10" />
              <path d="M12 10C7 10 4 7 4 3c5 0 8 2 8 7" />
              <path d="M12 14c5 0 8-3 8-7-5 0-8 2-8 7" />
            </svg>

          </div>

          <div className="action-content">
            <h2>माझ्यासाठी पीक शोधा</h2>
            <p>कोणते पीक योग्य आहे?</p>
          </div>

          <span className="action-arrow">›</span>

        </button>


        {/* Check crop */}
        <button
          className="dashboard-action action-blue"
          onClick={() => navigate("/check-crop")}
        >

          <div className="action-icon">

            <svg viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M16 16l5 5" />
            </svg>

          </div>

          <div className="action-content">
            <h2>माझे पीक तपासा</h2>
            <p>मला हे पीक घ्यायचे आहे</p>
          </div>

          <span className="action-arrow">›</span>

        </button>


        {/* Crop information */}
        <button
          className="dashboard-action action-purple"
          onClick={() => navigate("/crop-facts")}
        >

          <div className="action-icon">

            <svg viewBox="0 0 24 24">
              <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" />
              <path d="M8 4v13a3 3 0 0 0 3 3" />
              <path d="M10 8h6M10 12h6" />
            </svg>

          </div>

          <div className="action-content">
            <h2>पिकांची माहिती पहा</h2>
            <p>कोणत्याही पिकाबद्दल जाणून घ्या</p>
          </div>

          <span className="action-arrow">›</span>

        </button>

      </section>


      {/* BOTTOM NAVIGATION */}
      <nav className="bottom-nav">

        <button
          className="nav-button active"
          onClick={() => navigate("/dashboard")}
        >
          <span>⌂</span>
          <small>मुख्यपृष्ठ</small>
        </button>

        <button
          className="nav-button"
          onClick={() => navigate("/compare")}
        >
          <span>♢</span>
          <small>तुलना</small>
        </button>

        <button
          className="nav-button"
          onClick={() => navigate("/history")}
        >
          <span>◷</span>
          <small>इतिहास</small>
        </button>

        <button
          className="nav-button"
          onClick={() => navigate("/profile")}
        >
          <span>♙</span>
          <small>प्रोफाइल</small>
        </button>

      </nav>

    </div>
  );
}

export default Dashboard;