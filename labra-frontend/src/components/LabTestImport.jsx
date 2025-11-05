// SL 202510 - Import UI with parser selection

import React, { useState } from "react";
import axios from "axios";
import { parseExcel, parseOmakanta } from "../utils/parseLabData";


const LabTestImport = ({ personID: initialPersonID = "", onClose }) => {
  const [personID, setPersonID] = useState(initialPersonID);
  const [mode, setMode] = useState("excel"); // "excel" | "omakanta" | "other"
  const [rawText, setRawText] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handlePreview = () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!personID.trim()) {
      setErrorMessage("Anna ensin PersonID.");
      return;
    }
    if (!rawText.trim()) {
      setErrorMessage("Liitä ensin data.");
      return;
    }

    try {
      let parsed = [];
      if (mode === "excel") parsed = parseExcel(rawText, personID);
      else if (mode === "omakanta") parsed = parseOmakanta(rawText, personID);
      else {
        // placeholder: other-mode not yet implemented, fallback to excel
        parsed = parseExcel(rawText, personID);
      }

      if (!parsed || parsed.length === 0) {
        setErrorMessage("Esikatselussa ei löytynyt rivejä. Tarkista syöte ja valinta.");
        setParsedData([]);
      } else {
        setParsedData(parsed);
        setSuccessMessage(`Esikatselussa ${parsed.length} riviä (mode: ${mode}).`);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Virhe esikatselussa: " + (err.message || ""));
      setParsedData([]);
    }
  };

  const handleImport = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (parsedData.length === 0) {
      setErrorMessage("Ei tallennettavaa dataa. Tee ensin esikatselu.");
      return;
    }

    try {
      const resp = await axios.post("http://localhost:8000/api/labtestresults/import", parsedData);
      if (resp.status === 200) {
        setSuccessMessage(`Tallennettu ${parsedData.length} riviä.`);
        setParsedData([]);
        setRawText("");
      } else {
        setErrorMessage("Palvelin palautti virheen.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || "Virhe tuonnissa.");
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <h3>📋 Tuo labratiedot</h3>

      <div style={{ marginBottom: 8 }}>
        <label style={{ marginRight: 8 }}>PersonID:</label>
        <input value={personID} onChange={(e) => setPersonID(e.target.value)} style={{ marginRight: 12 }} />
        <label style={{ marginRight: 8 }}>Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ marginRight: 12 }}>
          <option value="excel">Hyvinvointi-Excel</option>
          <option value="omakanta">Omakanta</option>
          <option value="other">Muu (ei vielä toteutettu)</option>
        </select>
        <button onClick={() => { setParsedData([]); setRawText(""); setErrorMessage(""); setSuccessMessage(""); }}>Tyhjennä</button>
      </div>

      <textarea
        rows={10}
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="Liitä data tähän..."
        style={{ width: "100%", fontFamily: "monospace" }}
      />

      <div style={{ marginTop: 8 }}>
        <button onClick={handlePreview} style={{ marginRight: 8 }}>Esikatsele</button>
        <button onClick={handleImport} disabled={parsedData.length === 0} style={{ marginRight: 8 }}>Tallenna</button>        
      </div>

      {errorMessage && <div style={{ color: "red", marginTop: 8 }}>⚠️ {errorMessage}</div>}
      {successMessage && <div style={{ color: "green", marginTop: 8 }}>✅ {successMessage}</div>}

      {parsedData.length > 0 && (
        <table border="1" cellPadding="4" style={{ marginTop: 12, width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th>Pvm</th><th>Nimi</th><th>Tulos</th><th>Yksikkö</th><th>Min</th><th>Max</th><th>Viite</th><th>Lisätieto</th>
            </tr>
          </thead>
          <tbody>
            {parsedData.map((r,i) => (
              <tr key={i}>
                <td>{r.SampleDate}</td>
                <td>{r.AnalysisName}</td>
                <td>{r.Result}</td>
                <td>{r.Unit}</td>
                <td>{r.MinimumValue}</td>
                <td>{r.MaximumValue}</td>
                <td>{r.ValueReference}</td>
                <td>{r.AdditionalText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LabTestImport;
