# IngrediMap: A Visual Recipe Network 🍲

IngrediMap is an interactive web application that visualizes a network of recipes. Recipes are represented as nodes, and connections (edges) are drawn between them if they share a certain number of ingredients. It provides a unique way to discover new recipes based on the ingredients you already have. The application allows for adding, editing, and deleting recipes, with all data saved to your browser's local storage.

***

## Features ✨

* **Interactive Graph Visualization**: Recipes are displayed as nodes in a dynamic, physics-based graph using the `vis.js` library.
* **Recipe Relationships**: Edges between recipes instantly show you which dishes share common ingredients.
* **Detailed Information Panel**: Click on a recipe node to view its full details, including cuisine type, ingredients, and step-by-step instructions.
* **CRUD Functionality**:
    * **Add**: Easily add new recipes to your personal collection through a simple form.
    * **Edit**: Modify existing recipes to tweak ingredients or instructions.
    * **Delete**: Remove recipes you no longer need.
* **Local Data Persistence**: Your recipe collection is automatically saved to the browser's `localStorage`, so your data persists between sessions.
* **Initial Data Loading**: On first launch or when `localStorage` is empty, the application loads a set of sample recipes from a `recipes.json` file.

***

## Tech Stack 💻

* **Frontend**: HTML5, CSS3, JavaScript (ES6+)
* **Visualization Library**: `vis.js` (specifically `vis-network`) for creating the interactive graph.
* **Data Storage**: Browser `localStorage` for client-side data persistence.

***

## Getting Started 🚀

To run IngrediMap locally, you'll need a live server to handle fetching the initial `recipes.json` file.

1.  **Prerequisites**:
    * A modern web browser (e.g., Chrome, Firefox, Safari).
    * A local web server. If you have Node.js installed, you can use the `live-server` package.

2.  **Setup**:
    * Clone this repository or download the source code.
    * Place the `index.html`, `style.css`, `script.js`, and `recipes.json` files in the same directory.
    * If you don't have `live-server`, install it via npm:
        ```bash
        npm install -g live-server
        ```

3.  **Running the Application**:
    * Open your terminal or command prompt.
    * Navigate to the project directory.
    * Run the command:
        ```bash
        live-server
        ```
    * Your browser will automatically open to the IngrediMap application.

***

## How to Use 🧑‍🍳

* **Explore**: Click and drag nodes to explore the recipe network. Hover over the lines (edges) to see the shared ingredients.
* **View a Recipe**: Click on any recipe circle (node) to open the info panel on the right, which displays the recipe's details.
* **Add a Recipe**: Click the "**Add Recipe**" button to open a modal form. Fill in the details and submit to add it to the graph.
* **Edit a Recipe**: First, click on a recipe to open its details in the info panel. Then, click the "**Edit Recipe**" button. The form will be pre-filled with the recipe's current information for you to modify.
* **Delete a Recipe**: Select a recipe by clicking on it, then click the "**Delete Recipe**" button. You'll be asked to confirm the deletion.

***

## File Structure 📂
The project is organized with the main Electron and configuration files at the top level, and all the frontend rendering code inside the `src` directory.

. \
├── node_modules/      # Directory where dependencies are installed (auto-generated) \
├── src/               # Contains all frontend source code \
│   ├── index.html     # The main HTML for the renderer process \
│   ├── style.css      # Styles for the application \
│   ├── script.js      # Core application logic, event handling, and vis.js integration \
│   └── recipes.json   # Initial seed data with sample recipes \
├── main.js            # The main Electron process script \
├── package.json       # Project metadata and dependencies \
├── package-lock.json  # Exact versions of dependencies \
└── icon.ico           # Application icon \