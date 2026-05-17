# TripManager — Guide de démarrage

Ce guide explique comment lancer l'application **TripManager** sur votre ordinateur, étape par étape, même sans expérience avancée en développement.

---

## Ce dont vous avez besoin (à installer une seule fois)

Avant de commencer, assurez-vous d'avoir les outils suivants installés :

| Outil | Rôle | Lien de téléchargement |
|---|---|---|
| **Python 3.10+** | Fait tourner le serveur backend | https://www.python.org/downloads/ |
| **Node.js 18+** | Fait tourner le frontend React | https://nodejs.org/ |
| **VS Code** | Éditeur de code recommandé | https://code.visualstudio.com/ |

> **Vérification rapide** — ouvrez un terminal et tapez :
> ```
> python --version
> node --version
> ```
> Les deux commandes doivent afficher un numéro de version sans erreur.

---

## Structure du projet

```
Trip/
├── backend/    → Serveur Django (API, base de données)
└── frontend/   → Application React (interface utilisateur)
```

Les deux parties doivent tourner en même temps pour que l'application fonctionne.

---

## Étape 1 — Ouvrir le projet dans VS Code

1. Ouvrez **VS Code**
2. Cliquez sur **Fichier → Ouvrir le dossier**
3. Sélectionnez le dossier `Trip`
4. VS Code vous propose d'ouvrir un terminal : acceptez, ou ouvrez-en un via **Terminal → Nouveau terminal**

---

## Étape 2 — Lancer le Backend (Django)

Dans le terminal de VS Code, tapez les commandes suivantes **une par une** :

```bash
cd backend
```

```bash
python -m venv env
```
> Cette commande crée un environnement isolé. Elle n'est nécessaire qu'**une seule fois**.

**Sous Windows :**
```bash
env\Scripts\activate
```

**Sous Mac / Linux :**
```bash
source env/bin/activate
```

> Vous devriez voir `(env)` apparaître au début de la ligne dans le terminal. C'est normal.

```bash
pip install -r requirements.txt
```
> Installe toutes les dépendances Python. À faire une seule fois (ou si le fichier `requirements.txt` change).

```bash
python manage.py migrate
```
> Prépare la base de données. À faire une seule fois (ou après une mise à jour).

```bash
python manage.py runserver
```
> Lance le serveur backend. Laissez ce terminal ouvert.

✅ Le backend est prêt quand vous voyez :
```
Starting development server at http://127.0.0.1:8000/
```

---

## Étape 3 — Lancer le Frontend (React)

Ouvrez un **deuxième terminal** dans VS Code (cliquez sur le `+` à côté du terminal existant), puis tapez :

```bash
cd frontend
```

```bash
npm install

```
>Si cette commande ne fonctionne pas:
```bash
npm install --force
``

> Installe les dépendances JavaScript. À faire une seule fois (ou si `package.json` change).

```bash
npm run dev
```
> Lance l'interface utilisateur. Laissez ce terminal ouvert.

✅ Le frontend est prêt quand vous voyez :
```
  ➜  Local:   http://localhost:5173/
```

---

## Étape 4 — Ouvrir l'application

Ouvrez votre navigateur et allez à l'adresse :

**[http://localhost:5173](http://localhost:5173)**

---

## Créer un compte administrateur (optionnel)

Si vous souhaitez accéder au tableau de bord admin, créez un super-utilisateur Django.  
Dans le terminal du **backend** (avec l'environnement activé), tapez :

```bash
python manage.py createsuperuser
```

Puis suivez les instructions (nom d'utilisateur, email, mot de passe).

> Vous pouvez aussi créer un compte directement depuis l'interface en choisissant le rôle **admin**, **agent** ou **client** à l'inscription.

---

## Arrêter l'application

Pour arrêter les serveurs, allez dans chaque terminal et appuyez sur :

**`Ctrl + C`**

---

## Résolution des problèmes courants

| Problème | Solution |
|---|---|
| `python: command not found` | Essayez `python3` à la place de `python` |
| `pip: command not found` | Essayez `pip3` à la place de `pip` |
| Port 8000 déjà utilisé | Lancez avec `python manage.py runserver 8001` |
| Port 5173 déjà utilisé | Vite choisit automatiquement le port suivant disponible |
| Page blanche dans le navigateur | Vérifiez que les deux terminaux sont bien actifs |
| Erreur CORS | Assurez-vous que le backend tourne bien sur le port **8000** |

---

## Résumé — démarrage rapide (après la première installation)

Une fois tout installé, les prochaines fois il suffit de :

**Terminal 1 — Backend :**
```bash
cd backend
source env/bin/activate    # (ou env\Scripts\activate sous Windows)
python manage.py runserver
```

**Terminal 2 — Frontend :**
```bash
cd frontend
npm run dev
```

Puis ouvrir **http://localhost:5173** dans le navigateur.
