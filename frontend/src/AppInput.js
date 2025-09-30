import React, { useState, useRef } from "react";
import "./AppInput.css";

function AppInput({ onSubmit }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);   
      setInput("");     
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; 
      }
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value);

    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";                
      el.style.height = `${el.scrollHeight}px`; 
    }
  };

  return (
    <>
      <nav className="navbar-main">
        <div className="navbar-content">
          <span className="navbar-logo">AI App Builder</span>
          <ul className="navbar-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>
      </nav>

      <div className="chat-page">
        <div className="chat-wrapper">
          <h1 className="chat-header"> Ideas into Reality</h1>
          <h2 className="chat-header2">Generate a mock UI in seconds!</h2>
          <form className="chat-input-container" onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Describe your app..."
              value={input}
              onChange={handleChange}
              rows={1} 
            />
            <button type="submit" className="send-btn">
              ➤
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AppInput;
