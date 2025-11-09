// SL 202510 - Import UI with parser selection

import React, { useState } from "react";
import axios from "axios";
import { parseExcel, parseOmakanta, parseGenericLabData, parseReferenceRange } from "../utils/parseLabData";
import { parseDateToMySQL } from "../utils/dates";


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
        { label: "Ei käytössä", value: "" },
        { label: "Näytteen päivämäärä", value: "SampleDate" },
        { label: "Tutkimuksen nimi", value: "AnalysisName" },
        { label: "Tutkimuksen lyhenne", value: "AnalysisShortName" },
        { label: "Tulos", value: "Result" },
        { label: "Yksikkö", value: "Unit" },
        { label: "Alaraja", value: "MinimumValue" },
        { label: "Yläraja", value: "MaximumValue" },
        { label: "Viitealue", value: "ReferenceRange" },
        { label: "Kommentti / lisätieto", value: "Comment" },
        { label: "Tutkimuspaikka / labra", value: "CompanyUnitName" },
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

    // Tätä ei käytetä enää
    const handleColumnChange = (colIndex, field) => {
        setColumnMapping((prev) => ({ ...prev, [colIndex]: field }));
    };



    const handleColumnMappingChange = (index, field) => {
        const newMap = { ...columnMapping, [index]: field };
        setColumnMapping(newMap);

        // Jos valitaan viitealue, parsitaan kaikki rivit
        if (field === "ReferenceRange") {
            const updatedRows = rows.map((r) => {
                const cell = Array.isArray(r) ? r[index] || "" : "";
                const { min, max, unit } = parseReferenceRange(cell);
                // Tehdään uusi rivi, jossa säilyy alkuperäinen taulukko ja lisätään _parsedReference
                return Object.assign([], r, { _parsedReference: { min, max, unit } });
            });
            setRows(updatedRows);
        }

        if (field === "SampleDate") {
            const updatedRows = rows.map((r) => {
                if (!Array.isArray(r)) return r;
                const newRow = [...r];
                const cell = r[index] || "";
                const sDate = parseDateToMySQL(cell);
                newRow[index] = sDate; 
                return newRow;
            });
            setRows(updatedRows);
        }

    };


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

    // --- vapaan tuonnin tallennus ---
    const handleFreeImport = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        try {
            if (!personID.trim()) {
                setErrorMessage("Anna ensin PersonID");
                return;
            }

            // Muodostetaan tietueet valittujen sarakkeiden mukaan
            const formattedData = rows.map((row) => {
                const record = {
                    PersonID: personID.trim(),
                };

                // Käydään jokainen sarake läpi ja poimitaan käyttäjän valinnan mukaan
                row.forEach((cell, colIndex) => {
                    const field = columnMapping[colIndex];

                    if (!field || field === "" || field === "Ei käytössä") return;

                    // Jos kyseessä viitealue, käytetään parsettuja arvoja
                    if (field === "ReferenceRange" && row._parsedReference) {
                        const { min, max, unit } = row._parsedReference;
                        record.MinimumValue = min || null;
                        record.MaximumValue = max || null;
                        // Jos Unit ei ole vielä määritelty, asetetaan se tähän
                        if (!record.Unit && unit) record.Unit = unit;
                    } else {
                        record[field] = cell;
                    }
                });

                return record;
            });

            console.log("Lähetetään kantaan:", formattedData);

            // Lähetetään Laravel-backendille
            const response = await axios.post(
                "http://localhost:8000/api/labtestresults/import",
                formattedData
            );

            if (response.data.success) {
                setSuccessMessage("Tiedot tuotu onnistuneesti kantaan!");
                alert(`Tallennettu ${formattedData.length} riviä onnistuneesti!`);
            } else {
                setErrorMessage("Virhe tallennuksessa — tarkista tiedot.");
            }
        } catch (error) {
            console.error("Virhe tuonnissa:", error);
            setErrorMessage("Virhe tuonnissa kantaan. Tarkista yhteys tai datan muoto.");
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
                                                handleColumnMappingChange(colIndex, e.target.value)
                                            }
                                        >
                                            {possibleFields.map((field) => (
                                                <option key={field.value} value={field.value}>
                                                    {field.label}
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
                                    {Array.isArray(row) ? (
                                        row.map((cell, colIndex) => {
                                            const fieldType = columnMapping[colIndex];
                                            const parsed = row._parsedReference;
                                            const isReference = fieldType === "ReferenceRange" && parsed;

                                            return (
                                                <td key={colIndex}>
                                                    {isReference ? (
                                                        <>
                                                            <div style={{ fontSize: "0.85em", color: "#333", marginBottom: "4px" }}>
                                                                {cell}
                                                            </div>
                                                            <table
                                                                style={{
                                                                    width: "100%",
                                                                    borderCollapse: "collapse",
                                                                    fontSize: "0.8em",
                                                                    textAlign: "center",
                                                                    border: "1px solid #ccc",
                                                                }}
                                                            >
                                                                <thead style={{ backgroundColor: "#f8f8f8" }}>
                                                                    <tr>
                                                                        <th style={{ border: "1px solid #ccc", padding: "2px" }}>Min</th>
                                                                        <th style={{ border: "1px solid #ccc", padding: "2px" }}>Max</th>
                                                                        <th style={{ border: "1px solid #ccc", padding: "2px" }}>Yksikkö</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <td style={{ border: "1px solid #ccc", padding: "2px" }}>
                                                                            {parsed.min || ""}
                                                                        </td>
                                                                        <td style={{ border: "1px solid #ccc", padding: "2px" }}>
                                                                            {parsed.max || ""}
                                                                        </td>
                                                                        <td style={{ border: "1px solid #ccc", padding: "2px" }}>
                                                                            {parsed.unit || ""}
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </>

                                                    ) : (
                                                        cell
                                                    )}
                                                </td>
                                            );
                                        })
                                    ) : (
                                        <td colSpan="100%" style={{ color: "gray" }}>
                                            (Ei taulukkomuotoista dataa)
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>



                    </table>
                    <div style={{ marginTop: 15 }}>
                        <button onClick={handleFreeImport}>💾 Tallenna kantaan</button>
                        {successMessage && (
                            <div style={{ color: "green", marginTop: 8 }}>{successMessage}</div>
                        )}
                        {errorMessage && (
                            <div style={{ color: "red", marginTop: 8 }}>{errorMessage}</div>
                        )}
                    </div>
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
