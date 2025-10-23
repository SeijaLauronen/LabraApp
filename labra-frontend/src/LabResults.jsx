import React, { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
// *SL  Lab Results UI Component
const LabResults = () => {
  const [personID, setPersonID] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedRows, setSelectedRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [copiedRows, setCopiedRows] = useState([]);
  const [showCopiedForm, setShowCopiedForm] = useState(false);

  const baseUrl = "http://localhost:8000/api/labtestresults";

  /*
  
    useEffect(() => {
      if (personID) {
        axios
          .get(`http://localhost:8000/api/labtestresults/person/${personID}`)
          .then(res => setResults(res.data))
          .catch(err => console.error(err));
      }
    }, [personID]);
  */
  const toggleRowSelection = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === results.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(results.map(r => r.ID));
    }
  };

  const deleteSelected = async () => {
    if (selectedRows.length === 0) return alert("Valitse poistettavat rivit.");
    if (!window.confirm("Haluatko varmasti poistaa valitut rivit?")) return;

    try {
      await Promise.all(selectedRows.map(id =>
        axios.delete(`http://localhost:8000/api/labtestresults/${id}`)
      ));
      setResults(results.filter(r => !selectedRows.includes(r.ID)));
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
    }
  };

  const copySelected = () => {
    if (selectedRows.length === 0) return alert("Valitse kopioitavat rivit.");
    const copied = results.filter(r => selectedRows.includes(r.ID));
    setCopiedRows(copied.map(row => ({
      ...row,
      ID: null,  // Tyhjätään ID uutta riviä varten
      SampleDate: new Date().toISOString().split('T')[0], // Asetetaan tämä päivä
      ResultAddedDate: null,
      ToMapDate: null
    })));
    setShowCopiedForm(true);
    setSelectedRows([]); // Tyhjennetään valinnat
  };

  const saveCopiedRows = async () => {
    try {
      const promises = copiedRows.map(row =>
        axios.post(`${baseUrl}`, row)
      );
      await Promise.all(promises);
      handleSearch(); // Päivitetään tuloslista
      setCopiedRows([]);
      setShowCopiedForm(false);
    } catch (err) {
      //TODO: Paranna virheenkäsittelyä
      setError("Virhe tallennuksessa: " + (err.response?.statusText || err.message));
      console.error('Response:', err.response?.data);
      console.error('Status:', err.response?.status);
      console.error('Headers:', err.response?.headers);
    }
  };

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

      // *SL TODO: Now prioritizes searchTerm over date range if both are provided, not good
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


      {showCopiedForm && copiedRows.length > 0 && (
        <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc" }}>
          <h3>Muokkaa kopioituja rivejä</h3>
          <table border="1" cellPadding="6">
            <thead>
              <tr>
                <th>Näyte pvm</th>
                <th>Analyysi</th>
                <th>Tulos</th>
                <th>Yksikkö</th>
                <th>Toiminnot</th>
              </tr>
            </thead>
            <tbody>
              {copiedRows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="date"
                      value={row.SampleDate}
                      onChange={(e) => {
                        const newRows = [...copiedRows];
                        newRows[index].SampleDate = e.target.value;
                        setCopiedRows(newRows);
                      }}
                    />
                  </td>
                  <td>{row.AnalysisName}</td>
                  <td>
                    <input
                      type="text"
                      value={row.Result}
                      onChange={(e) => {
                        const newRows = [...copiedRows];
                        newRows[index].Result = e.target.value;
                        setCopiedRows(newRows);
                      }}
                    />
                  </td>
                  <td>{row.Unit}</td>
                  <td>
                    <button onClick={() => {
                      setCopiedRows(copiedRows.filter((_, i) => i !== index));
                    }}>Poista</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "10px" }}>
            <button onClick={saveCopiedRows}>Tallenna uudet rivit</button>
            <button onClick={() => {
              setCopiedRows([]);
              setShowCopiedForm(false);
            }}>Peruuta</button>
          </div>
        </div>
      )}










      <h2>🧪 Labratulosten haku</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Henkilön tunniste: </label>
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
      <div style={{ marginBottom: "15px" }}>
        <button onClick={toggleSelectAll}>
          {selectedRows.length === results.length ? "Poista valinnat" : "Valitse kaikki"}
        </button>
        <button onClick={deleteSelected} >
          Poista valitut
        </button>
        <button onClick={copySelected} >
          Kopioi valitut
        </button>
      </div>

      {loading && <p>Haetaan...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {results.length > 0 && (
        <table border="1" cellPadding="6" style={{ cursor: "pointer" }}>
          <thead>
            <tr>
              <th></th>
              <th onClick={() => handleSort("ID")}>ID</th>
              <th onClick={() => handleSort("SampleDate")}>Näyte pvm</th>
              <th onClick={() => handleSort("AnalysisName")}>Analyysi Name</th>
              <th onClick={() => handleSort("CombinedName")}>Yleisnimi</th>
              <th onClick={() => handleSort("AnalysisShortName")}>Lyhenne</th>
              <th onClick={() => handleSort("AnalysisCode")}>Koodi</th>
              <th onClick={() => handleSort("Result")}>Tulos</th>
              <th onClick={() => handleSort("Unit")}>Yksikkö</th>
              <th onClick={() => handleSort("MinimumValue")}>Min</th>
              <th onClick={() => handleSort("MaximumValue")}>Max</th>
              <th onClick={() => handleSort("ValueReference")}>Referenssiryhmä</th>
              <th onClick={() => handleSort("CompanyUnitName")}>TH yksikkö</th>
              <th onClick={() => handleSort("AdditionalInfo")}>Lisäinfo</th>
              <th onClick={() => handleSort("AdditionalText")}>Lisätieto</th>
              <th onClick={() => handleSort("ResultAddedDate")}>Tallennus pvm</th>
              <th onClick={() => handleSort("ToMapDate")}>Lisätty hv karttaan</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((r) => (

              <tr key={r.ID} style={{ background: selectedRows.includes(r.ID) ? '#e3f2fd' : 'transparent' }}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(r.ID)}
                    onChange={() => toggleRowSelection(r.ID)}
                  />
                </td>
                <td>{r.ID}</td>
                <td>{r.SampleDate}</td>
                <td>{r.AnalysisName}</td>
                <td>{r.CombinedName}</td>
                <td>{r.AnalysisShortName}</td>
                <td>{r.AnalysisCode}</td>
                <td>{r.Result}</td>
                <td>{r.Unit}</td>
                <td>{r.MinimumValue}</td>
                <td>{r.MaximumValue}</td>
                <td>{r.ValueReference}</td>
                <td>{r.CompanyUnitName}</td>
                <td>{r.AdditionalInfo}</td>
                <td>{r.AdditionalText}</td>
                <td>{r.ResultAddedDate}</td>
                <td>{r.ToMapDate}</td>
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
