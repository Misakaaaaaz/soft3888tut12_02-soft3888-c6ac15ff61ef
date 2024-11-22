import React from "react";
import { Route, Routes } from 'react-router-dom';
import Header from "./Header";
import UserList from "./UserList";
import Navbar from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';

const SignInPage = () => {
  return (
    <div className="container mt-5">
      <h2>Sign In</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input type="text" className="form-control" id="username" />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" id="password" />
        </div>
        <button type="submit" className="btn btn-primary">Sign In</button>
      </form>
    </div>
  );
};

const App = () => {
  const initialUsers = [
    { name: 'Mark', username: 'Otto', level: '@mdo' },
    { name: 'Jacob', username: 'Thornton', level: '@fat' },
    { name: 'Larry the Bird', username: '', level: '@twitter' }
  ];

  return (
    <div className="App">
      <Navbar/>
      <Routes>
        <Route path="/usermanagement" element={<UserList initialUsers={initialUsers} />} />
        <Route path="/signin" element={<SignInPage />} />
        {/* Add other routes as needed */}
      </Routes>
    </div>
  );
};

export default App;