# IngrediMap: A Visual Recipe PWA 🍲

IngrediMap is an interactive **Progressive Web App (PWA)** that visualizes your recipe collection as a dynamic network. It's built to run on any modern browser, from desktop to mobile, and helps you discover new meal ideas by connecting recipes that share common ingredients.

[**➡️ View the Live Demo Here**](https://alanreisenau.github.io/IngrediMap/)

## How It Works

IngrediMap creates a visual map of your recipes. Each recipe is a circle (or "node"), and a line is drawn between any two recipes that share ingredients. This allows you to see, at a glance, how your recipes are connected and discover new combinations based on the ingredients you have on hand.

## Features ✨

* **Interactive Graph Visualization**: A dynamic, physics-based graph of your recipes powered by `vis.js`.
* **Mobile-First & Responsive**: A clean interface that works beautifully on any screen size.
* **Home Screen App**: Installable on your phone for a native app-like experience.
* **Offline Functionality**: Browse your recipes anytime, even without an internet connection.
* **Local & Private Data**: All recipes are stored directly in your browser's `localStorage`. Your data stays on your device and is never uploaded to a server.
* **Full Recipe Management**: **Add**, **Edit**, and **Delete** recipes with a simple, intuitive interface.

## How to Use 🧑‍🍳

* **Explore**: Drag nodes to explore the recipe network. Use pinch-to-zoom on mobile.
* **View Details**: Tap any recipe node to see its full ingredient list and instructions.
* **Add a Recipe**: Use the **+** button to open the recipe form.
* **Edit & Delete**: Select a recipe to reveal the edit and delete options in the side panel.

## Tech Stack 💻

* **Frontend**: HTML5, CSS3, JavaScript (ES6+)
* **Framework**: Progressive Web App (PWA) APIs
* **Visualization**: `vis.js` Network
* **Storage**: Browser `localStorage`

## Deployment

This application is hosted on **GitHub Pages**. Any changes pushed to the `main` branch will automatically trigger a redeployment of the live site.
