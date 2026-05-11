# Bella Coiffure — Salon Booking Platform

Plateforme de réservation en ligne pour le salon de coiffure Bella Coiffure à Djibouti.

## Stack Technique

- **React 18 + Vite** — Frontend SPA
- **Bootstrap 5.3** — UI components
- **Supabase** — PostgreSQL + Auth
- **EmailJS** — Emails de confirmation
- **React Router v6** — Navigation
- **Framer Motion** — Animations
- **react-hot-toast** — Notifications

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Remplir .env avec vos clés Supabase et EmailJS

# 3. Lancer le serveur de développement
npm run dev

# 4. Build pour la production
npm run build
```

## Configuration Supabase

1. Créer un projet sur supabase.com
2. Exécuter le schéma SQL dans `supabase/schema.sql` via l'éditeur SQL Supabase
3. Copier l'URL et la clé anon dans `.env`
4. Créer un utilisateur admin via **Authentication > Users** dans le dashboard Supabase

## Configuration EmailJS

1. Créer un compte sur emailjs.com
2. Créer un service email et un template
3. Le template doit utiliser les variables : `to_name`, `to_email`, `service_name`, `coiffeur_nom`, `appointment_date`, `appointment_time`, `service_price`
4. Copier les IDs dans `.env`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/services` | Liste des services |
| `/booking` | Réservation multi-étapes |
| `/booking/success` | Confirmation de RDV |
| `/admin/login` | Connexion admin |
| `/admin/dashboard` | Dashboard de gestion |

## Déploiement Vercel

```bash
npm i -g vercel
vercel
# Configurer les variables d'env dans le dashboard Vercel
```

## Structure du projet

```
src/
├── components/    Navbar, Footer, ProtectedRoute
├── pages/         Home, Services, Booking, BookingSuccess, AdminLogin, AdminDashboard, NotFound
├── constants/     photos.js, staff.js, services.js
├── context/       AuthContext.jsx
├── lib/           supabase.js
├── App.jsx
├── main.jsx
└── index.css
```
