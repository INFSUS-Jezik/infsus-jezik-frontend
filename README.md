# INFSUS - DZ03 - Frontend

Ovo je frontend komponenta za DZ03 domaću zadaću iz kolegija INFSUS (Informacijski sustavi) na FER-u.

---

## Korištene tehnologije

*   React
*   TypeScript
*   Vite
*   Tailwind CSS
*   Axios
*   React Router DOM
*   Testing Library (za testiranje)

---

## Preduvjeti

Prije pokretanja projekta, potrebno je imati instalirano:

*   **Node.js** (preporučena LTS verzija, npr. v18 ili v20+)
*   **npm** (obično dolazi s Node.js) ili **yarn**

---

## Kako buildati i pokrenuti projekt

### 1. Kloniraj repozitorij (ako već nisi)

```bash
git clone https://github.com/INFSUS-Jezik/infsus-jezik-frontend.git
cd infsus-jezik-frontend
```

### 2. Instaliraj ovisnosti (dependencies)

```bash
npm install
# ili ako koristite yarn:
# yarn install
```

### 3. Pokretanje aplikacije u razvojnom modu

```bash
npm run dev
# ili ako koristite yarn:
# yarn dev
```
Aplikacija će biti dostupna na `http://localhost:5173` (ili drugom portu specificiranom od strane Vite).

### 4. Build aplikacije za produkciju

```bash
npm run build
# ili ako koristite yarn:
# yarn build
```
Buildana aplikacija će se nalaziti u `dist` direktoriju.

---

## Pokretanje testova

Za pokretanje definiranih frontend testova:

```bash
npm test
# ili ako koristite yarn:
# yarn test
```
