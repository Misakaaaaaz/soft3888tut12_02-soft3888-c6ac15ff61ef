'use client';

import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Layout from '@/app/components/layout';
import Header from '@/app/components/header';
import Navigation from '@/app/components/navigation';

import './School.css';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile: string;
    school: School | string | null;
    access: string;
    relatedNames: string[];
}

interface School {
    id?: string;
    name: string;
    adminUserId?: string | number;
    adminUser: User | string | null;
}

export default function SchoolManagementPage() {
    const [isSchoolModalOpen, setIsSchoolModalOpen] = React.useState(false);
    const [schools, setSchools] = React.useState<School[]>([]);
    const [filteredSchools, setFilteredSchools] = React.useState<School[]>([]); // New state for filtered schools
    const [newSchool, setNewSchool] = React.useState<School>({ name: '', adminUser: null });
    const [editIndex, setEditIndex] = React.useState<number | null>(null);
    const [search, setSearch] = React.useState('');
    const [users, setUsers] = React.useState<User[]>([]);

    // Fetch users and schools on component mount
    React.useEffect(() => {
        fetchSchoolsWithUsers();
    }, []);

    const fetchSchoolsWithUsers = async () => {
        try {
            console.log('Fetching users...');
            const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, {
                credentials: 'include',
            });
            const usersData = await usersResponse.json();

            const fetchedUsers: User[] = usersData.data || [];
            console.log('Users fetched:', fetchedUsers);
            setUsers(fetchedUsers);

            console.log('Fetching schools...');
            const schoolsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schools`);
            const schoolsData = await schoolsResponse.json();

            let fetchedSchools: School[] = Array.isArray(schoolsData.data)
                ? schoolsData.data
                : [];

            const schoolsWithAdminDetails = fetchedSchools.map((school) => {
                const adminUser = fetchedUsers.find((user: User) =>
                    String(user.id) === String(school.adminUserId)
                );
                return { ...school, adminUser: adminUser || null };
            });

            console.log('Schools with admin details:', schoolsWithAdminDetails);
            setSchools(schoolsWithAdminDetails);
            setFilteredSchools(schoolsWithAdminDetails); // Initialize filteredSchools with all schools
        } catch (error) {
            console.error('Failed to fetch users or schools:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSchool((prevSchool) => ({
            ...prevSchool,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!newSchool.name) {
            console.error('All fields are required');
            alert('Please fill out all required fields.');
            const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement | null;
            nameInput?.focus();
            return;
        }

        console.log('Adding/updating school:', newSchool);

        try {
            const payload = {
                name: newSchool.name,
                adminUserId:
                    newSchool.adminUser && typeof newSchool.adminUser === 'object'
                        ? newSchool.adminUser.id
                        : newSchool.adminUser,
            };

            const submitButton = document.querySelector('.submit-button') as HTMLButtonElement | null;
            if (submitButton) submitButton.disabled = true;

            let response: Response;

            if (editIndex !== null) {
                // Editing an existing school
                console.log(`Updating school with ID: ${schools[editIndex].id}`);
                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schools/${schools[editIndex].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(`Failed to update school: ${errorMessage}`);
                }

                const responseData = await response.json();
                console.log('responseData:', responseData); // For debugging

                const updatedSchool: School = responseData; // Assuming the API returns the updated school object directly

                // Update the adminUser in the updatedSchool
                if (updatedSchool.adminUserId) {
                    const adminUser = users.find((user) => String(user.id) === String(updatedSchool.adminUserId));
                    if (adminUser) {
                        updatedSchool.adminUser = adminUser;
                    }
                } else {
                    updatedSchool.adminUser = null;
                }

                // Update the schools state
                setSchools((prevSchools) => {
                    const updatedSchools = [...prevSchools];
                    updatedSchools[editIndex!] = { ...updatedSchools[editIndex!], ...updatedSchool };
                    return updatedSchools;
                });

                // Also update filteredSchools
                setFilteredSchools((prevFiltered) => {
                    const updatedFiltered = [...prevFiltered];
                    updatedFiltered[editIndex!] = { ...updatedFiltered[editIndex!], ...updatedSchool };
                    return updatedFiltered;
                });

                // Clear the form after editing
                setNewSchool({ name: '', adminUser: null });
            } else {
                // Adding a new school
                console.log('Creating a new school...');
                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schools`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(`Failed to create school: ${errorMessage}`);
                }

                const responseData = await response.json();
                console.log('responseData:', responseData); // For debugging

                const createdSchool: School = responseData; // Assuming the API returns the school object directly

                if (createdSchool.adminUserId) {
                    const adminUser = users.find(
                        (user) => String(user.id) === String(createdSchool.adminUserId)
                    );
                    if (adminUser) {
                        createdSchool.adminUser = adminUser;
                    }
                } else {
                    createdSchool.adminUser = null;
                }

                // Update the schools state
                setSchools((prevSchools) => [...prevSchools, createdSchool]);

                // Also update filteredSchools
                setFilteredSchools((prevFiltered) => [...prevFiltered, createdSchool]);

                // Clear the form after adding
                setNewSchool({ name: '', adminUser: null });
            }

            closeSchoolModal();
            alert(editIndex !== null ? 'School updated successfully!' : 'School created successfully!');
        } catch (error) {
            console.error('Failed to save school:', error);

            if (error instanceof Error) {
                alert(`Error: ${error.message}`);
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
        } finally {
            const submitButton = document.querySelector('.submit-button') as HTMLButtonElement | null;
            if (submitButton) submitButton.disabled = false;

            const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement | null;
            nameInput?.focus(); // Focus back on the name input
        }
    };

    React.useEffect(() => {
        console.log('Schools state updated:', schools);
    }, [schools]);

    const handleEdit = (index: number) => {
        setEditIndex(index);
        setNewSchool(schools[index]);
        setIsSchoolModalOpen(true);
    };

    const handleDelete = async (index: number) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schools/${schools[index].id}`, {
                method: 'DELETE',
            });
            fetchSchoolsWithUsers();
            alert('School deleted successfully!');
        } catch (error) {
            console.error('Failed to delete school:', error);
            alert('Failed to delete school. Please try again.');
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const filterSchools = () => {
        const trimmedSearch = search.trim().toLowerCase();
        if (!trimmedSearch) {
            setFilteredSchools(schools);
        } else {
            const filtered = schools.filter((school) =>
                school?.name?.toLowerCase().includes(trimmedSearch)
            );
            setFilteredSchools(filtered);
        }
    };

    const resetSearch = () => {
        setSearch('');
        setFilteredSchools(schools);
    };

    const openSchoolModal = (index: number | null = null) => {
        if (index !== null) {
            setNewSchool(schools[index]);
            setEditIndex(index);
        }
        setIsSchoolModalOpen(true);
    };

    const closeSchoolModal = () => {
        setIsSchoolModalOpen(false);
        setNewSchool({ name: '', adminUser: null });
        setEditIndex(null);
    };

    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <Layout.Root>
                <Navigation />
                <Header />
                <Layout.Main>
                    <div>
                        <h1 style={{ fontSize: '2.0rem', fontWeight: 'bold', marginBottom: '30px' }}>School Management</h1>

                        <Box sx={{ marginBottom: '20px', display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Button variant="solid" color="primary" onClick={() => openSchoolModal()}>
                                Create School
                            </Button>

                            {/* Modal for Create or Edit Schools */}
                            {isSchoolModalOpen && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <button className="modal-close" onClick={closeSchoolModal}>✖️</button>
                                        <div className="modal-body">
                                            <label>School Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                placeholder="School Name"
                                                value={newSchool.name}
                                                onChange={handleChange}
                                            />

                                            <label>Admin User (optional)</label>
                                            <select
                                                className="form-select"
                                                aria-label="Admin User"
                                                name="adminUser"
                                                value={newSchool.adminUser ? (typeof newSchool.adminUser === 'object' ? newSchool.adminUser.id : newSchool.adminUser) : ''}
                                                onChange={(e) => {
                                                    const selectedUserId = e.target.value || null;
                                                    const selectedUser = users.find((user) => String(user.id) === String(selectedUserId));
                                                    setNewSchool((prevSchool) => ({
                                                        ...prevSchool,
                                                        adminUser: selectedUser || selectedUserId,
                                                    }));
                                                }}
                                            >
                                                <option value="">No Admin User</option>
                                                {users.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.firstName} {user.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button className="submit-button" type="button" onClick={handleSubmit}>Submit</button>
                                    </div>
                                </div>
                            )}

                            {/* Search Input with Search and Reset Buttons */}
                            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                                <Input
                                    placeholder="Search schools..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    endDecorator={<Button variant="outlined" onClick={filterSchools}>Search</Button>}
                                    sx={{ width: '300px' }}
                                />
                                <Button variant="outlined" onClick={resetSearch}>
                                    Reset
                                </Button>
                            </Box>
                        </Box>

                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Admin</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSchools.length > 0 ? (
                                    filteredSchools.map((school, index) => (
                                        <tr key={school.id || index}>
                                            <td>{index + 1}</td>
                                            <td>{school.name}</td>
                                            <td>
                                                {typeof school.adminUser === 'object' && school.adminUser !== null && 'lastName' in school.adminUser
                                                    ? `${school.adminUser.firstName ? school.adminUser.firstName + ' ' : ''}${school.adminUser.lastName}`
                                                    : 'No Admin'}
                                            </td>
                                            <td>
                                                <Button variant="plain" size="sm" onClick={() => handleEdit(index)}>✏️</Button>
                                                <Button variant="plain" size="sm" onClick={() => handleDelete(index)}>❌</Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center">No schools found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}
