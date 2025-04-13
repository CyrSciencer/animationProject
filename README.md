# Projet d'Animation Three.js React

Ce projet est une application React simple qui utilise Three.js pour afficher un modèle 3D animé (`door.glb`).

## Fonctionnalités

- Affiche une scène 3D à l'aide de `Three.js` dans un composant React (`ThreeScene.jsx`).
- Charge un modèle 3D au format GLB (`public/models/door.glb`).
- Ajuste automatiquement la caméra pour cadrer le modèle chargé.
- Rend l'arrière-plan de la scène Three.js transparent.
- Déclenche des animations spécifiques ("opening" et "closing") du modèle lors des événements `mouseenter` et `mouseleave` sur le conteneur de la scène.
- Utilise un fondu enchaîné (crossfade) pour des transitions d'animation fluides.

## Prérequis

- Node.js (version 18 ou supérieure recommandée)
- Yarn (ou npm)

## Installation

1.  Clonez le dépôt (si vous l'avez mis sur une plateforme Git) :
    ```bash
    git clone <url-du-depot>
    cd <nom-du-dossier-projet>
    ```
2.  Installez les dépendances :
    ```bash
    yarn install
    ```
    ou
    ```bash
    npm install
    ```

## Lancement du Serveur de Développement

Pour lancer l'application en mode développement :

```bash
yarn dev
```

ou

```bash
npm run dev
```

Ouvrez votre navigateur et allez à l'URL indiquée dans le terminal (généralement `http://localhost:5173`).

## Structure du Projet (Simplifiée)

```
.
├── public/
│   └── models/
│       └── door.glb        # Modèle 3D et animations
├── src/
│   ├── components/
│   │   ├── ThreeScene.jsx      # Composant React principal pour la scène 3D
│   │   └── ThreeScene.module.css # Styles pour le conteneur
│   │
│   ├── App.css
│   ├── App.jsx             # Composant racine de l'application React
│   └── main.jsx            # Point d'entrée de l'application
├── .gitignore
├── index.html              # Fichier HTML principal
├── package.json            # Dépendances et scripts du projet
├── README.md               # Ce fichier
└── vite.config.js          # Configuration de Vite
```

## Personnalisation

- **Modèle 3D :** Remplacez le fichier `public/models/door.glb` par votre propre modèle. Assurez-vous que les noms des animations ("opening", "closing") correspondent à ceux utilisés dans `src/components/ThreeScene.jsx` ou mettez à jour les noms dans le code.
- **Comportement de la Caméra :** Ajustez `CAMERA_Y_OFFSET` ou le multiplicateur de distance (`cameraZ *= ...`) dans `ThreeScene.jsx` pour modifier le cadrage.
- **Animations :** L'animation a été pensée pour simuler un survol (`hover`). Il vous faudra donc 2 animations : une qui s'activera lorsque votre souris entrera dans la `div` du modèle 3D (`mouseenter`) et une qui s'activera au moment de la sortie (`mouseleave`).
- **Conseils sur les animations :**
  - Faites en sorte que la dernière frame (image clé) de l'animation de sortie corresponde à la première frame de l'animation d'entrée.
  - De même, la dernière frame de l'animation d'entrée devrait correspondre à la première frame de l'animation de sortie.
- **Note :** Vous pouvez extraire ce composant (`ThreeScene.jsx`) pour l'utiliser dans vos propres projets.
