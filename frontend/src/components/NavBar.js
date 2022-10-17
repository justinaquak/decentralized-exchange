import React from 'react'
import './styles.css'

function NavBar() {
  return (
    <div className="navbar-outer-box">
      <div className="navbar-inner-box">
        <div className="navbar-left-content">
          <img className="navbar-icon" alt="dex-icon" src="./chemistry.png" /> 
          <div className="navbar-title">D' Chemical Exchange</div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
