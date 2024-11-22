import React, { useState } from 'react';
import './UserList.css';


const UserList = ({ initialUsers }) => {
    const [users, setUsers] = useState(initialUsers);

    const [showForm, setShowForm] = useState(false);

    const [newUser, setNewUser] = useState({
        name: '',
        username: '',
        level: ''
    });

    const [search, setSearch] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUser({
            ...newUser,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setUsers([...users, newUser]);
        setNewUser({ name: '', username: '', level: '' });
        setShowForm(false); // Hide form after submission
    };

    const handleDelete = (index) => {
        setUsers(users.filter((_, i) => i !== index));
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value.toLowerCase()); // Update search state
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search)
    );

    return (
        <article className="table-container">
            <h1>User Management</h1>
            <button
                className="btn btn-primary mb-3"
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'Cancel' : 'Add User'}
            </button>
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-3">
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={newUser.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={newUser.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="level" className="form-label">Level</label>
                        <input
                            type="text"
                            className="form-control"
                            id="level"
                            name="level"
                            value={newUser.level}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-success">Add User</button>
                </form>
            )}
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name"
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">User</th>
                        <th scope="col">Level</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                            <tr key={index}>
                                <th scope="row">{index + 1}</th>
                                <td>{user.name}</td>
                                <td>{user.username}</td>
                                <td>{user.level}</td>
                                <td>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(index)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">No users found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </article>
    );
};
export default UserList;
