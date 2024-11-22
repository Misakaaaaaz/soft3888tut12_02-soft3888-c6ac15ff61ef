'use client';

import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Box from '@mui/joy/Box';
import Layout from '../components/layout';
import Header from '../components/header';
import Navigation from '../components/navigation';
import './DailyMood.css';

interface Mood {
    id?: number;
    name: string;
    image: string;
}

interface SOSNotification {
    id?: number;
    name: string;
    email: string;
    alertDate: string;
    school: string;
    contact: string;
    batch: string; 
}

export default function DailyMoodPage() {
    const [moodList, setMoodList] = React.useState<Mood[]>([]);

    const [newMood, setNewMood] = React.useState<Mood>({ name: '', image: '' });
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editIndex, setEditIndex] = React.useState<number | null>(null);

    const [sosNotifications, setSosNotifications] = React.useState<SOSNotification[]>([]);
    const [newSOSNotification, setNewSOSNotification] = React.useState<SOSNotification>({
        name: '',
        email: '',
        alertDate: '',
        school: '',
        contact: '',
        batch: ''  
    });
    const [isSOSModalOpen, setIsSOSModalOpen] = React.useState(false);
    const [sosEditIndex, setSosEditIndex] = React.useState<number | null>(null);

    const [searchTerm, setSearchTerm] = React.useState('');
    const [sosSearchTerm, setSosSearchTerm] = React.useState('');

    React.useEffect(() => {
        fetchMoods();
        fetchSOSNotifications();
    }, []);

    // Fetch moods
    const fetchMoods = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/moods`);
            if (!response.ok) {
                throw new Error('Failed to fetch moods');
            }
            const jsonData = await response.json();
            console.log('Fetched Moods:', jsonData); 
            setMoodList(jsonData.data);
        } catch (error) {
            console.error('Error fetching moods:', error);
            setMoodList([]);
        }
    };

    // Fetch SOS notifications
    const fetchSOSNotifications = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sos_messages`);
            const jsonData = await response.json();
            setSosNotifications(jsonData.data);
        } catch (error) {
            console.error('Error fetching SOS notifications:', error);
        }
    };

    // Handle mood input change
    const handleMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMood({ ...newMood, [e.target.name]: e.target.value });
    };

    // Handle SOS input change
    const handleSOSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewSOSNotification({ ...newSOSNotification, [e.target.name]: e.target.value });
    };

    // Submit Mood
    const submitMood = async () => {
        if (!newMood.name || !newMood.image) {
            alert('Please fill in both the name and the image URL.');
            return;
        }

        try {
            const formattedMood = {
                name: newMood.name,
                imageUrl: newMood.image
            };

            if (editIndex !== null) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/moods/${moodList[editIndex].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formattedMood),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error while updating mood! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Updated mood:', data);
            } else {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/moods`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formattedMood),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error while creating mood! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Created mood:', data);
            }

            fetchMoods();
            setNewMood({ name: '', image: '' });
            setIsModalOpen(false);
            setEditIndex(null);
        } catch (error) {
            console.error('Error submitting mood:', error);
            alert('Failed to submit mood. Please try again.');
        }
    };

    // Submit SOS Notification
    const submitSOSNotification = async () => {
        if (!newSOSNotification.name || !newSOSNotification.email || !newSOSNotification.contact) {
            alert('Please fill in the required fields.');
            return;
        }
    
        try {
            const formattedSOSNotification = {
                name: newSOSNotification.name,
                email: newSOSNotification.email,
                school: newSOSNotification.school,
                contact: newSOSNotification.contact,
                batch: newSOSNotification.batch,
                alertDate: new Date().toISOString().slice(0, 10)  
            };
    
            if (sosEditIndex !== null) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sos_messages/${sosNotifications[sosEditIndex].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formattedSOSNotification),
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error while updating SOS notification! Status: ${response.status}`);
                }
    
                const data = await response.json();
                console.log('Updated SOS notification:', data);
            } else {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sos_messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formattedSOSNotification),
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error while creating SOS notification! Status: ${response.status}`);
                }
    
                const data = await response.json();
                console.log('Created SOS notification:', data);
            }
    
            fetchSOSNotifications();
            setNewSOSNotification({
                name: '',
                email: '',
                school: '',
                contact: '',
                batch: '',
                alertDate: ''
            });
            
            setIsSOSModalOpen(false);
            setSosEditIndex(null);
        } catch (error) {
            console.error('Error submitting SOS notification:', error);
            alert('Failed to submit SOS notification. Please try again.');
        }
    };
    

    // Edit Mood
    const editMood = (index: number) => {
        const moodToEdit = moodList[index];
        setNewMood(moodToEdit);
        setIsModalOpen(true);
        setEditIndex(index);
    };

    // Edit SOS Notification
    const editSOSNotification = (index: number) => {
        const sosToEdit = sosNotifications[index];
        setNewSOSNotification(sosToEdit);
        setIsSOSModalOpen(true);
        setSosEditIndex(index);
    };

    const deleteMood = async (index: number) => {
        if (window.confirm('Are you sure you want to delete this mood?')) {
            try {
                const moodToDelete = moodList[index];
                await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/moods/${moodToDelete.id}`, {
                    method: 'DELETE',
                });
                fetchMoods();
            } catch (error) {
                console.error('Error deleting mood:', error);
            }
        }
    };

    const deleteNotification = async (index: number) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                const notificationToDelete = sosNotifications[index];
                await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sos_messages/${notificationToDelete.id}`, {
                    method: 'DELETE',
                });
                fetchSOSNotifications();
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        }
    };

    const sendNotification = (index: number) => {
        alert(`Notification sent to ${sosNotifications[index].contact}`);
    };

    // Search filtering for Mood and SOS Notification
    const filteredMoods = moodList.filter((mood) =>
        mood.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSOSNotifications = sosNotifications?.filter((notification) =>
        notification.name.toLowerCase().includes(sosSearchTerm.toLowerCase()) ||
        notification.batch.toLowerCase().includes(sosSearchTerm.toLowerCase())
    ) || [];


    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <Layout.Root>
                <Navigation />
                <Header />
                <Layout.Main>
                    <Box sx={{ width: '100%', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '2.0rem', fontWeight: 'bold', marginBottom: '30px' }}>Mood Types</h1>
                        <Box sx={{ marginBottom: '20px', display: 'flex', gap: 1 }}>
                            <Button variant="solid" color="primary" onClick={() => setIsModalOpen(true)}>
                                Add Mood
                            </Button>
                            <Input
                                placeholder="Search Moods"
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                sx={{ width: '300px' }}
                            />
                        </Box>

                        {/* Mood Table */}
                        <Box sx={{ overflowX: 'auto', marginBottom: '40px' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mood Name</th>
                                        <th>Mood Image</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMoods.map((mood, index) => (
                                        <tr key={index}>
                                            <td>{mood.name}</td>
                                            <td>
                                                <img src={mood.image || 'https://via.placeholder.com/50'} alt="Mood" style={{ width: '50px', height: '50px' }} />
                                            </td>
                                            <td>
                                                <Button variant="plain" size="sm" data-testid="mood-edit" onClick={() => editMood(index)}>✏️</Button>
                                                <Button variant="plain" data-testid="mood-delete" size="sm" onClick={() => deleteMood(index)}>❌</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>SOS Notifications</h2>
                        <Box sx={{ marginBottom: '20px', display: 'flex', gap: 1 }}>
                            <Button variant="solid" color="primary" onClick={() => setIsSOSModalOpen(true)}>
                                Add SOS Notification
                            </Button>
                            <Input
                                placeholder="Search SOS Notifications (name or batch)"
                                value={sosSearchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSosSearchTerm(e.target.value)}
                                sx={{ width: '300px' }}
                            />
                        </Box>

                        {/* SOS Notification Table */}
                        <Box sx={{ overflowX: 'auto', marginBottom: '40px' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Batch</th>
                                        <th>Alert Date</th>
                                        <th>School</th>
                                        <th>Contact</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSOSNotifications.map((notification, index) => (
                                        <tr key={index}>
                                            <td>{notification.name}</td>
                                            <td>{notification.batch}</td>
                                            <td>{notification.alertDate}</td>
                                            <td>{notification.school}</td>
                                            <td>{notification.contact}</td>
                                            <td>
                                                <Button variant="solid" size="sm" color="primary" onClick={() => sendNotification(index)}>
                                                    Send
                                                </Button>
                                                <Button variant="plain" size="sm" data-testid="sos-edit" onClick={() => editSOSNotification(index)}>✏️</Button>
                                                <Button variant="plain" size="sm" data-testid="sos-delete" onClick={() => deleteNotification(index)}>❌</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    </Box>

                    {/* Mood Modal */}
                    {isModalOpen && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <button className="modal-close" onClick={() => setIsModalOpen(false)}>✖️</button>
                                <div className="modal-body">
                                    <label htmlFor="moodName">Mood Name</label>
                                    <input
                                        id="moodName"
                                        type="text"
                                        name="name"
                                        value={newMood.name}
                                        placeholder="Enter mood"
                                        onChange={handleMoodChange}
                                    />

                                    <label htmlFor="moodImage">Mood Image URL</label>
                                    <input
                                        id="moodImage"
                                        type="text"
                                        name="image"
                                        value={newMood.image}
                                        placeholder="Enter mood image URL"
                                        onChange={handleMoodChange}
                                    />

                                    <button className="submit-button" onClick={submitMood}>Submit</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SOS Modal */}
                    {isSOSModalOpen && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <button className="modal-close" onClick={() => setIsSOSModalOpen(false)}>✖️</button>
                                <div className="modal-body">
                                    <label htmlFor="sosName">Name</label>
                                    <input
                                        id="sosName"
                                        type="text"
                                        name="name"
                                        value={newSOSNotification.name}
                                        onChange={handleSOSChange}
                                    />

                                    <label htmlFor="sosEmail">Email</label>
                                    <input
                                        id="sosEmail"
                                        type="email"
                                        name="email"
                                        value={newSOSNotification.email}
                                        onChange={handleSOSChange}
                                    />

                                    <label htmlFor="sosBatch">Batch</label>
                                    <input
                                        id="sosBatch"
                                        type="text"
                                        name="batch"
                                        value={newSOSNotification.batch}
                                        onChange={handleSOSChange}
                                    />

                                    <label htmlFor="sosSchool">School</label>
                                    <input
                                        id="sosSchool"
                                        type="text"
                                        name="school"
                                        value={newSOSNotification.school}
                                        onChange={handleSOSChange}
                                    />

                                    <label htmlFor="sosContact">Contact</label>
                                    <input
                                        id="sosContact"
                                        type="text"
                                        name="contact"
                                        value={newSOSNotification.contact}
                                        onChange={handleSOSChange}
                                    />

                                    <button className="submit-button" onClick={submitSOSNotification}>Submit SOS Notification</button>
                                </div>
                            </div>
                        </div>
                    )}

                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}
