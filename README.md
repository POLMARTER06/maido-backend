# Backend LA TABLE DU MAIDO v3

Backend Node.js / Express / SQLite / Socket.IO pour l'application de gestion de restaurant **LA TABLE DU MAIDO**.

## Installation locale

```bash
npm install
npm run dev   # ou: node server.js
```

API principale :
- `GET  /api/ping`
- `GET  /api/users`
- `POST /api/users`
- `GET  /api/tables`
- `POST /api/tables`
- `PATCH /api/tables/:id`
- `GET  /api/products`
- `GET  /api/orders?status=en_cours|payee|annulee`
- `POST /api/orders`
- `POST /api/orders/:id/items`
- `PATCH /api/orders/:id/pay`
- `PATCH /api/items/:id/status`
- `GET  /api/bar`
- `GET  /api/tickets`
- `GET  /api/tickets/:id`
- `GET  /api/logs`

Le fichier SQLite \`restaurant.db\` est créé automatiquement au premier lancement.
