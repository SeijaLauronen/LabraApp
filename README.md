# 🧪 LabraApp

**LabraApp** on full-stack-sovellus, joka yhdistää **Laravel**-pohjaisen backendin ja **React**-pohjaisen frontendin.  
Sovellus mahdollistaa laboratoriotulosten tarkastelun, haun ja hallinnan.  
Backend kommunikoi MySQL-tietokannan kanssa, jossa laboratoriotiedot sijaitsevat.

---

## 📁 Projektirakenne

```
LabraApp/
├── LabraBackend/      # Laravel API (MySQL, Eloquent ORM)
└── labra-frontend/    # React (Vite) käyttöliittymä, Axios-pyynnöt API:in
```
---

## 🧩 Tärkeimmät tiedostot

Projektin tärkeimmät koodikohdat on myös merkitty tunnisteella: // SL 202510:

| Polku | Kuvaus |
|:------|:--------|
| **LabraBackend** | Laravel-pohjainen backend |
|  `app/Http/Controllers/LabTestResultController.php` | Controller – käsittelee tietokantaan menevän ja sieltä tulevan datan |
|  `app/Models/LabTestResult.php` | Eloquent-malli `labtestresults`-taululle |
|  `database/migrations/2025_10_13_082633_create_labtestresults_table.php` | Migraatio, joka luo taulun jos sitä ei ole |
|  `routes/api.php` | API-reitit `LabTestResult`-controllerille |
|  `tests/tests.http` | REST Client -testit API-päätepisteille |
|  `.env.example` | Kopioi nimellä `.env` ja aseta tietokanta-arvot |
|  `storage/logs/laravel.log` | Laravel-lokitiedosto |
| **labra-frontend** | React-pohjainen käyttöliittymä |
|  `src/App.jsx` | Pääsovelluskomponentti |
|  `src/LabResults.jsx` | Labratulosten UI-komponentti |
|  `src/components/LabTestResultHeader.jsx` | Taulukon otsikkokomponentti (vaakasuora/pystysuora) |
|  `src/components/LabTestResultRow.jsx` | Yksittäisen rivin komponentti |
|  `src/components/LabTestResultsEditor.jsx` | Muokkauskomponentti tulosten syöttöön |
|  `src/definitions/labfields.js` | Kenttämäärittelyt labratuloksille |

---

## ⚙️ Asennus ja käyttöönotto

### 🗄️ Tietokanta-asetukset

Oletuksena sovellus käyttää **MySQL**-kantaa (ks. `.env`).

> 💡 Jos sinulla on jo olemassa oleva MySQL-tietokanta (esim. `healthdb` ja taulu `labtestresults`),  
> ei tarvitse tehdä mitään — migration tarkistaa taulun olemassaolon automaattisesti.  
> Jos taulu puuttuu, se luodaan automaattisesti `php artisan migrate` -komennolla.

> ℹ️ Huom:  
> Laravelin oletuskomponentti *Sanctum* on poistettu tästä projektista,  
> koska sovellus ei sisällä käyttäjien kirjautumista eikä API-tunnuksia.  
> Tämä estää ylimääräisten taulujen, kuten `personal_access_tokens`, luomisen.

Jos haluat luoda taulun itse, käytä seuraavaa rakennetta:

```sql
CREATE TABLE `labtestresults` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `PersonID` varchar(10) NOT NULL,
  `SampleDate` datetime DEFAULT NULL,
  `CombinedName` varchar(200) DEFAULT NULL,
  `AnalysisName` varchar(50) DEFAULT NULL,
  `AnalysisShortName` varchar(50) DEFAULT NULL,
  `AnalysisCode` varchar(50) DEFAULT NULL,
  `Result` varchar(50) DEFAULT NULL,
  `MinimumValue` varchar(10) DEFAULT NULL,
  `MaximumValue` varchar(10) DEFAULT NULL,
  `ValueReference` varchar(100) DEFAULT NULL,
  `Unit` varchar(10) DEFAULT NULL,
  `Cost` double DEFAULT NULL,
  `CompanyUnitName` varchar(50) DEFAULT NULL,
  `AdditionalInfo` varchar(50) DEFAULT NULL,
  `AdditionalText` varchar(300) DEFAULT NULL,
  `ResultAddedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `ToMapDate` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

### 1️⃣ Backend (Laravel)

Siirry `LabraBackend`-hakemistoon ja asenna riippuvuudet:

```bash
cd LabraBackend
composer install
```

Kopioi `.env.example` tiedostoksi `.env` ja muokkaa tietokantayhteys:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=healthdb
DB_USERNAME=root
DB_PASSWORD=
```

Generoi sovelluksen avain ja käynnistä palvelin:

```bash
php artisan key:generate
php artisan serve
```

Laravel toimii oletuksena osoitteessa:  
👉 http://localhost:8000

---

### 2️⃣ Frontend (React)

Siirry `labra-frontend`-hakemistoon ja asenna npm-riippuvuudet:

```bash
cd labra-frontend
npm install
```

Käynnistä React-sovellus:

```bash
npm run dev
```

Frontend toimii oletuksena osoitteessa:  
👉 http://localhost:5173

---

## 🔌 API-päätepisteet

| Tyyppi | Endpoint | Kuvaus |
|:-------|:---------|:-------|
| **GET** | `/api/labtestresults` | Hae kaikki laboratoriotulokset (index). |
| **GET** | `/api/labtestresults/{id}` | Hae yksittäinen tulos ID:n perusteella (show). |
| **GET** | `/api/labtestresults/search` | Joukkohaku, vaatii `personID` query‑parametrin.<br>Tukee lisäparametreja:<br>• `startDate`, `endDate`<br>• `searchTerm`<br>• `sortField`, `sortOrder`<br>• `perPage`<br><br>Esimerkki:<br>`/api/labtestresults/search?`<br>`personID=TEST123&`<br>`startDate=2025-10-01&`<br>`endDate=2025-10-31&`<br>`searchTerm=gluk` |
| **POST** | `/api/labtestresults` | Lisää uusi laboratoriotulos (store). |
| **POST** | `/api/labtestresults/import` | Tuo useita laboratoriotuloksia kerralla.<br>Data lähetetään JSON-taulukkona, esim:<br>```json<br>[{"PersonID":"test123","SampleDate":"2025-03-27 00:00:00","AnalysisName":"Ferritiini (Ferrit)","Result":"347"}]<br>```<br>Palauttaa: `{ "success": true }` jos tuonti onnistuu. |
| **PUT** | `/api/labtestresults/{id}` | Päivitä olemassa oleva tulos (update). |
| **DELETE** | `/api/labtestresults/{id}` | Poista tulos (destroy). |

Huom: reititys määritelty siten, että spesifiset reitit (esim. `/labtestresults/search`) ovat ennen `Route::apiResource('labtestresults', ...)` tiedostossa `routes/api.php`, jotta `/search` ei huku resurssireittien alle.

Esimerkki hakupyynnöstä:
```
GET /api/labtestresults/search?personID=TEST123&startDate=2025-10-01&endDate=2025-10-31&searchTerm=gluk
```
---

## 🔄 Datan kulku (React → Laravel → MySQL)

Frontend (React) käyttää **Axiosia** lähettääkseen HTTP-pyyntöjä Laravelin REST API:in.  
Laravel käsittelee pyynnön ja hakee/päivittää tietoja **MySQL-tietokannassa** Eloquent ORM:n avulla.

```
┌────────────────────┐        Axios (GET/POST/PUT/DELETE)       ┌────────────────────────────┐
│  React Frontend    │  ─────────────────────────────────────▶ │  Laravel Backend (API)     │
│  - LabResults.jsx  │                                          │  - routes/api.php          │
│  - axios.get(...)  │  ◀───────────────────────────────────── │  - LabTestResultController │
└────────────────────┘        JSON response                     └────────────┬───────────────┘
                                                                           │
                                                                           ▼
                                                              ┌──────────────────────────┐
                                                              │   MySQL Database         │
                                                              │   - labtestresults       │
                                                              └──────────────────────────┘
```

💡  
- React huolehtii näkymästä ja käyttäjän syötteistä  
- Laravel toimii välikerroksena (API)  
- MySQL tallentaa datan pysyvästi  

---

## 🧠 Kehitysvaiheet

✅ Toiminnot:  
- Uuden tuloksen lisäys
- Tulosten haku henkilön tunnuksella  
- Tulosten rajaus päivämäärävälillä  
- Tulosten rajaus analyysinimen osalla  
- Taulukon järjestäminen sarakeotsikoista (nouseva/laskeva) 
- Useiden rivien valinta ja niiden muokkaus, poisto sekä kopiointi uusien tulosten pohjaksi 

🚧 Tulossa:  
- Käyttöliittymän parannus  
- Lisää hakuehtoja
- Tulosten massatuonti  

---

## 👩‍💻 Tekijä

**Seija Lauronen**  
🗂️ [github.com/SeijaLauronen](https://github.com/SeijaLauronen)

---

## 📜 Lisenssi

Tämä projekti on tarkoitettu henkilökohtaiseen ja oppimiskäyttöön.
