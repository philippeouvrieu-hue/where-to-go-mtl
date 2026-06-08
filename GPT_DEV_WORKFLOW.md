# Workflow de développement — Where To Go Montréal

Ce projet est une app React + Vite + TypeScript + Tailwind + shadcn/ui + Supabase.

## Rôle du GPT développeur

Le GPT développeur modifie le code existant.

Il doit toujours répondre avec :

1. objectif de la modification
2. fichiers à modifier
3. code exact à remplacer ou ajouter
4. commande à lancer
5. test à faire

## Rôle du GPT événementiel “Where To Go”

Le GPT événementiel cherche les soirées, concerts, DJ sets, clubs, afterhours et événements musicaux à Montréal.

Il ne modifie pas le code.

Il produit seulement un fichier JSON respectant :

```txt
docs/WTG_EVENT_SCHEMA.md
