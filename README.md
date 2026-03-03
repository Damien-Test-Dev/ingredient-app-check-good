# Ingredient App (Pack v1)

App statique **data-driven** : catalogue + fiche détaillée (MTC + nutrition).

## Démarrer en local

```bash
npm install
npm run generate:index
npm run validate:data
npm run dev
```

## Ajouter un ingrédient
1) Ajouter un fichier : `public/data/ingredients/<entry.id>.json`  
   ⚠️ Nom du fichier = `<entry.id>.json`

2) Regénérer + valider :
```bash
npm run generate:index
npm run validate:data
```

## Aliases (IDs)
Le pack peut contenir des références historiques (ex. `wu_wei_zi`) qui pointent vers un ingrédient canonique (`schisandra_fruit`).
Ces mappings sont dans `public/data/aliases.json`.
