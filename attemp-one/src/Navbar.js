import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return(
<>
<nav className="nav nav-pills flex-column flex-sm-row">
    <Link className="navbar-brand" to="/">
        <img src="./OIClogo.png" alt="Logo" className="logo" />
      </Link>
        <Link className="flex-sm-fill text-sm-center nav-link active" to="/">Home</Link>
        <Link className="flex-sm-fill text-sm-center nav-link" to="/usermanagement">User Management</Link>
        <Link className="flex-sm-fill text-sm-center nav-link" to="#">News Management</Link>
        <Link className="flex-sm-fill text-sm-center nav-link" to="#">Daily Moods</Link>
        <Link className="flex-sm-fill text-sm-center nav-link" to="/signin">Sign in</Link>
        <a className="flex-sm-fill text-sm-center nav-link disabled" aria-disabled="true">Disabled</a>
      </nav>
</>
)
}
export default Navbar;
