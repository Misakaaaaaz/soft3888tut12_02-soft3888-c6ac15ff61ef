import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SurveyManagementPage from '../app/surveymanagement/page';
import '@testing-library/jest-dom';


// Mock data
let mockSurveysData = [];
let mockSchoolsData = [];

describe('SurveyManagementPage', () => {
  beforeAll(() => {
    global.matchMedia = global.matchMedia || function () {
      return {
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    };

    global.fetch = jest.fn((url, options = {}) => {
      if (url.includes('/surveys') && (!options.method || options.method === 'GET')) {
        // GET /surveys
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockSurveysData }),
        });
      } else if (url.includes('/schools') && (!options.method || options.method === 'GET')) {
        // GET /schools
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockSchoolsData }),
        });
      } else if (url.includes('/surveys') && options.method === 'POST') {
        // POST /surveys
        const newSurveyData = JSON.parse(options.body);
        const newSurvey = {
          id: String(mockSurveysData.length + 1),
          ...newSurveyData,
        };

        // Handle school assignment
        if (newSurvey.schools && newSurvey.schools.length > 0) {
          newSurvey.schools = newSurvey.schools.map(schoolId => {
            return mockSchoolsData.find(school => school.id === String(schoolId)) || null;
          }).filter(school => school !== null);
        }

        mockSurveysData.push(newSurvey);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(newSurvey),
        });
      } else if (url.match(/\/surveys\/\d+$/) && options.method === 'PUT') {
        // PUT /surveys/:id
        const idToUpdate = url.split('/').pop();
        const updatedSurveyData = JSON.parse(options.body);

        const index = mockSurveysData.findIndex(survey => survey.id === idToUpdate);
        if (index !== -1) {
          const existingSurvey = mockSurveysData[index];
          const updatedSurvey = { ...existingSurvey, ...updatedSurveyData };

          if (updatedSurvey.schools && updatedSurvey.schools.length > 0) {
            updatedSurvey.schools = updatedSurvey.schools.map(schoolId => {
              return mockSchoolsData.find(school => school.id === String(schoolId)) || null;
            }).filter(school => school !== null);
          }

          mockSurveysData[index] = updatedSurvey;

          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(updatedSurvey),
          });
        } else {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'Survey not found' }),
          });
        }
      } else if (url.match(/\/surveys\/\d+$/) && options.method === 'DELETE') {
        // DELETE /surveys/:id
        const idToDelete = url.split('/').pop();
        const initialLength = mockSurveysData.length;
        mockSurveysData = mockSurveysData.filter(survey => survey.id !== idToDelete);

        if (mockSurveysData.length < initialLength) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Survey deleted' }),
          });
        } else {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'Survey not found' }),
          });
        }
      } else {
        // Default response for unhandled requests
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'Not Found' }),
        });
      }
    }); // Close global.fetch

  });

  beforeEach(() => {
    // Reset mock data before each test
    mockSurveysData = [
      {
        id: '1',
        title: 'Sample Survey',
        description: 'Sample Description',
        level: 'Easy',
        schools: [],
      },
    ];

    mockSchoolsData = [
      {
        id: '1',
        name: 'Test School',
      },
    ];
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  test('adds a survey', async () => {
    render(<SurveyManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Survey Management')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Sample Survey/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Survey'));

    fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'New Survey' } });
    fireEvent.change(screen.getByPlaceholderText('Enter level'), { target: { value: 'Medium' } });
    fireEvent.change(screen.getByPlaceholderText('Enter description'), { target: { value: 'New Description' } });

    fireEvent.change(screen.getByLabelText('School'), { target: { value: '1' } });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText(/New Survey/i)).toBeInTheDocument();
    });
  });

  test('edits a survey', async () => {
    render(<SurveyManagementPage />);

    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('Sample Survey'))).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('✏️')[0]);

    fireEvent.change(screen.getByPlaceholderText('Enter title'), { target: { value: 'Updated Survey' } });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Updated Survey'))).toBeInTheDocument();
    });
  });

  test('deletes a survey', async () => {
    render(<SurveyManagementPage />);

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Sample Survey'))).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('❌')[0]);

    await waitFor(() => {
      expect(screen.queryByText((content) => content.includes('Sample Survey'))).not.toBeInTheDocument();
    });
  });

  // test('filters surveys by search input', async () => {
  //   mockSurveysData.push(
  //     {
  //       id: '2',
  //       title: 'Another Survey',
  //       description: 'Another Description',
  //       level: 'Medium',
  //       schools: [],
  //     }
  //   );

  //   render(<SurveyManagementPage />);

  //   await waitFor(() => {
  //     expect(screen.getByText((content) => content.includes('Sample Survey'))).toBeInTheDocument();
  //     expect(screen.getByText((content) => content.includes('Another Survey'))).toBeInTheDocument();
  //   });

  //   fireEvent.change(screen.getByPlaceholderText('Search Surveys by title'), { target: { value: 'Another' } });

  //   await waitFor(() => {
  //     expect(screen.getByText('Another Survey')).toBeInTheDocument();
  //     expect(screen.queryByText('Sample Survey')).not.toBeInTheDocument();
  //   });

  //   // Clear the search input (reset it to show all surveys)
  //   fireEvent.change(screen.getByPlaceholderText('Search Surveys by title'), {
  //   target: { value: '' },
  //   });

  //   // Wait for the full list of surveys to be displayed again
  //   await waitFor(() => {
  //     expect(screen.getByText('Sample Survey')).toBeInTheDocument();
  //     expect(screen.getByText('Another Survey')).toBeInTheDocument();
  //   });
  // });

  test('shows no surveys when there are none', async () => {
    mockSurveysData = [];

    render(<SurveyManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('No surveys found')).toBeInTheDocument();
    });
  });

  test('displays multiple surveys', async () => {
    mockSurveysData = [
      {
        id: '1',
        title: 'Survey One',
        description: 'Description One',
        level: 'Easy',
        schools: [],
      },
      {
        id: '2',
        title: 'Survey Two',
        description: 'Description Two',
        level: 'Medium',
        schools: [],
      },
    ];

    render(<SurveyManagementPage />);

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Survey One'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Survey Two'))).toBeInTheDocument();
    });
  });
});