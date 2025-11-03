// SL 202510:  Lab Results UI Component
// TODO: when personID changes, clear results
import React, { useState } from "react";
import axios from "axios";
import LabTestResultRow from "./components/LabTestResultRow.jsx";
import LabTestResultHeader from './components/LabTestResultHeader';
import { labFields, copyFields, newRowDefaults } from "./definitions/labfields.js";
import LabTestResultsEditor from './components/LabTestResultsEditor.jsx';
import LabTestImport from "./components/LabtestImport.jsx";

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

  const [editedRows, setEditedRows] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);

  const [showImport, setShowImport] = useState(false);

  const baseUrl = "http://localhost:8000/api/labtestresults";


  // New rows (not based on existing results)
  const [newRows, setNewRows] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);

  // Create a new empty row, copying copyFields values from the last newRows row (if any) or defaults
  const addNewRow = () => {
    if (!personID) {
      return alert("Anna henkilön tunniste ennen uuden rivin lisäämistä.");
    }
    const prev = newRows.length ? newRows[newRows.length - 1] : null;
    const newRow = {};

    labFields.forEach(f => {
      if (copyFields.includes(f.key)) {
        // copies from previous row if exists, otherwise from defaults
        newRow[f.key] = prev && prev[f.key] !== undefined
          ? prev[f.key]
          : (typeof newRowDefaults[f.key] === 'function' ? newRowDefaults[f.key]() : (newRowDefaults[f.key] ?? ''));
      } else {
        // other fields get default value (not copied)
        newRow[f.key] = typeof newRowDefaults[f.key] === 'function'
          ? newRowDefaults[f.key]()
          : (newRowDefaults[f.key] ?? '');
      }
    });

    newRow.ID = null;
    newRow.PersonID = personID;
    setNewRows([...newRows, newRow]);
  };

  const saveNewRows = async () => {
    if (newRows.length === 0) return;
    try {
      const promises = newRows.map(row => axios.post(baseUrl, row));
      await Promise.all(promises);
      await handleSearch();
      setNewRows([]);
      setShowNewForm(false);
    } catch (err) {
      setError("Virhe tallennuksessa: " + (err.response?.statusText || err.message));
      console.error(err.response?.data);
    }
  };




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

  // helper: format local date to "YYYY-MM-DDTHH:MM"
  const formatLocalDateTime = (d = new Date()) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const copySelected = () => {
    if (selectedRows.length === 0) return alert("Valitse kopioitavat rivit.");
    const copied = results.filter(r => selectedRows.includes(r.ID));
    setCopiedRows(copied.map(row => ({
      ...row,
      ID: null,  // Null for new row 
      SampleDate: (() => {
        const d = new Date();
        d.setHours(9, 0, 0); // Set time to 09:00:00
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      })(),
      ResultAddedDate: null,
      ToMapDate: null
    })));
    setShowCopiedForm(true);
    setSelectedRows([]); //Set choises empty
  };

  const saveCopiedRows = async () => {
    try {
      const promises = copiedRows.map(row =>
        axios.post(`${baseUrl}`, row)
      );
      await Promise.all(promises);
      handleSearch(); // Refresh resultlist 
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


  const editSelected = () => {
    if (selectedRows.length === 0) return alert("Valitse muokattavat rivit.");
    const toEdit = results.filter(r => selectedRows.includes(r.ID));
    setEditedRows(toEdit.map(r => ({ ...r }))); // copy for editing 
    setShowEditForm(true);
    setSelectedRows([]);
  };

  const saveEditedRows = async () => {
    try {
      const promises = editedRows.map(row => axios.put(`${baseUrl}/${row.ID}`, row));
      await Promise.all(promises);
      await handleSearch(); // refresh view from backend
      setEditedRows([]);
      setShowEditForm(false);
    } catch (err) {
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
      const params = { personID };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm) params.searchTerm = searchTerm;
      if (sortField) {
        params.sortField = sortField;
        params.sortOrder = sortOrder;
      }
      params.perPage = 100; // change as needed

      const res = await axios.get(`${baseUrl}/search`, { params });

      // if backend returns pagination -> res.data.data is the array
      const items = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
      setResults(items);
    } catch (err) {
      console.error('Full error:', err); // Show the whole error in console for debugging
      setError("Virhe haussa: " + err.response?.statusText + err.message);
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

      <h2>🧪 Labratulokset</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Henkilön tunniste: </label>
        <input
          type="text"
          value={personID}
          onChange={(e) => setPersonID(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={() => {
          setShowNewForm(true);
          if (newRows.length === 0) addNewRow();
        }} style={{ marginLeft: '8px' }}>Lisää uusi tulos</button>

        <button
          onClick={() => setShowImport(true)}
          style={{ marginLeft: "8px" }}
        >
          Tuo useita tuloksia
        </button>

        <br />

      </div>

      {showImport ? (
        <div>
          <LabTestImport personID={personID}/>
          <button onClick={() => setShowImport(false)} style={{ marginTop: "10px" }}>
            🔙 Palaa labratuloksiin
          </button>
        </div>
      ) : (
        <>

          {showNewForm && newRows.length > 0 && (
            <LabTestResultsEditor
              title="Lisää uusia tuloksia"
              rows={newRows}
              setRows={setNewRows}
              personID={personID}
              onSave={saveNewRows}
              onCancel={() => { setNewRows([]); setShowNewForm(false); }}
              allowAdd={true}
              allowDelete={true}
              saveLabel="Tallenna uudet rivit"
            />
          )}

          {showCopiedForm && copiedRows.length > 0 && (
            <LabTestResultsEditor
              title="Muokkaa kopioituja rivejä"
              rows={copiedRows}
              setRows={setCopiedRows}
              personID={personID}
              onSave={saveCopiedRows}
              onCancel={() => { setCopiedRows([]); setShowCopiedForm(false); }}
              allowAdd={true}
              allowDelete={true}
              saveLabel="Tallenna uudet rivit"
            />
          )}

          {showEditForm && editedRows.length > 0 && (
            <LabTestResultsEditor
              title="Muokkaa valittuja rivejä"
              rows={editedRows}
              setRows={setEditedRows}
              personID={personID}
              onSave={saveEditedRows}
              onCancel={() => { setEditedRows([]); setShowEditForm(false); }}
              allowAdd={false}         // no new rows when editing existing ones
              allowDelete={true}
              saveLabel="Tallenna muutokset"
            />
          )}

          <div>

            <h3>Hakuehdot</h3>
            <label>Analyysin nimi sisältää: </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginRight: "10px" }}
            />

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
              Kopioi valitut uusien pohjaksi
            </button>
            <button onClick={editSelected} >
              Muuta valitut
            </button>
          </div>

          {loading && <p>Haetaan...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {results.length > 0 && (
            <table border="1" cellPadding="6" style={{ cursor: "pointer" }}>
              <thead>
                <LabTestResultHeader mode='show' handleSort={handleSort} />
              </thead>
              <tbody>
                {sortedResults.map((r) => (

                  <LabTestResultRow
                    key={r.ID}
                    row={r}
                    onToggleSelect={() => toggleRowSelection(r.ID)}
                    isSelected={selectedRows.includes(r.ID)}
                    mode='show'
                  />
                ))}
              </tbody>
            </table>
          )}

          {!loading && !error && results.length === 0 && <p>Ei tuloksia</p>}
        </>
      )}

    </div>
  );
};

export default LabResults;
