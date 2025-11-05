// SL 202510: Parser for lab results (Omakanta or Excel copy-paste)
// TODO tunnista viitearvojen yli tai ali menevät paremmin

import { parseDateToMySQL } from "./dates";


// Excel type copy-paste parser, fixed type from 'hyvinvointitaulukko'
export function parseExcel(text, personID) {
  const rows = text.trim().split(/\r?\n/).filter(Boolean);
  const parsed = rows.map((line) => {    
    // assume tab-separated; if not, try comma
    const cols = line.split("\t");
    if (cols.length === 1) {
      // try comma separator (CSV)
      cols.splice(0, cols.length, ...line.split(","));
    }

    return {
      PersonID: personID,
      SampleDate: parseDateToMySQL(cols[0] || ""),
      CompanyUnitName: cols[1] || "",
      AnalysisName: cols[2] || "",
      Result: (cols[3] || "").trim(),
      MinimumValue: cols[4] || "",
      MaximumValue: cols[5] || "",
      AdditionalText: cols[6] || "",
    };
  });

  return parsed;
}


// SL 202511 - Omakanta-style parser 
// Handles lines starting with date, name, result, reference values, additional info
// also supports combining lines, reference value handling, statements, etc.
// returns an array of objects with fields PersonID, SampleDate, AnalysisName, Result, Unit, MinimumValue, MaximumValue, ValueReference, AdditionalText 

export function parseOmakanta(text, personID) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed = [];
  let block = [];
  let viiteTavoiteMin = "";
  let viiteTavoiteMax = "";
  let lausuntoText = "";

  // flush current block into parsed results
  function flushBlock() {
    if (block.length === 0) return;
    const joined = block.join("\t").replace(/\s{2,}/g, "\t").trim();
    block = [];

    const cols = joined.split("\t").map(c => c.trim()).filter(c => c !== "");
    let dateStr = cols[0] || "";
    let name = cols[1] || "";
    let resultPart = "";
    let refPart = "";
    let comment = "";
    
    // --- separate result, reference values and additional info ---
    if (cols.length >= 3) {
      resultPart = cols[2];
      if (cols[3]) refPart = cols[3];
      if (cols[4]) comment = cols.slice(4).join(" ");
    } else {
      const parts = joined.split(/\t| {2,}/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        dateStr = parts[0];
        name = parts[1];
        resultPart = parts[2];
        if (parts[3]) refPart = parts[3];
        if (parts[4]) comment = parts.slice(4).join(" ");
      } else return;
    }

    // --- result and unit ---
    let result = "";
    let unit = "";
    const rMatch = resultPart.match(/^([<>]?\s*[\d.,*]+)\s*(.*)$/);
    if (rMatch) {
      result = rMatch[1].trim();
      unit = (rMatch[2] || "").trim();
    } else {
      result = resultPart;
    }


    // ---- reference values parsing ----
    let min = "";
    let max = "";
    let refUnit = "";

    if (refPart) {
      // esim: 77 ml/min/1.73m2-  => min=77
      const weirdDash = refPart.match(/^([<>]?\s*[\d.,*]+)\s*([\w/.\d]+)-$/);
      if (weirdDash) {
        min = weirdDash[1].replace(/[<>]/g, "").trim();
        refUnit = weirdDash[2].trim();
      } else {
        const mm = refPart.match(/^\s*([<>]?\s*[\d.,*]+)?\s*-\s*([<>]?\s*[\d.,*]+)?\s*(\S.*)?$/);
        if (mm && (mm[1] || mm[2])) {
          if (mm[1]) min = mm[1].replace(/[<>]/g, "").trim();
          if (mm[2]) max = mm[2].replace(/[<>]/g, "").trim();
          refUnit = (mm[3] || "").trim();
        } else {
          const lt = refPart.match(/<\s*([\d.,*]+)/);
          const gt = refPart.match(/>\s*([\d.,*]+)/);
          if (lt) max = lt[1].trim();
          else if (gt) min = gt[1].trim();
          else if (!comment) comment = refPart;
        }
      }
    }

    if (viiteTavoiteMin) min = viiteTavoiteMin;
    if (viiteTavoiteMax) max = viiteTavoiteMax;

    if (lausuntoText) {
      comment = comment ? `${lausuntoText} | ${comment}` : lausuntoText;
    }

    if (refUnit && unit && refUnit === unit) refUnit = "";

    let additionalText = comment || "";
    let abnormal = false;
    
    if (additionalText && /li viitearvon/i.test(additionalText)) {
      abnormal = true;
      if (result && !result.startsWith("*")) result = "*" + result;
    }

    // cut long names
    if (name.length > 50) {
      const cutIndex = name.lastIndexOf(" ", 50);
      const nameCut = name.slice(0, cutIndex > 30 ? cutIndex : 50).trim();
      const rest = name.slice(nameCut.length).trim();
      additionalText = (rest ? rest + ". " : "") + additionalText;
      name = nameCut;
    }

    parsed.push({
      PersonID: personID,
      SampleDate: parseDateToMySQL(dateStr),
      AnalysisName: name,
      Result: result,
      Unit: unit,
      MinimumValue: min,
      MaximumValue: max,
      ValueReference: refUnit || "",
      AdditionalText: additionalText || "",
    });

    viiteTavoiteMin = "";
    viiteTavoiteMax = "";
    lausuntoText = "";
  }

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    if (/^Viitearvoteksti:/i.test(ln)) {
      const match = ln.match(/TAVOITE\s*([<>])\s*([\d.,*]+)/i);
      if (match) {
        if (match[1] === "<") viiteTavoiteMax = match[2];
        if (match[1] === ">") viiteTavoiteMin = match[2];
      }
      continue;
    }

    if (/^Lausunto/i.test(ln)) {
      lausuntoText = ln;
      continue;
    }

    if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(ln)) {
      flushBlock();
      block = [ln];
    } else {
      block.push(ln);
    }
  }
  flushBlock();

  return parsed;
}
