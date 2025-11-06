// SL 202510 - Import UI with parser selection

import React, { useState } from "react";
import axios from "axios";
import { parseExcel, parseOmakanta, parseGenericLabData } from "../utils/parseLabData";


const LabTestImport = ({ personID: initialPersonID = "", onClose }) => {
    const [personID, setPersonID] = useState(initialPersonID);
    const [mode, setMode] = useState("excel"); // "excel" | "omakanta" | "other"
    const [rawText, setRawText] = useState("");
    const [parsedData, setParsedData] = useState([]);
    const [rows, setRows] = useState([]); // rows for free import 
    const [columnMapping, setColumnMapping] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // for free import
    const possibleFields = [
        "Ei käytössä",
        "SampleDate",
        "AnalysisName",
        "Result",
        "Unit",
        "MinimumValue",
        "MaximumValue",
        "ReferenceRange",
        "Comment",
        "CompanyUnitName",
    ];


    // --- vapaa muoto ---
    const handleFreeParse = () => {

        if (!rawText.trim()) return;

        const parsedData = parseGenericLabData(rawText);

        if (parsedData && parsedData.length > 0) {
            setRows(parsedData);
            const initialMap = {};
            parsedData[0].forEach((_, i) => (initialMap[i] = "Ei käytössä"));
            setColumnMapping(initialMap);
        }
    };

    const handleColumnChange = (colIndex, field) => {
        setColumnMapping((prev) => ({ ...prev, [colIndex]: field }));
    };


    /*

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
                            <th>Pvm</th><th>Nimi</th><th>Tulos</th><th>Yksikkö</th><th>Min</th><th>Max</th><th>Viiteryhmä</th><th>Lisätieto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parsedData.map((r, i) => (
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
    */


    // --- Excel ja Omakanta ---
    // TODO tänne vielä koodia tuolta mikä nyt kommentoituna
    // TODO tarkista tulostettavat sarakkeet
    const handleParse = () => {
        setErrorMessage("");
        setSuccessMessage("");

        if (!personID.trim()) {
            setErrorMessage("Anna ensin PersonID");
            return;
        }

        if (!rawText.trim()) {
            setErrorMessage("Liitä ensin data.");
            return;
        }

        try {
            let result = [];
            if (mode === "excel") result = parseExcel(rawText, personID.trim());
            if (mode === "omakanta") result = parseOmakanta(rawText, personID.trim());
            if (mode === "free") return handleFreeParse();

            setParsedData(result);
        } catch (err) {
            console.error(err);
            setErrorMessage("Virhe esikatselussa: " + (err.message || ""));
            setParsedData([]);
        }
    };


    // --- lähetys kantaan ---
    const handleImport = async () => {
        try {
            const response = await axios.post(
                "http://localhost:8000/api/labtestresults/import",
                parsedData
            );
            if (response.data.success) {
                setSuccessMessage("Tiedot tuotu onnistuneesti kantaan!");
                alert(`Tallennettu ${parsedData.length} riviä onnistuneesti!`);
            }
        } catch (error) {
            console.error("Tuontivirhe:", error);
            setErrorMessage("Virhe tietojen tuonnissa. Tarkista syöte tai yhteys.");
        }
    };

    return (
        <div style={{ padding: 16 }}>
            <h3>📋 Tuo labratiedot</h3>

            <div style={{ marginBottom: 8 }}>
                <label style={{ marginRight: 8 }}>PersonID:</label>
                <input
                    value={personID}
                    onChange={(e) => setPersonID(e.target.value)}
                    style={{ marginRight: 12 }}
                />
                <label style={{ marginRight: 8 }}>Mode:</label>
                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    style={{ marginRight: 12 }}
                >
                    <option value="excel">Hyvinvointi-Excel</option>
                    <option value="omakanta">Omakanta</option>
                    <option value="free">Vapaamuotoinen</option>
                </select>
                <button
                    onClick={() => {
                        setParsedData([]);
                        setRawText("");
                        setErrorMessage("");
                        setSuccessMessage("");
                        setRows([]);
                    }}
                >
                    Tyhjennä
                </button>
            </div>

            <textarea
                rows="8"
                cols="100"
                placeholder="Liitä data tähän"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{ display: "block", marginBottom: 10, width: "100%" }}
            ></textarea>

            <button onClick={handleParse}>Tunnista ja esikatsele</button>

            {/* --- vapaa muoto: sarakekartoitus --- */}
            {mode === "free" && rows.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <h4>Esikatselu ({rows.length} riviä)</h4>
                    <table border="1" cellPadding="5">
                        <thead>
                            <tr>
                                {rows[0].map((_, colIndex) => (
                                    <th key={colIndex}>
                                        <select
                                            value={columnMapping[colIndex] || ""}
                                            onChange={(e) =>
                                                handleColumnChange(colIndex, e.target.value)
                                            }
                                        >
                                            {possibleFields.map((f) => (
                                                <option key={f} value={f}>
                                                    {f}
                                                </option>
                                            ))}
                                        </select>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.slice(0, 8).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                        <td key={colIndex}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- excel/omakanta esikatselu --- */}
            {mode !== "free" && parsedData.length > 0 && (

                <>
                    <table border="1" cellPadding="4" style={{ marginTop: 12, width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f0f0f0" }}>
                                <th>Pvm</th><th>TH yksikkö</th><th>Nimi</th><th>Tulos</th><th>Yksikkö</th><th>Min</th><th>Max</th><th>Viiteryhmä</th><th>Lisätieto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsedData.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.SampleDate}</td>
                                    <td>{r.CompanyUnitName}</td>
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



                    <div style={{ marginTop: 20 }}>
                        <h4>Esikatselu ({parsedData.length} riviä)</h4>
                        <button onClick={handleImport}>Tallenna kantaan</button>
                    </div>
                </>

            )}

        </div>
    );


};

export default LabTestImport;
