import React, {useState} from 'react';
import './SurveyManagement.css'; 


const SurveyList = ({ initialSurveys }) => {
    const [surveys, setSurveys] = useState(initialSurveys);

    const [showForm, setShowForm] = useState(false);

    const [newSurvey, setNewSurvey] = useState({
        name: '',
        description: '',
        level: ''
      });

      const [search, setSearch] = useState('');

      const handleChange = (e) => {
        const { name, value } = e.target;
        setNewSurvey({
          ...newSurvey,
          [name]: value
        });
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        setSurveys([...surveys, newSurvey]);
        setNewSurvey({ name: '', description: '', level: '' });
        setShowForm(false); // Hide form after submission
      };

    const handleDelete = (index) => {
        setSurveys(surveys.filter((_, i) => i !== index));
      };
    
    const handleSearchChange = (e) => {
        setSearch(e.target.value.toLowerCase()); // Update search state
      };

    const filteredSurveys = surveys.filter(survey =>
        survey.name.toLowerCase().includes(search)
      );

    return (
        <article className="table-container">
            <h1>Survey Management</h1>
            <button
        className="btn btn-primary mb-3"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Add Survey'}
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
              value={newSurvey.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              id="description"
              name="description"
              value={newSurvey.description}
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
              value={newSurvey.level}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-success">Add Survey</button>
        </form>
      )}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by survey name"
          value={search}
          onChange={handleSearchChange}
        />
      </div>
    <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Description</th>
            <th scope="col">Level</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSurveys.length > 0 ? (
            filteredSurveys.map((survey, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{survey.name}</td>
                <td>{survey.description}</td>
                <td>{survey.level}</td>
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
              <td colSpan="5" className="text-center">No surveys found</td>
            </tr>
          )}
        </tbody>
      </table>
    </article>
  );
};
export default SurveyList;
