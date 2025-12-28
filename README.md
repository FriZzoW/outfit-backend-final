# Outfit Extension Backend

Backend API pour l'extension Chrome Outfit - Gestion des paiements Stripe.

## Déploiement sur Vercel

### Étape 1 : Créer le repo GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur le **+** en haut à droite → **New repository**
3. Nom : `outfit-backend`
4. **Public** (requis pour Vercel gratuit)
5. Cliquez **Create repository**

### Étape 2 : Pusher le code

```bash
# Dans ce dossier outfit-backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/outfit-backend.git
git push -u origin main
```

### Étape 3 : Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez **Add New...** → **Project**
3. Sélectionnez votre repo `outfit-backend`
4. Cliquez **Deploy**

### Étape 4 : Configurer les variables d'environnement

Dans Vercel, allez dans votre projet → **Settings** → **Environment Variables**

Ajoutez ces variables :

| Name | Value |
|------|-------|
| `STRIPE_SECRET_KEY` | Votre clé secrète Stripe (sk_test_xxx) |
| `STRIPE_PRICE_TIER1` | L'ID du prix Basic (price_xxx) |
| `STRIPE_PRICE_TIER2` | L'ID du prix Pro (price_xxx) |
| `STRIPE_PRICE_LIFETIME` | L'ID du prix Lifetime (price_xxx) |
| `SUCCESS_URL` | https://votre-projet.vercel.app/success.html |
| `CANCEL_URL` | https://votre-projet.vercel.app/cancel.html |
| `STRIPE_WEBHOOK_SECRET` | Votre secret webhook (whsec_xxx) |

### Étape 5 : Créer les prix dans Stripe

1. Allez dans [Stripe Dashboard](https://dashboard.stripe.com) → **Products**
2. Créez 3 produits :
   - **Basic** : 0.99€/mois (récurrent)
   - **Pro** : 1.99€/mois (récurrent)
   - **Illimité** : 2.99€ (paiement unique)
3. Copiez chaque "Price ID" (commence par `price_`)

## Structure du projet

```
outfit-backend/
├── api/
│   ├── create-checkout.js   # Crée une session Stripe
│   ├── verify-payment.js    # Vérifie le paiement
│   └── webhook.js           # Reçoit les événements Stripe
├── public/
│   ├── success.html         # Page après paiement réussi
│   └── cancel.html          # Page après annulation
├── package.json
├── vercel.json
└── README.md
```

## Endpoints

- `POST /api/create-checkout` - Crée une session de paiement
- `GET /api/verify-payment?sessionId=xxx` - Vérifie le statut
- `POST /api/webhook` - Webhook Stripe
