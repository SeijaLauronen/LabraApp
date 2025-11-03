// apufunktio: muuntaa esim. "27.3.2024" tai "27.3.2024 14:30" -> "2024-03-27 14:30:00"
export function parseDateToMySQL(s) {
  if (!s) return null;
  s = s.toString().trim();
  // jos tyhjä
  if (!s) return null;

  // erotetaan mahdollinen kellonaika välilyönnillä
  const parts = s.split(' ').filter(Boolean);
  const datePart = parts[0];
  const timePart = parts[1] || '';

  // päivä.kuukausi.vuosi tai muu erotin
  const dparts = datePart.split(/[.\-\/]/);
  if (dparts.length === 3) {
    let day = dparts[0].padStart(2, '0');
    let month = dparts[1].padStart(2, '0');
    let year = dparts[2];
    if (year.length === 2) year = '20' + year;
    let time = '00:00:00';
    if (timePart) {
      // normaaliisoaika muodostus, käsitellään H:MM tai H.MM tai H:MM:SS
      const t = timePart.replace(',', ':');
      const tp = t.split(':');
      if (tp.length >= 2) {
        const hh = tp[0].padStart(2, '0');
        const mm = tp[1].padStart(2, '0');
        const ss = (tp[2] || '00').padStart(2, '0');
        time = `${hh}:${mm}:${ss}`;
      } else {
        time = '00:00:00';
      }
    }
    return `${year}-${month}-${day} ${time}`;
  }

  // fallback: yritä Date-olion avulla
  const dt = new Date(s);
  if (!isNaN(dt)) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    const ss = String(dt.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }

  return null;
}
