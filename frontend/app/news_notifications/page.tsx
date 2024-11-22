'use client';

import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Box from '@mui/joy/Box';
import Select from '@mui/joy/Select'; 
import Option from '@mui/joy/Option'; 
import Chip from '@mui/joy/Chip';     
import Layout from '../components/layout';
import Header from '../components/header';
import Navigation from '../components/navigation';

import './NewsNotificationsManagement.css';

interface School {
    id: string;
    name: string;
}

interface News {
    id: string;
    title: string;
    url: string;
    date: string;
    schools: School[];
}

interface Notification {
    id: string;
    title: string;
    content: string;
    date: string;
    schools: School[];
}

export default function NewsNotificationManagementPage() {
    const [isNewsModalOpen, setIsNewsModalOpen] = React.useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = React.useState(false);

    const [newsList, setNewsList] = React.useState<News[]>([]);
    const [notificationList, setNotificationList] = React.useState<Notification[]>([]);
    const [schools, setSchools] = React.useState<School[]>([]);

    const [newNews, setNewNews] = React.useState<News>({ id: '', title: '', url: '', date: '', schools: [] });
    const [newNotification, setNewNotification] = React.useState<Notification>({ id: '', title: '', content: '', date: '', schools: [] });

    const [editNewsIndex, setEditNewsIndex] = React.useState<number | null>(null);
    const [editNotificationIndex, setEditNotificationIndex] = React.useState<number | null>(null);

    const [newsSearchQuery, setNewsSearchQuery] = React.useState('');
    const [notificationSearchQuery, setNotificationSearchQuery] = React.useState('');

    const [filteredNewsList, setFilteredNewsList] = React.useState<News[]>(newsList);
    const [filteredNotificationList, setFilteredNotificationList] = React.useState<Notification[]>(notificationList);

    React.useEffect(() => {
        fetchNews();
        fetchNotifications();
        fetchSchools();  // Fetch schools for the dropdown
    }, []);

    const fetchSchools = async () => {
        console.log('fetchSchools called');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schools`);
            const data = await response.json();
            console.log('Fetched Data:', data);

            if (Array.isArray(data)) {
                setSchools(data);
            } else if (data.data && Array.isArray(data.data)) {
                setSchools(data.data);
            } else {
                console.error('Unexpected response structure:', data);
            }
        } catch (error) {
            console.error('Failed to fetch schools:', error);
        }
    };

    const fetchNews = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/news`);
            const jsonData = await response.json();
            setNewsList(jsonData.data);
            setFilteredNewsList(jsonData.data);
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`);
            const jsonData = await response.json();
            setNotificationList(jsonData.data);
            setFilteredNotificationList(jsonData.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const openNewsModal = (index: number | null = null) => {
        if (index !== null) {
            setNewNews(newsList[index]);
            setEditNewsIndex(index);
        }
        setIsNewsModalOpen(true);
    };

    const closeNewsModal = () => {
        setIsNewsModalOpen(false);
        setNewNews({ id: '', title: '', url: '', date: '', schools: [] });
        setEditNewsIndex(null);
    };

    const openNotificationModal = (index: number | null = null) => {
        if (index !== null) {
            setNewNotification(notificationList[index]);
            setEditNotificationIndex(index);
        }
        setIsNotificationModalOpen(true);
    };

    const closeNotificationModal = () => {
        setIsNotificationModalOpen(false);
        setNewNotification({ id: '', title: '', content: '', date: '', schools: [] });
        setEditNotificationIndex(null);
    };

    const handleNewsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setNewNews({ ...newNews, [e.target.name]: e.target.value });
    };

    const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setNewNotification({ ...newNotification, [e.target.name]: e.target.value });
    };

    const handleNewsSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewsSearchQuery(e.target.value);
    };

    const handleNotificationSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNotificationSearchQuery(e.target.value);
    };

    const filterNews = () => {
        const filtered = newsList.filter(news =>
            news.title.toLowerCase().includes(newsSearchQuery.toLowerCase())
        );
        setFilteredNewsList(filtered);
    };

    const filterNotifications = () => {
        const filtered = notificationList.filter(notification =>
            notification.title.toLowerCase().includes(notificationSearchQuery.toLowerCase()) ||
            notification.content.toLowerCase().includes(notificationSearchQuery.toLowerCase())
        );
        setFilteredNotificationList(filtered);
    };

    const handleNewsSubmit = async () => {

        if (!newNews.title || !newNews.date || !newNews.url) {
            console.error('All fields are required');
            return;
        }

        let response;

        try {
            const { schools, ...restOfNewNews } = newNews; // Destructure to separate out schools

            const payload = {
                ...restOfNewNews,
                schools: schools && schools.length > 0
                    ? schools.map((school) => school.id) // Map selected schools to their IDs
                    : [], // Empty array if no schools are selected
            };

            console.log("School IDs:", payload);

            if (editNewsIndex !== null) {
                // Update existing news
                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/news/${newsList[editNewsIndex].id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            } else {
                // Create new news
                console.log('Payload:', payload);

                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/news`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                console.log("Response Status: ", response.status);
                console.log("Response Object: ", response);

                if (!response.ok) {
                    throw new Error('Failed to save');
                }

                const createdNews = await response.json();
                console.log('New News Saved: ', createdNews);

                setNewsList((prevNews) => [...prevNews, createdNews]);
            }
            fetchNews(); 
            closeNewsModal(); 
        } catch (error) {
            console.error('Failed to save news:', error);
        }
    };
    
    const handleNotificationSubmit = async () => {

        if (!newNotification.title || !newNotification.date || !newNotification.content) {
            console.error('All fields are required');
            return;
        }

        let response;

        try {
            const { schools, ...restOfNewNotification } = newNotification; // Destructure to separate out schools

            const payload = {
                ...restOfNewNotification,
                schools: schools && schools.length > 0
                    ? schools.map((school) => school.id) // Map selected schools to their IDs
                    : [], // Empty array if no schools are selected
            };

            console.log("School IDs:", payload);

            if (editNotificationIndex !== null) {
                // Update existing notification
                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${notificationList[editNotificationIndex].id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            } else {
                // Create new notification
                console.log('Payload:', payload);

                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                console.log("Response Status: ", response.status);
                console.log("Response Object: ", response);

                if (!response.ok) {
                    throw new Error('Failed to save');
                }

                const createdNotification = await response.json();
                console.log('New Notification Saved: ', createdNotification);

                setNotificationList((prevNotification) => [...prevNotification, createdNotification]);
            }
            fetchNotifications(); 
            closeNotificationModal(); 
        } catch (error) {
            console.error('Failed to save notification:', error);
        }
    };

    const deleteNews = async (index: number) => {
        try {
            const newsToDelete = newsList[index];
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/news/${newsToDelete.id}`, {
                method: 'DELETE',
            });
            fetchNews();
        } catch (error) {
            console.error('Error deleting news:', error);
        }
    };

    const deleteNotification = async (index: number) => {
        try {
            const notificationToDelete = notificationList[index];
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${notificationToDelete.id}`, {
                method: 'DELETE',
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <Layout.Root>
                <Navigation />
                <Header />
                <Layout.Main>
                    <Box sx={{ width: '100%', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '2.0rem', fontWeight: 'bold', marginBottom: '30px' }}>News and Notification Management</h1>

                        {/* News Section */}
                        <Box className="section-container">
                            <Box sx={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="solid" color="primary" onClick={() => openNewsModal()}>
                                        Create News
                                    </Button>
                                    <Input
                                        placeholder="Search News by title..."
                                        value={newsSearchQuery}
                                        onChange={handleNewsSearchQueryChange}
                                        endDecorator={<Button variant="outlined" onClick={filterNews}>Search</Button>}
                                        sx={{ width: '300px' }}
                                    />
                                </Box>

                                <Button
                                    variant="plain"
                                    color="neutral"
                                    size="sm"
                                    component="a"
                                    href="/news_notifications/subscribed_news_channels/"
                                    sx={{
                                        backgroundColor: 'red',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'darkred',
                                        },
                                        alignSelf: 'center',
                                    }}
                                >
                                    Manage Subscribed News Channels
                                </Button>
                            </Box>

                            {/* Modal for Create or Edit News */}
                            {isNewsModalOpen && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <button className="modal-close" onClick={closeNewsModal}>✖️</button>
                                        <div className="modal-body">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter title"
                                                name="title"
                                                value={newNews.title}
                                                onChange={handleNewsChange}
                                            />
                                            <label htmlFor="date">Date</label>
                                            <input
                                                type="date"
                                                id="date"
                                                className="form-control"
                                                name="date"
                                                value={newNews.date}
                                                onChange={handleNewsChange}
                                            />

                                            <label>Recipients</label>
                                            <Select
                                                multiple
                                                value={newNews.schools.length > 0 ? newNews.schools.map((schools) => schools.id) : []} // Handle no selected schools (empty array)
                                                onChange={(event, newValue) => {
                                                    const selectedSchools = newValue.length > 0
                                                        ? newValue
                                                            .map((schoolId) => schools.find((school) => school.id === schoolId))
                                                            .filter((school) => school !== undefined) // Filter out any undefined values
                                                        : []; // Set to an empty array if no schools are selected
    
                                                    // Update the state with selected schools (or an empty array if none selected)
                                                    setNewNews((prevNews) => ({
                                                        ...prevNews,
                                                        schools: selectedSchools as School[] // Store the array of selected schools, or empty
                                                    }));
                                                }}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                        {selected.map((option, i) => {
                                                            const schoolId = option.value;
                                                            const recipients = schools.find((s) => s.id === schoolId);
                                                            return (
                                                                <Chip key={i} variant="soft" color="primary">
                                                                    {recipients?.name}
                                                                </Chip>
                                                            );
                                                        })}
                                                    </Box>
                                                )}
                                                sx={{ minWidth: '15rem' }}
                                            >
                                                {schools.map((school) => (
                                                    <Option key={school.id} value={school.id}>
                                                        {school.name}
                                                    </Option>
                                                ))}
                                            </Select>

                                            <label>URL</label>
                                            <textarea
                                                className="form-control"
                                                placeholder="Enter URL"
                                                name="url"
                                                value={newNews.url}
                                                onChange={handleNewsChange}
                                            />
                                        </div>
                                        <button className="submit-button" onClick={handleNewsSubmit}>Submit</button>
                                    </div>
                                </div>
                            )}
                            <Box sx={{ overflowX: 'auto', marginBottom: '40px' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>News Title</th>
                                            <th>News URL</th>
                                            <th>Date</th>
                                            <th>Recipients</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(filteredNewsList) && filteredNewsList.map((news, index) => (
                                            <tr key={index}>
                                                <td>{news.title}</td>
                                                <td>
                                                    <a href={news.url} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                                                        {news.url}
                                                    </a>
                                                </td>
                                                <td>{news.date}</td>
                                                <td>
                                                {Array.isArray(news.schools) && news.schools.length > 0
                                                    ? news.schools.map((s, i) => (
                                                        <span key={i}>
                                                        {s?.name}{i < news.schools.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))
                                                    : 'No School'
                                                }
                                                </td>
                                                <td>
                                                    <Button variant="plain" size="sm" onClick={() => openNewsModal(index)}>✏️</Button>
                                                    <Button variant="plain" size="sm" onClick={() => deleteNews(index)}>❌</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        </Box>

                        {/* Notification Section */}
                        <Box className="section-container">
                            <Box sx={{ marginBottom: '20px', display: 'flex', gap: 1 }}>
                                <Button variant="solid" color="primary" onClick={() => openNotificationModal()}>
                                    Create Notification
                                </Button>
                                <Input
                                    placeholder="Search Notification by title or content..."
                                    value={notificationSearchQuery}
                                    onChange={handleNotificationSearchQueryChange}
                                    endDecorator={<Button variant="outlined" onClick={filterNotifications}>Search</Button>}
                                    sx={{ width: '300px' }}
                                />
                            </Box>

                            {isNotificationModalOpen && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <button className="modal-close" onClick={closeNotificationModal}>✖️</button>
                                        <div className="modal-body">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter title"
                                                name="title"
                                                value={newNotification.title}
                                                onChange={handleNotificationChange}
                                            />
                                            <label htmlFor="date">Date</label>
                                            <input
                                                type="date"
                                                id="date"
                                                className="form-control"
                                                name="date"
                                                value={newNotification.date}
                                                onChange={handleNotificationChange}
                                            />

                                            <label>Recipients</label>
                                            <Select
                                                multiple
                                                value={newNotification.schools.length > 0 ? newNotification.schools.map((schools) => schools.id) : []} // Handle no selected schools (empty array)
                                                onChange={(event, newValue) => {
                                                    // If no schools are selected, `newValue` will be an empty array
                                                    const selectedSchools = newValue.length > 0
                                                        ? newValue
                                                            .map((schoolId) => schools.find((school) => school.id === schoolId))
                                                            .filter((school) => school !== undefined) // Filter out any undefined values
                                                        : []; // Set to an empty array if no schools are selected
    
                                                    // Update the state with selected schools (or an empty array if none selected)
                                                    setNewNotification((prevNotification) => ({
                                                        ...prevNotification,
                                                        schools: selectedSchools as School[] // Store the array of selected schools, or empty
                                                    }));
                                                }}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                        {selected.map((option, i) => {
                                                            const schoolId = option.value;
                                                            const school = schools.find((s) => s.id === schoolId);
                                                            return (
                                                                <Chip key={i} variant="soft" color="primary">
                                                                    {school?.name}
                                                                </Chip>
                                                            );
                                                        })}
                                                    </Box>
                                                )}
                                                sx={{ minWidth: '15rem' }}
                                            >
                                                {schools.map((school) => (
                                                    <Option key={school.id} value={school.id}>
                                                        {school.name}
                                                    </Option>
                                                ))}
                                            </Select>

                                            <label>Content</label>
                                            <textarea
                                                className="form-control"
                                                placeholder="Enter content"
                                                name="content"
                                                value={newNotification.content}
                                                onChange={handleNotificationChange}
                                            />
                                        </div>
                                        <button className="submit-button" onClick={handleNotificationSubmit}>Submit</button>
                                    </div>
                                </div>
                            )}
                            <Box sx={{ overflowX: 'auto' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Notification Title</th>
                                            <th>Notification Content</th>
                                            <th>Date</th>
                                            <th>Recipients</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(filteredNotificationList) && filteredNotificationList.map((notification, index) => (
                                            <tr key={index}>
                                                <td>{notification.title}</td>
                                                <td>{notification.content}</td>
                                                <td>{notification.date}</td>
                                                <td>
                                                {Array.isArray(notification.schools) && notification.schools.length > 0
                                                    ? notification.schools.map((s, i) => (
                                                        <span key={i}>
                                                        {s?.name}{i < notification.schools.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))
                                                    : 'No School'
                                                }
                                                </td>
                                                <td>
                                                    <Button variant="plain" size="sm" onClick={() => openNotificationModal(index)}>✏️</Button>
                                                    <Button variant="plain" size="sm" onClick={() => deleteNotification(index)}>❌</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        </Box>
                    </Box>
                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}
