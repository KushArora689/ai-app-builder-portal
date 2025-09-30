import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AppInput from "./AppInput";
import "./App.css";

function RenderPage({ page }) {
  if (page.type === "table") {
    return (
      <div className="page-card">
        <h3>{page.name}</h3>
        <table>
          <thead>
            <tr>
              {page.columns.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.data?.map((row, i) => (
              <tr key={i}>
                {page.columns.map((col, j) => (
                  <td key={j}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (page.type === "form") {
    return (
      <div className="page-card">
        <h3>{page.name}</h3>
        <div className="form-box">
          {page.fields.map((field, i) => (
            <input key={i} type="text" placeholder={field} />
          ))}
          <button className="btn-primary">Submit</button>
        </div>
      </div>
    );
  }

  return null;
}

function DynamicNavbar({ items, active, setActive, appName, onSwitchRole  }) {
  return (
    <div className="navbar">
      <div className="navbar-inner">
        <h2 className="navbar-title">{appName}</h2>
        
        <div className="navbar-links">
          {items?.map((item, idx) => (
            <button
              key={idx}
              className={`nav-btn ${active === item ? "active" : ""}`}
              onClick={() => setActive(item)}
            >
              {item}
            </button>
          ))}
          <button className="switch-btn" onClick={onSwitchRole}>Switch Role</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [description, setDescription] = useState("");
  const [allRequirements, setAllRequirements] = useState([]);
  const [requirements, setRequirements] = useState(null);
  const [loggedInRole, setLoggedInRole] = useState(null); // 👈 login role
  const [activeNavbar, setActiveNavbar] = useState("Home");
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomRef = useRef(null);

  const handleSubmit = async (desc) => {
    try {
      console.log("sending to backend:", desc);
      setDescription(desc);
      setLoading(true);
      const res = await axios.post("https://ai-app-builder-portal.onrender.com/api/requirements", {
        description: desc,
      });
      console.log("Backend JSON returned:", res.data);
      setRequirements(res.data);
      setLoggedInRole(null); 
      setActiveNavbar(res.data.navbar?.[0] || "Home");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const fetchRequirements = async () => {
    try {
      const res = await axios.get("https://ai-app-builder-portal.onrender.com/api/requirements");
      console.log("📦 All requirements from DB:", res.data);
      setAllRequirements(res.data);
    } catch (err) {
      console.error("Error fetching requirements:", err.message);
    }
  };

  fetchRequirements();
}, []);


  // auto scroll when UI generated
  useEffect(() => {
    if (requirements && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [requirements]);

  // filter pages by navbar + role
  const pagesToRender =
    requirements && loggedInRole
      ? requirements.pages.filter(
          (p) =>
            p.role === loggedInRole &&
            (requirements.navbarPages?.[activeNavbar]?.includes(p.name) ||
              !requirements.navbarPages?.[activeNavbar])
        )
      : [];

  return (
    <>

      {/* drawer for all generated apps */}
    <div className={`drawer ${drawerOpen ? "open" : ""}`}>
      <div
        className={`drawer-handle ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        {drawerOpen ? "‹" : "›"}
      </div>

      <div className="drawer-content">
        <h3 className="drawer-title">All Apps</h3>
        {allRequirements.length > 0 ? (
          <ul className="drawer-list">
            {[...allRequirements].reverse().map((req, idx) => (
              <li key={idx} className="drawer-item">
                <div className="drawer-item-text">
                  <strong className="drawer-app-name">{req.appName}</strong>
                  <p className="drawer-description">{req.description}</p>
                </div>
                <button
                  className="drawer-load-btn"
                  onClick={() => {
                    setRequirements(req);
                    setLoggedInRole(null);
                    setActiveNavbar(req.navbar?.[0] || "Home");
                    setDrawerOpen(false);
                  }}
                >
                  Load App
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="drawer-empty">No apps generated yet.</p>
        )}
      </div>
    </div>

    <div className="app-container">
      <AppInput onSubmit={handleSubmit} />
     
      
      <div className={`loading-overlay ${loading ? "show" : "hide"}`}>
        <div className="spinner"></div>
        <h3 style={{ color: "white", marginTop: "1rem" }}>Generating UI...</h3>
      </div>

      {/* main content ( its blurred when loading) */}
      <div className={loading ? "blurred" : "unblurred"}>
        {requirements && (
          <>
            <h1
              style={{
                color: "white",
                textAlign: "center",
                marginBottom: "150px",
                fontSize: "40px",
              }}
            >
              Your generated App
            </h1>
            <div className="apple-mock-window">
              <div className="apple-mock-window-header">
                <span className="apple-mock-dot red"></span>
                <span className="apple-mock-dot yellow"></span>
                <span className="apple-mock-dot green"></span>
                <span className="apple-mock-title">
                  {requirements.appName}
                </span>
              </div>

              <div className="apple-mock-window-content">
                {!loggedInRole ? (
                  <div className="role-login">
                    <h2 className="role-select-title">Select your role to continue</h2>

                    {/* this is for to get all roles */}

                    {/* {requirements.roles.map((role, idx) => (
                      <button
                        key={idx}
                        className="login-btn"
                        onClick={() => setLoggedInRole(role)}
                      >
                        {role}
                      </button>
                    ))} */}

                    {requirements.roles
                      .filter((role) =>
                        requirements.pages.some((p) => p.role === role)
                      )
                      .map((role, idx) => (
                        <button
                          key={idx}
                          className="login-btn"
                          onClick={() => setLoggedInRole(role)}
                        >
                          {role}
                        </button>
                      ))}

                  </div>
                ) : (
                  <>
                   
                    {requirements?.navbar && ( 
                      <>
                      <DynamicNavbar
                        appName={requirements.appName}
                        onSwitchRole={() => setLoggedInRole(null)}
                      />
                    

                    <div className="navbar-links-below">
      {requirements.navbar
        .filter((item) =>
          requirements.pages.some(
            (p) =>
              p.role === loggedInRole &&
              requirements.navbarPages?.[item]?.includes(p.name)
          )
        )
        .map((item, idx) => (
          <button
            key={idx}
            className={`nav-btn ${activeNavbar === item ? "active" : ""}`}
            onClick={() => setActiveNavbar(item)}
          >
            {item}
          </button>
        ))}
    </div>
  </>
)}


                    {pagesToRender.map((page, idx) => (
                      <RenderPage key={idx} page={page} />
                    ))}
                  </>
                )}
              </div>
            </div>
          </>
        )}
        
        

        <div ref={bottomRef}></div>
      </div>
    </div>
  </>
  );
}

export default App;
