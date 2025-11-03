import React, { useState } from "react";
import axios from "axios";
import { parseDateToMySQL } from "../utils/dates";

const LabTestImport = ({ personID: initialPersonID = "" }) => {
    const [personID, setPersonID] = useState(initialPersonID);
    const [rawText, setRawText] = useState("");
    const [parsedData, setParsedData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");


    // 1. Parse tab-separated values from textarea
    const parseData = () => {
        if (!rawText.trim()) return alert("Liitä ensin data tekstikenttään!");
        const rows = rawText.trim().split("\n").map(line => line.split("\t"));
        const parsed = rows.map(cols => ({
            PersonID: personID,
            SampleDate: parseDateToMySQL(cols[0]),
            CompanyUnitName: cols[1],
            AnalysisName: cols[2],
            Result: cols[3],
            MinimumValue: cols[4],
            MaximumValue: cols[5],
            AdditionalText: cols[6] || ""
        }));
        setParsedData(parsed);
    };

    // 2. Send parsed data to backend
    const saveData = async () => {
        if (parsedData.length === 0) return alert("Ei tallennettavaa dataa!");
        if (!personID.trim()) return alert("Anna ensin henkilön ID!");

        try {
            await axios.post("http://localhost:8000/api/labtestresults/import", parsedData);
            alert(`Tallennettu ${parsedData.length} riviä onnistuneesti!`);
            setParsedData([]);
            setRawText("");
        } catch (err) {
            console.error(err);
            alert("Virhe tallennuksessa!");
        }

    };

    // 2. Send parsed data to backend
    const handleImport = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await axios.post("http://localhost:8000/api/labtestresults/import", parsedData);

            if (response.data.success) {
                setSuccessMessage(`Tallennettu ${parsedData.length} riviä onnistuneesti!`);
                //alert(`Tallennettu ${parsedData.length} riviä onnistuneesti!`);
                //setParsedData([]); // tyhjennetään taulukko
            }
        } catch (error) {
            console.error("Tuontivirhe:", error);

            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("Virhe tietojen tuonnissa. Tarkista syöte tai yhteys.");
            }
        }
    };


    return (
        <div style={{ padding: "20px" }}>
            <h2>Labratietojen tuonti (copy–paste Excelistä)</h2>

            <div style={{ marginBottom: "10px" }}>
                <label>PersonID: </label>
                <input
                    type="text"
                    value={personID}
                    onChange={(e) => setPersonID(e.target.value)}
                    placeholder="Anna henkilön tunnus"
                    style={{ width: "150px", marginRight: "20px" }}
                />
            </div>

            <textarea
                rows="10"
                cols="100"
                placeholder="Liitä tähän Excelistä kopioidut rivit (sarakkeet sarkaimella eroteltuna)..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
            />

            <br />
            <button onClick={parseData}>Esikatsele</button>

            {parsedData.length > 0 && (
                <>
                    <h3 style={{ marginTop: "20px" }}>
                        Esikatselu ({parsedData.length} riviä)
                    </h3>
                    <table border="1" cellPadding="6" width="100%">
                        <thead>
                            <tr style={{ backgroundColor: "#f0f0f0" }}>
                                <th>Pvm</th>
                                <th>Yritys</th>
                                <th>Analyysi</th>
                                <th>Tulos</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Lisätieto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsedData.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.SampleDate}</td>
                                    <td>{row.CompanyUnitName}</td>
                                    <td>{row.AnalysisName}</td>
                                    <td>{row.Result}</td>
                                    <td>{row.MinimumValue}</td>
                                    <td>{row.MaximumValue}</td>
                                    <td>{row.AdditionalText}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button style={{ marginTop: "10px" }} onClick={handleImport}>
                        💾 Tallenna kaikki tietokantaan
                    </button>

                    {errorMessage && (
                        <div style={{ color: "red", marginBottom: "10px" }}>
                            ⚠️ {errorMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div style={{ color: "green", marginBottom: "10px" }}>
                            ✅ {successMessage}
                        </div>
                    )}

                </>
            )}
        </div>
    );
};

export default LabTestImport;
