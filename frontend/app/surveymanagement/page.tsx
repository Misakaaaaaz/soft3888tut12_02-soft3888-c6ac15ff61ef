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

import './SurveyManagement.css';

interface School {
    id: string;
    name: string;
}

interface Survey {
    id: string;
    title: string;
    description: string;
    level: string;
    schools: School[];
}

export default function SurveyManagementPage() {
    const [isSurveyModalOpen, setIsSurveyModalOpen] = React.useState(false);
    const [surveyList, setSurveyList] = React.useState<Survey[]>([]);
    const [schools, setSchools] = React.useState<School[]>([]);
    const [newSurvey, setNewSurvey] = React.useState<Survey>({ id: '', title: '', description: '', level: '', schools: [] });
    const [editSurveyIndex, setEditSurveyIndex] = React.useState<number | null>(null);
    const [surveySearchQuery, setSurveySearchQuery] = React.useState('');
    const [filteredSurveyList, setFilteredSurveyList] = React.useState<Survey[]>([]);

    React.useEffect(() => {
        // Initialize the survey list and filtered list on mount
        setFilteredSurveyList(surveyList);
    }, [surveyList]);

    React.useEffect(() => {
        const fetchData = async () => {

            await fetchSchools();

            fetchSurveys();
        };

        fetchData();
    }, []);  // Empty dependency array to ensure it runs once

    const fetchSurveys = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/surveys`)
            const surveys = await res.json()
            setSurveyList(surveys.data)
        } catch (err) {
            console.log('ERROR HERE: ', err)
        }
    }

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

    const openSurveyModal = (index: number | null = null) => {
        if (index !== null) {
            setNewSurvey(surveyList[index]);
            setEditSurveyIndex(index);
        }
        setIsSurveyModalOpen(true);
    };

    const closeSurveyModal = () => {
        setIsSurveyModalOpen(false);
        setNewSurvey({ id: '', title: '', description: '', level: '', schools: [] });
        setEditSurveyIndex(null);
    };

    const handleSurveyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSurvey((prevSurvey) => ({
            ...prevSurvey,
            [name]: value,
        }));
    };


    const handleSurveySearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSurveySearchQuery(e.target.value.toLowerCase());
        filterSurvey();
    };

    const filterSurvey = () => {
        if (!surveySearchQuery) {
            // If the search query is empty, reset the filtered list to the full survey list
            setFilteredSurveyList(surveyList);
        } else {
        const filtered = surveyList.filter(survey =>
            survey.title.toLowerCase().includes(surveySearchQuery.toLowerCase())
        );
        setFilteredSurveyList(filtered);
        }
    };

    const resetSurveys = () => {
        setFilteredSurveyList(surveyList);
    }

    // const submitSurvey = async () => {
    //     const surveyToSubmit = { ...newSurvey };

    //     if (editSurveyIndex !== null) {
    //         // Update existing survey
    //         const updatedSurveyList = [...surveyList];
    //         updatedSurveyList[editSurveyIndex] = surveyToSubmit;
    //         setSurveyList(updatedSurveyList);
    //         setFilteredSurveyList(updatedSurveyList);
    //     } else {
    //         // Add new survey
    //         const updatedSurveyList = [...surveyList, surveyToSubmit];
    //         setSurveyList(updatedSurveyList);
    //         setFilteredSurveyList(updatedSurveyList);
    //     }
    //     closeSurveyModal();
    // };

    const handleSubmit = async () => {
        console.log('consoleSubmit called');
        console.log('newSurvey:', newSurvey);

        if (!newSurvey.title || !newSurvey.description || !newSurvey.level) {
            console.error('All fields are required');
            return;
        }

        let response;

        try {
            const { schools, ...restOfNewSurvey } = newSurvey; // Destructure to separate out schools

            const payload = {
                ...restOfNewSurvey,
                schools: schools && schools.length > 0
                    ? schools.map((school) => school.id) // Map selected schools to their IDs
                    : [], // Empty array if no schools are selected
            };

            console.log("School IDs:", payload);

            if (editSurveyIndex !== null) {
                // Update existing survey
                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/surveys/${surveyList[editSurveyIndex].id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            } else {
                // Create new survey
                console.log('Payload:', payload);

                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/surveys`, {
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

                const createdSurvey = await response.json();
                console.log('New Survey Saved: ', createdSurvey);

                setSurveyList((prevSurveys) => [...prevSurveys, createdSurvey]);
            }

            fetchSurveys(); // Refresh surveys after submission
            closeSurveyModal(); // Close the modal after success
        } catch (error) {
            console.error('Failed to save survey:', error);
        }
    };


    const deleteSurvey = async (id: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/surveys/${id}`, {
                method: 'DELETE'
            })
            const updatedSurveyList = surveyList.filter((survey, i) => survey.id !== id);
            setSurveyList(updatedSurveyList);
            setFilteredSurveyList(updatedSurveyList);
        } catch (err) {
            console.log('ERROR DELETING SURVEY: ', err)
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
                        <h1 style={{ fontSize: '2.0rem', fontWeight: 'bold', marginBottom: '30px' }}>Survey Management</h1>
                        <Box sx={{ marginBottom: '20px', display: 'flex', gap: 1 }}>
                            <Button variant="solid" color="primary" onClick={() => openSurveyModal()}>
                                Add Survey
                            </Button>
                            <Input
                                placeholder="Search Surveys by title"
                                value={surveySearchQuery}
                                onChange={handleSurveySearchQueryChange}
                                endDecorator={<Button variant="outlined" onClick={resetSurveys}>Reset</Button>}
                                sx={{ width: '300px' }}
                            />
                        </Box>

                        {/* Modal for Create or Edit Surveys */}
                        {isSurveyModalOpen && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <button className="modal-close" onClick={closeSurveyModal}>✖️</button>
                                    <div className="modal-body">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter title"
                                            name="title"
                                            value={newSurvey.title}
                                            onChange={handleSurveyChange}
                                        />
                                        <label>Level</label>
                                        <input
                                            type="level"
                                            className="form-control"
                                            placeholder="Enter level"
                                            name="level"
                                            value={newSurvey.level}
                                            onChange={handleSurveyChange}
                                        />

                                        <label htmlFor="school-select">School</label>
                                        <Select
                                            id="school-select"
                                            multiple
                                            value={Array.isArray(newSurvey.schools) && newSurvey.schools.length > 0 ? newSurvey.schools.map((schools) => schools.id) : []} // Handle no selected schools (empty array)
                                            onChange={(event, newValue) => {
                                                // If no schools are selected, `newValue` will be an empty array
                                                const selectedSchools = newValue.length > 0
                                                    ? newValue
                                                        .map((schoolId) => schools.find((school) => school.id === schoolId))
                                                        .filter((school) => school !== undefined) // Filter out any undefined values
                                                    : []; // Set to an empty array if no schools are selected

                                                // Update the state with selected schools (or an empty array if none selected)
                                                setNewSurvey((prevSurvey) => ({
                                                    ...prevSurvey,
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
                                            {/* Render the school options */}
                                            {schools.map((school) => (
                                                <Option key={school.id} value={school.id}>
                                                    {school.name}
                                                </Option>
                                            ))}
                                        </Select>

                                        {/* Display selected schools below */}
                                        <Box sx={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                                            {Array.isArray(newSurvey.schools) && newSurvey.schools.length > 0 ? newSurvey.schools.map((selectedSchool, i) => (
                                                <Chip key={i} variant="soft" color="primary">
                                                    {selectedSchool.name}
                                                </Chip>
                                            )) : <p>No school selected</p>}
                                        </Box>

                                        <label>Description</label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Enter description"
                                            name="description"
                                            value={newSurvey.description}
                                            onChange={handleSurveyChange}
                                        />
                                    </div>
                                    <button className="submit-button" onClick={handleSubmit}>Submit</button>
                                </div>
                            </div>
                        )}

                        <Box sx={{ overflowX: 'auto', marginBottom: '40px' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Survey Title</th>
                                        <th>Survey description</th>
                                        <th>Level</th>
                                        <th>Recipient Schools</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(filteredSurveyList) && filteredSurveyList.length > 0 ? (
                                        filteredSurveyList.map((survey, index) => (
                                            <tr key={survey.id}>
                                                <td>{survey.title}</td>
                                                <td>{survey.description}</td>
                                                <td>{survey.level}</td>
                                                <td>
                                                    {Array.isArray(survey.schools) && survey.schools.length > 0
                                                        ? survey.schools.map((s, i) => (
                                                            <span key={i}>
                                                                {s?.name}{i < survey.schools.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))
                                                        // : survey.school && typeof survey.school === 'object'
                                                        // ? survey.school.name
                                                        : 'No School'
                                                    }

                                                    {/* {survey.school?.map((school) => (
                                                        <Chip key={school} variant="soft" color="primary">
                                                            {school}
                                                        </Chip> */}

                                                </td>
                                                <td>
                                                    <Button variant="plain" size="sm" onClick={() => openSurveyModal(index)}>
                                                        ✏️
                                                    </Button>
                                                    <Button variant="plain" size="sm" onClick={() => deleteSurvey(survey.id)}>
                                                        ❌
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center">No surveys found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </Box>
                    </Box>
                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}
