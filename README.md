# 🧪 LabraApp

**LabraApp** on full-stack-sovellus, joka yhdistää **Laravel**-pohjaisen backendin ja **React**-pohjaisen frontendin.  
Sovellus mahdollistaa laboratoriotulosten tarkastelun, haun ja hallinnan.  
Backend kommunikoi MySQL-tietokannan kanssa, jossa laboratoriotiedot sijaitsevat.

---

## 📁 Projektirakenne

```
LabraApp/
├── backend/      # Laravel 8 API (MySQL, Eloquent ORM)
└── frontend/     # React (Vite) käyttöliittymä, Axios-pyynnöt API:in
```

---

## ⚙️ Asennus ja käyttöönotto

### 🗄️ Tietokanta-asetukset

Oletuksena sovellus käyttää **MySQL**-kantaa (ks. `.env`).

> 💡 Jos sinulla on jo olemassa oleva MySQL-tietokanta (esim. `healthdb` ja taulu `labtestresults`),  
> ei tarvitse tehdä mitään — migration tarkistaa taulun olemassaolon automaattisesti.  
> Jos taulu puuttuu, se luodaan automaattisesti `php artisan migrate` -komennolla.

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

Siirry `backend`-hakemistoon ja asenna riippuvuudet:

```bash
cd backend
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

Siirry `frontend`-hakemistoon ja asenna npm-riippuvuudet:

```bash
cd frontend
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
|:-------|:----------|:--------|
| **GET** | `/api/labtestresults` | Hakee kaikki laboratoriotulokset |
| **GET** | `/api/labtestresults/{id}` | Hakee yksittäisen tuloksen ID:n perusteella |
| **GET** | `/api/labtestresults/person/{personID}` | Hakee kaikki henkilön tulokset |
| **GET** | `/api/labtestresults/person/{personID}/analysis/{name}` | Hakee tulokset henkilön ja analyysin nimen perusteella |
| **GET** | `/api/labtestresults/person/{personID}/dates/{start}/{end}` | Hakee henkilön tulokset aikaväliltä |
| **POST** | `/api/labtestresults` | Lisää uusi laboratoriotulos |
| **PUT** | `/api/labtestresults/{id}` | Päivittää olemassa olevan tuloksen |
| **DELETE** | `/api/labtestresults/{id}` | Poistaa tuloksen |

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

✅ Hakutoiminnot:  
- PersonID-haku  
- Rajaus päivämäärävälillä  
- Rajaus analyysinimen osalla  
- Taulukon järjestäminen sarakeotsikoista (nouseva/laskeva)  

🚧 Tulossa:  
- Useiden rivien valinta ja muokkaus ja poisto  
- Uuden tuloksen lisäyslomake  

---

## 👩‍💻 Tekijä

**Seija Lauronen**  
🗂️ [github.com/SeijaLauronen](https://github.com/SeijaLauronen)

---

## 📜 Lisenssi

Tämä projekti on tarkoitettu henkilökohtaiseen ja oppimiskäyttöön.
