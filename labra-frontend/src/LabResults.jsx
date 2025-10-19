import React, { useState } from "react";
import axios from "axios";

const LabResults = () => {
  const [personID, setPersonID] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = "http://localhost:8000/api/labtestresults";

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };


  const handleSearch = async () => {
    if (!personID) {
      setError("Anna henkilön tunnus");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      let url = `${baseUrl}/person/${personID}`;

      //TODO: Now prioritizes searchTerm over date range if both are provided, not good
      if (searchTerm) {
        url = `${baseUrl}/person/${personID}/analysis/${searchTerm}`;
      }
      else if (startDate && endDate) {
        url = `${baseUrl}/person/${personID}/dates/${startDate}/${endDate}`;
      }
      else if (startDate && !endDate) {
        const today = new Date().toISOString().split("T")[0];
        url = `${baseUrl}/person/${personID}/dates/${startDate}/${today}`;
      }
      else if (!startDate && endDate) {
        url = `${baseUrl}/person/${personID}/dates/1900-01-01/${endDate}`;
      }

      const res = await axios.get(url);
      setResults(res.data);
    } catch (err) {
      setError("Virhe haussa: " + (err.response?.statusText || err.message));
    } finally {
      setLoading(false);
    }
  };


  const sortedResults = [...results].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField] ? a[sortField].toString().toLowerCase() : "";
    const valB = b[sortField] ? b[sortField].toString().toLowerCase() : "";
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });


  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>🧪 Labratulosten haku</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>PersonID: </label>
        <input
          type="text"
          value={personID}
          onChange={(e) => setPersonID(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <label>Analyysin nimi sisältää: </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <br /><br />
        <label>Alkupäivä: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <label>Loppupäivä: </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <button onClick={handleSearch}>Hae tulokset</button>
      </div>

      {loading && <p>Haetaan...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {results.length > 0 && (
        <table border="1" cellPadding="6" style={{ cursor: "pointer" }}>
          <thead>
            <tr>
              <th onClick={() => handleSort("ID")}>ID</th>
              <th onClick={() => handleSort("SampleDate")}>SampleDate</th>
              <th onClick={() => handleSort("AnalysisName")}>AnalysisName</th>
              <th onClick={() => handleSort("CombinedName")}>CombinedName</th>
              <th onClick={() => handleSort("Result")}>Result</th>
              <th onClick={() => handleSort("Unit")}>Unit</th>
              <th onClick={() => handleSort("MinimumValue")}>Min</th>
              <th onClick={() => handleSort("MaximumValue")}>Max</th>
              <th onClick={() => handleSort("ValueReference")}>Reference</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((r) => (
              <tr key={r.ID}>
                <td>{r.ID}</td>
                <td>{r.SampleDate}</td>
                <td>{r.AnalysisName}</td>
                <td>{r.CombinedName}</td>
                <td>{r.Result}</td>
                <td>{r.Unit}</td>
                <td>{r.MinimumValue}</td>
                <td>{r.MaximumValue}</td>
                <td>{r.ValueReference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}


      {!loading && !error && results.length === 0 && <p>Ei tuloksia</p>}
    </div>
  );
};

export default LabResults;
