# IngrediMap: A Visual Recipe Network 🍲

IngrediMap is an interactive desktop application that visualizes a network of recipes. Recipes are represented as nodes, and connections (edges) are drawn between them if they share a certain number of ingredients. It provides a unique way to discover new recipes based on the ingredients you already have. The application allows for adding, editing, and deleting recipes, with all data saved locally on your machine.

***

## Features ✨

* **Interactive Graph Visualization**: Recipes are displayed as nodes in a dynamic, physics-based graph using the `vis.js` library.
* **Recipe Relationships**: Edges between recipes instantly show you which dishes share common ingredients.
* **Detailed Information Panel**: Click on a recipe node to view its full details, including cuisine type, ingredients, and step-by-step instructions.
* **CRUD Functionality**:
    * **Add**: Easily add new recipes to your personal collection through a simple form.
    * **Edit**: Modify existing recipes to tweak ingredients or instructions.
    * **Delete**: Remove recipes you no longer need.
* **Local Data Persistence**: Your recipe collection is automatically saved to the browser's `localStorage`, so your data persists between application launches.
* **Initial Data Loading**: On first launch or when storage is empty, the application loads a set of sample recipes from a `recipes.json` file.

***

## Tech Stack 💻

* **Framework**: Electron
* **Frontend**: HTML5, CSS3, JavaScript (ES6+)
* **Visualization Library**: `vis.js` (specifically `vis-network`)
* **Data Storage**: Browser `localStorage` for client-side data persistence.

***

## Getting Started: Building the Application 🚀

To run IngrediMap, you first need to install its dependencies. You can then either run it in a live development mode or build a final, standalone executable.

1.  **Prerequisites**:
    * [Node.js](https://nodejs.org/) and `npm` installed on your system.

2.  **Installation**:
    * Clone this repository to your local machine.
    * Navigate to the project's root directory in your terminal.
    * Install all the required dependencies using npm:
        ```bash
        npm install
        ```

3.  **Running in Development Mode**:
    * To run the application in a live-reloading development environment without creating an executable, use the `start` command:
        ```bash
        npm run start
        ```
    * This will launch the application window and automatically reload it if you make changes to the source code.

4.  **Building the Executable**:
    * To compile the application into a standalone executable for your current operating system (e.g., `.exe` for Windows, `.dmg` for macOS), run the `make` command:
        ```bash
        npm run make
        ```
    * The build process will begin, and upon completion, you will find the final application in a new `out` directory.

***

## How to Use 🧑‍🍳

After building the application using the steps above, navigate to the `out` directory and find the subfolder containing the finished build. Launch the IngrediMap executable to start the application.

* **Explore**: Click and drag nodes to explore the recipe network. Hover over the lines (edges) to see the shared ingredients.
* **View a Recipe**: Click on any recipe circle (node) to open the info panel on the right, which displays the recipe's details.
* **Add a Recipe**: Click the `+` button in the bottom-right corner to open a modal form. Fill in the details and submit to add it to the graph.
* **Edit a Recipe**: First, click on a recipe to open its details in the info panel. Then, click the "**Edit**" button. The form will be pre-filled with the recipe's current information for you to modify.
* **Delete a Recipe**: Select a recipe by clicking on it, then click the "**Delete**" button in the info panel. You'll be asked to confirm the deletion.

***

## File Structure 📂

The project is organized with the main Electron and configuration files at the top level, and all the frontend rendering code inside the `src` directory.

.
├── out/               # Directory where builds are output (auto-generated) \
├── node_modules/      # Directory where dependencies are installed (auto-generated) \
├── src/               # Contains all frontend source code \
│   ├── index.html     # The main HTML for the renderer process \
│   ├── style.css      # Styles for the application \
│   ├── app.js         # Core application logic, event handling, and vis.js integration \
│   └── recipes.json   # Initial seed data with sample recipes \
├── main.js            # The main Electron process script \
├── package.json       # Project metadata and dependencies \
├── package-lock.json  # Exact versions of dependencies \
├── preload.js         # Preload File for secure IPC channels between main and renderer \
└── icon.ico           # Application icon \