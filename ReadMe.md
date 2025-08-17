IngrediMap: A Visual Recipe PWA 🍲
IngrediMap is an interactive Progressive Web App (PWA) that visualizes a network of recipes. It's designed to run on any modern browser, from desktop to mobile. Recipes are represented as nodes, and connections (edges) are drawn between them if they share ingredients, providing a unique way to discover new dishes based on what you already have.

Features ✨
Interactive Graph Visualization: Recipes are displayed as nodes in a dynamic, physics-based graph using the vis.js library.

Mobile-First & Responsive: The interface is designed to work beautifully on any screen size, from a large desktop monitor to your phone.

Home Screen Installation: On a supported mobile browser, you can "install" IngrediMap to your home screen, making it look and feel like a native app.

Offline Functionality: Thanks to Service Workers, the app caches all necessary files, allowing you to browse your recipes even without an internet connection.

Recipe Relationships: Edges between recipes instantly show you which dishes share common ingredients.

CRUD Functionality:

Add: Easily add new recipes to your personal collection through a simple form.

Edit: Modify existing recipes to tweak ingredients or instructions.

Delete: Remove recipes you no longer need.

Local Data Persistence: Your recipe collection is automatically saved to the browser's localStorage, so your data persists across sessions.

Tech Stack 💻
Frontend: HTML5, CSS3, JavaScript (ES6+)

App Framework: Progressive Web App (PWA) APIs (Service Workers, Web App Manifest)

Visualization Library: vis.js (specifically vis-network)

Data Storage: Browser localStorage for client-side data persistence.

Getting Started 🚀
To run IngrediMap locally for development, you'll need a simple web server, as modern browser security policies can restrict some PWA features from running directly from the local filesystem (file:///).

Prerequisites:

Node.js and npm installed on your system.

Installation:

Clone this repository to your local machine.

Navigate to the project's root directory in your terminal.

Install live-server, a simple development server:

npm install -g live-server

Running in Development Mode:

From the project's root directory, start the server on the public folder:

live-server public

Your default web browser will automatically open to the correct address. The server supports live-reloading, so any changes you make to the code will be reflected instantly.

Deployment 🌐
This application is a static website and can be deployed to any static hosting service. Excellent free options include:

GitHub Pages

Netlify (simply drag and drop the public folder)

Vercel

How to Use 🧑‍🍳
After launching the application, you can interact with it as follows:

Explore: Click and drag nodes to explore the recipe network. On mobile, you can use touch gestures like pinch-to-zoom.

View a Recipe: Tap on any recipe circle (node) to open the info panel, which displays the recipe's details.

Add a Recipe: Tap the + button in the bottom-right corner to open a modal form. Fill in the details and submit to add it to the graph.

Edit & Delete: Select a recipe by tapping on it, then use the "Edit" or "Delete" buttons in the info panel.

File Structure 📂
The project is organized with all frontend source code and PWA configuration files inside the public directory.

.
└── public/
├── app.js         # Core application logic, event handling, and vis.js integration
├── index.html     # The main HTML file for the application
├── manifest.json  # Web App Manifest for PWA properties
├── recipes.json   # Initial seed data with sample recipes
├── service-worker.js # Handles offline caching and PWA functionality
├── style.css      # All styles for the application, including responsive rules
└── icons/
├── icon-192.png # App icon for the home screen (192x192)
└── icon-512.png # Larger app icon for splash screens (512x512)
