import React, { useState, useEffect } from 'react';
import './Calendar.css';

const Calendar = ({ sx, initialEvents }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [events, setEvents] = useState(initialEvents || []); // 使用 initialEvents 作为初始事件
    const [selectedDate, setSelectedDate] = useState(null);
    const [newEvent, setNewEvent] = useState({ title: '', startTime: '', endTime: '', memo: '' });
    const [showForm, setShowForm] = useState(false);
    const [editEvent, setEditEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // 当组件挂载时，从后端获取事件数据
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setEvents(data.data || data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleDateClick = (day) => {
        const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(formattedDate);
        setShowForm(true);
    };
    
    const handleClose = () => {
        setShowForm(false);
        setNewEvent({ title: '', startTime: '', endTime: '', memo: '' });
        setSelectedDate(null);
        setEditEvent(null);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (newEvent.startTime >= newEvent.endTime) {
            alert("Start time cannot be later than end time.");
            return;
        }
        if (isEditing) {
            handleSaveEdit();
        } else {
            try {
                const newEventData = {
                    title: newEvent.title,
                    description: newEvent.memo,
                    startDate: `${selectedDate}T${newEvent.startTime}`,
                    endDate: `${selectedDate}T${newEvent.endTime}`,
                    permissionMetadata: JSON.stringify([]), 
                    ownedById: 1, 
                };
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newEventData),
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const createdEvent = await response.json();
                setEvents([...events, createdEvent]);
                handleClose();
            } catch (error) {
                console.error('Error saving event:', error);
            }
        }
    };

    const handleSaveEdit = async () => {
        try {
            const updatedEventData = {
                title: newEvent.title,
                description: newEvent.memo,
                startDate: `${selectedDate}T${newEvent.startTime}`,
                endDate: `${selectedDate}T${newEvent.endTime}`,
                permissionMetadata: editEvent.permissionMetadata,
                ownedById: editEvent.ownedById,
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${editEvent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEventData),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const updatedEvent = await response.json();
            setEvents(events.map(event => (event.id === updatedEvent.id ? updatedEvent : event)));
            handleClose();
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };
    
    const handleDelete = async (eventToDelete) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventToDelete.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setEvents(events.filter(event => event.id !== eventToDelete.id));
            if (showForm) {
                handleClose();
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleEdit = (event) => {
        setEditEvent(event);
        setNewEvent({
            title: event.title,
            startTime: new Date(event.startDate).toISOString().slice(11, 16),
            endTime: new Date(event.endDate).toISOString().slice(11, 16),
            memo: event.description || '',
        });
        setSelectedDate(event.startDate.split('T')[0]);
        setIsEditing(true);
        setShowForm(true);
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const blankDays = Array(firstDayOfMonth).fill(null);

    return (
        <>
            {/* 将标题放置在页面左上角 */}
            <h1 className="calendar-title" style={{ fontSize: '2.0rem', fontWeight: 'bold', position: 'absolute', top: '50px', left: '300px' }}>
                Calendar Management
            </h1>
    
            <div className="calendar-container" style={sx}>
                <div className="calendar-header">
                    <button
                        className="nav-button rectangular-button"
                        onClick={handlePreviousMonth}
                        style={{
                            backgroundColor: 'black',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            fontSize: '18px',
                            border: 'none',
                            cursor: 'pointer',
                            width: '40px',
                        }}
                    >
                        &lt;
                    </button>
                    <span>{monthNames[currentMonth]} {currentYear}</span>
                    <button
                        className="nav-button rectangular-button"
                        onClick={handleNextMonth}
                        style={{
                            backgroundColor: 'black',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            fontSize: '18px',
                            border: 'none',
                            cursor: 'pointer',
                            width: '40px',
                        }}
                    >
                        &gt;
                    </button>
                </div>
                <div className="calendar-grid">
                    {daysOfWeek.map((day, index) => (
                        <div key={index} className="day-header">
                            {day}
                        </div>
                    ))}
                    {blankDays.map((_, index) => (
                        <div key={index} className="calendar-cell empty"></div>
                    ))}
                    {[...Array(daysInMonth)].map((_, index) => {
                        const day = index + 1;
                        return (
                            <div key={day} className="calendar-cell" onClick={() => handleDateClick(day)}>
                                <div className="date">{day}</div>
                                <div className="events">
                                    {events.filter(event => {
                                        const eventDate = new Date(event.startDate);
                                        return (
                                            eventDate.getDate() === day &&
                                            eventDate.getMonth() === currentMonth &&
                                            eventDate.getFullYear() === currentYear
                                        );
                                    }).map((event, i) => (
                                        <div key={i} className="event-dot"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(event);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
    
                {showForm && (
                    <div className="modal-background">
                        <div className="modal-container">
                            <button className="modal-close-button" onClick={handleClose}>&times;</button>
                            <input
                                type="text"
                                placeholder="Title"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="modal-input"
                            />
                            <textarea
                                placeholder="Memo"
                                value={newEvent.memo}
                                onChange={(e) => setNewEvent({ ...newEvent, memo: e.target.value })}
                                className="modal-input"
                                rows="3"
                            ></textarea>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <input
                                    type="text"
                                    value={selectedDate || ''}
                                    readOnly
                                    className="modal-input"
                                />
                                <input
                                    type="time"
                                    value={newEvent.startTime}
                                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                    className="modal-input"
                                    style={{ width: '45%' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <input
                                    type="text"
                                    value={selectedDate || ''}
                                    readOnly
                                    className="modal-input"
                                />
                                <input
                                    type="time"
                                    value={newEvent.endTime}
                                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                    className="modal-input"
                                    style={{ width: '45%' }}
                                />
                            </div>
                            <button onClick={handleSave} className="modal-add-button">
                                {isEditing ? 'Save Changes' : 'Add'}
                            </button>
                            {isEditing && (
                                <button onClick={() => handleDelete(editEvent)} className="modal-delete-button">
                                    Delete Event
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );

};

export default Calendar;