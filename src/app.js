// app.js (in src directory)
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM and State Variables ---
    const graphContainer = document.getElementById('recipe-graph');
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    const modal = document.getElementById('add-recipe-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const recipeForm = document.getElementById('recipe-form');
    const infoPanel = document.getElementById('info-panel');
    const infoRecipeName = document.getElementById('info-recipe-name');
    const infoRecipeCuisine = document.getElementById('info-recipe-cuisine');
    const infoIngredientList = document.getElementById('info-ingredient-list');
    const infoInstructionsList = document.getElementById('info-instructions-list');
    const formTitle = document.getElementById('form-title');
    const editRecipeBtn = document.getElementById('edit-recipe-btn');
    const deleteRecipeBtn = document.getElementById('delete-recipe-btn');
    const editModeIdInput = document.getElementById('edit-mode-id');
    let selectedNodeId = null;

    // --- 2. Configuration ---
    const SHARED_INGREDIENT_THRESHOLD = 1;
    const CUISINE_COLORS = { 'Italian': '#ff8a65', 'Mexican': '#4db6ac', 'Dessert': '#ce93d8', 'default': '#64b5f6' };

    // --- 3. Vis.js Network Setup ---
    const nodes = new vis.DataSet([]);
    const edges = new vis.DataSet([]);
    const graphData = { nodes, edges };
    const graphOptions = {
        nodes: { shape: 'dot', size: 20, font: { size: 15, color: '#ffffff' }, borderWidth: 2, },
        edges: { width: 1.5, color: { color: '#818181', highlight: '#C3C3C3' }, smooth: { type: 'continuous' } },
        physics: { solver: 'forceAtlas2Based', forceAtlas2Based: { gravitationalConstant: -70, springLength: 200, centralGravity: 0.01 } },
        interaction: { hover: true, tooltipDelay: 200 }
    };
    let network = null; // Initialize network later to ensure container is ready

    // --- 4. Core Helper Functions ---

    // Parses an ingredient string like "Flour (1 cup), Sugar" into objects.
    function parseIngredientsString(ingredientsStr) {
        if (!ingredientsStr) return [];
        return ingredientsStr.split(',').map(item => {
            const match = item.trim().match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                return { name: match[1].trim(), quantity: match[2].trim() };
            } else {
                return { name: item.trim(), quantity: '' };
            }
        });
    }

    // Formats an array of ingredient objects back into a string for the input field.
    function formatIngredientsArray(ingredientsArr) {
        if (!ingredientsArr || ingredientsArr.length === 0) return '';
        return ingredientsArr.map(ing => {
            if (ing.quantity) {
                return `${ing.name} (${ing.quantity})`;
            }
            return ing.name;
        }).join(', ');
    }

    function saveData() {
        try {
            const allRecipes = nodes.get({ fields: ['id', 'recipeData'] }).map(node => node.recipeData);
            localStorage.setItem('ingrediMapRecipes', JSON.stringify(allRecipes));
            console.log("Data saved successfully to localStorage.");
        } catch (e) {
            console.error("Error saving data to localStorage:", e);
            // Potentially notify user if localStorage is full or disabled
        }
    }

    async function loadData() {
        try {
            const savedRecipes = localStorage.getItem('ingrediMapRecipes');
            if (savedRecipes && savedRecipes.length > 2) { // Basic check for non-empty array string "[]"
                console.log("Loading data from localStorage.");
                return JSON.parse(savedRecipes);
            } else {
                console.log("LocalStorage empty or invalid. Loading initial data from recipes.json.");
                const response = await fetch('recipes.json'); // Assumes recipes.json is in the same dir as index.html (src)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            }
        } catch (error) {
            console.error("Error loading data:", error);
            // Fallback to empty array or handle error appropriately
            alert(`Could not load recipe data. Error: ${error.message}\nStarting with an empty map.`);
            return [];
        }
    }

    function populateGraph(recipes) {
        if (!recipes || recipes.length === 0) {
            console.log("No recipes to populate.");
            return;
        }

        // Clear existing graph data before populating
        nodes.clear();
        edges.clear();

        const recipeNodes = recipes.map(recipe => ({
            id: recipe.id, // Ensure recipes have a unique 'id'
            label: recipe.name,
            recipeData: recipe,
            color: CUISINE_COLORS[recipe.cuisine] || CUISINE_COLORS['default'],
            title: `Cuisine: ${recipe.cuisine}` // Tooltip for node
        }));
        nodes.add(recipeNodes);

        const newEdges = [];
        for (let i = 0; i < recipes.length; i++) {
            for (let j = i + 1; j < recipes.length; j++) {
                const ingredients1 = new Set((recipes[i].ingredients || []).map(ing => ing.name.toLowerCase().trim()));
                const ingredients2 = new Set((recipes[j].ingredients || []).map(ing => ing.name.toLowerCase().trim()));
                const sharedIngredients = [...ingredients1].filter(ing => ingredients2.has(ing));

                if (sharedIngredients.length >= SHARED_INGREDIENT_THRESHOLD) {
                    newEdges.push({
                        from: recipes[i].id,
                        to: recipes[j].id,
                        title: `Shared Ingredients: ${sharedIngredients.join(', ')} (${sharedIngredients.length})`,
                        value: sharedIngredients.length // Optional: for edge weighting if desired
                    });
                }
            }
        }
        edges.add(newEdges);
        if (network) {
            network.fit(); // Adjust view to fit all nodes after populating
        }
    }

    function addSingleRecipeAndEdges(recipe) {
        // Check if node with this ID already exists to prevent duplicates if not handled by form logic
        if (nodes.get(recipe.id)) {
            console.warn(`Recipe with ID ${recipe.id} already exists. Update logic might be needed or ID generation revised.`);
            // For now, we'll proceed, which will effectively update if vis.js handles it, or error if not.
            // A safer approach might be to remove and then add, or use nodes.update().
            // For simplicity, assuming ID is unique for new adds.
        }

        nodes.add({
            id: recipe.id,
            label: recipe.name,
            recipeData: recipe,
            color: CUISINE_COLORS[recipe.cuisine] || CUISINE_COLORS['default'],
            title: `Cuisine: ${recipe.cuisine}`
        });

        const newEdges = [];
        const existingNodesData = nodes.get({ filter: n => n.id !== recipe.id }); // Get all other nodes

        const ingredients1 = new Set((recipe.ingredients || []).map(ing => ing.name.toLowerCase().trim()));

        existingNodesData.forEach(existingNode => {
            if (!existingNode.recipeData || !existingNode.recipeData.ingredients) return; // Skip if data is incomplete

            const ingredients2 = new Set((existingNode.recipeData.ingredients || []).map(ing => ing.name.toLowerCase().trim()));
            const sharedIngredients = [...ingredients1].filter(ing => ingredients2.has(ing));

            if (sharedIngredients.length >= SHARED_INGREDIENT_THRESHOLD) {
                newEdges.push({
                    from: recipe.id,
                    to: existingNode.id,
                    title: `Shared Ingredients: ${sharedIngredients.join(', ')} (${sharedIngredients.length})`,
                    value: sharedIngredients.length
                });
            }
        });
        edges.add(newEdges);
    }

    function updateRecipeAndEdges(updatedRecipe) {
        // Remove existing node and its edges
        nodes.remove(updatedRecipe.id); // This also removes connected edges by default

        // Add the updated recipe back as if it's a new one
        addSingleRecipeAndEdges(updatedRecipe);
    }


    function updateInfoPanel(nodeId) {
        selectedNodeId = nodeId;
        if (!selectedNodeId) {
            infoPanel.classList.remove('show');
            return;
        }
        const nodeData = nodes.get(selectedNodeId);
        if (!nodeData || !nodeData.recipeData) {
            console.error("Selected node has no recipe data:", selectedNodeId);
            infoPanel.classList.remove('show');
            return;
        }
        const recipeData = nodeData.recipeData;

        infoRecipeName.textContent = recipeData.name || "N/A";
        infoRecipeCuisine.textContent = `Cuisine: ${recipeData.cuisine || "N/A"}`;

        infoIngredientList.innerHTML = ''; // Clear previous ingredients
        (recipeData.ingredients || []).forEach(ing => {
            const li = document.createElement('li');
            li.textContent = ing.quantity ? `${ing.name} (${ing.quantity})` : ing.name;
            infoIngredientList.appendChild(li);
        });
        if ((recipeData.ingredients || []).length === 0) {
            infoIngredientList.innerHTML = '<li>No ingredients listed.</li>';
        }

        infoInstructionsList.innerHTML = ''; // Clear previous instructions
        (recipeData.instructions || []).forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            infoInstructionsList.appendChild(li);
        });
        if ((recipeData.instructions || []).length === 0) {
            infoInstructionsList.innerHTML = '<li>No instructions provided.</li>';
        }

        infoPanel.classList.add('show');
    }

    // --- 5. Event Handlers ---

    function handleFormSubmit(event) {
        event.preventDefault();
        const recipeIdToEdit = editModeIdInput.value;
        const name = document.getElementById('recipe-name').value.trim();
        const cuisine = document.getElementById('recipe-cuisine').value.trim();
        const ingredientsString = document.getElementById('recipe-ingredients').value;
        const instructionsString = document.getElementById('recipe-instructions').value;

        if (!name || !cuisine) {
            alert("Recipe Name and Cuisine are required.");
            return;
        }

        const ingredients = parseIngredientsString(ingredientsString);
        const instructions = instructionsString.split('\n').map(step => step.trim()).filter(step => step !== '');

        if (recipeIdToEdit) { // Editing existing recipe
            const updatedRecipe = { id: recipeIdToEdit, name, cuisine, ingredients, instructions };
            updateRecipeAndEdges(updatedRecipe); // Use the new update function
            if (selectedNodeId === recipeIdToEdit) { // Re-select and update panel if it was selected
                updateInfoPanel(recipeIdToEdit);
            }
        } else { // Adding new recipe
            // Generate a more robust unique ID
            const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newRecipe = { id, name, cuisine, ingredients, instructions };
            addSingleRecipeAndEdges(newRecipe);
        }
        saveData();
        recipeForm.reset();
        editModeIdInput.value = ''; // Clear edit mode ID
        modal.classList.remove('show');
        formTitle.textContent = "Add to IngrediMap"; // Reset form title
    }

    function handleAddClick() {
        formTitle.textContent = "Add to IngrediMap";
        recipeForm.reset();
        editModeIdInput.value = ''; // Ensure not in edit mode
        document.getElementById('recipe-name').focus(); // Focus on the first input
        modal.classList.add('show');
    }

    function handleEditClick() {
        if (!selectedNodeId) {
            alert("Please select a recipe to edit.");
            return;
        }
        const nodeData = nodes.get(selectedNodeId);
        if (!nodeData || !nodeData.recipeData) {
            alert("Could not retrieve recipe data for editing.");
            return;
        }
        const data = nodeData.recipeData;

        formTitle.textContent = "Edit Recipe";
        editModeIdInput.value = data.id; // Set the ID for edit mode
        document.getElementById('recipe-name').value = data.name;
        document.getElementById('recipe-cuisine').value = data.cuisine;
        document.getElementById('recipe-ingredients').value = formatIngredientsArray(data.ingredients);
        document.getElementById('recipe-instructions').value = (data.instructions || []).join('\n');
        modal.classList.add('show');
    }

    function handleDeleteClick() {
        if (!selectedNodeId) {
            alert("Please select a recipe to delete.");
            return;
        }
        const nodeToDelete = nodes.get(selectedNodeId);
        if (!nodeToDelete || !nodeToDelete.recipeData) {
            alert("Could not retrieve recipe data for deletion.");
            return;
        }

        // Use custom modal for confirmation later if desired, for now, confirm is fine for Electron
        if (confirm(`Are you sure you want to delete "${nodeToDelete.recipeData.name}"? This cannot be undone.`)) {
            nodes.remove(selectedNodeId); // This also removes connected edges
            updateInfoPanel(null); // Clear and hide info panel
            selectedNodeId = null; // Reset selected node
            saveData();
        }
    }

    function handleNetworkClick(params) {
        if (params.nodes.length > 0) {
            updateInfoPanel(params.nodes[0]);
        } else {
            // Clicked on empty space, deselect
            updateInfoPanel(null);
        }
    }

    // --- 6. Attach Event Listeners ---
    addRecipeBtn.addEventListener('click', handleAddClick);
    editRecipeBtn.addEventListener('click', handleEditClick);
    deleteRecipeBtn.addEventListener('click', handleDeleteClick);
    closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    window.addEventListener('click', (event) => {
        if (event.target === modal) { // Click outside modal content
            modal.classList.remove('show');
        }
    });
    recipeForm.addEventListener('submit', handleFormSubmit);
    // Network click listener is attached after network initialization

    // --- IPC Handlers (for Import/Export) ---
    if (window.electronAPI && window.electronAPI.on) {
        // Listen for request from main process to send recipe data for export
        window.electronAPI.on('request-recipes-for-export', () => {
            console.log("Renderer: Received request for recipes to export.");
            try {
                const allRecipes = nodes.get({ fields: ['id', 'recipeData'] }).map(node => node.recipeData);
                // Send the data back to the main process
                window.electronAPI.send('response-recipes-for-export', allRecipes);
                console.log("Renderer: Sent recipes to main process for export.");
            } catch (e) {
                console.error("Renderer: Error getting recipes for export:", e);
                window.electronAPI.send('response-recipes-for-export', null); // Send null if error
            }
        });

        // Listen for imported recipe data from main process
        window.electronAPI.on('import-recipes-data', (importedRecipes) => {
            if (importedRecipes && Array.isArray(importedRecipes)) {
                console.log("Renderer: Received recipes to import:", importedRecipes.length, "recipes.");
                // Use custom modal later if desired
                if (confirm('Importing will replace your current recipe collection. This cannot be undone. Are you sure?')) {
                    try {
                        // Validate imported recipes structure (basic check)
                        const validRecipes = importedRecipes.filter(r => r && r.id && r.name);
                        if (validRecipes.length !== importedRecipes.length) {
                            alert("Warning: Some imported recipes were invalid and have been skipped.");
                        }

                        if (validRecipes.length === 0 && importedRecipes.length > 0) {
                            alert("Import failed: No valid recipes found in the file.");
                            return;
                        }
                        if (validRecipes.length === 0 && importedRecipes.length === 0) {
                            alert("Import canceled: The file contains no recipes.");
                            return;
                        }

                        populateGraph(validRecipes); // Populate graph with validated imported recipes
                        console.log("Renderer: Populated graph with imported recipes.");

                        saveData(); // Save the new collection to localStorage
                        console.log("Renderer: Saved imported data to localStorage.");

                        updateInfoPanel(null); // Clear info panel
                        alert(`Recipes imported successfully! ${validRecipes.length} recipes loaded.`);
                    } catch (error) {
                        console.error("Renderer: Error processing imported recipes:", error);
                        alert(`Error importing recipes: ${error.message}`);
                    }
                } else {
                    alert("Import canceled by user.");
                }
            } else {
                console.warn("Renderer: Received invalid data for import or import was empty.");
                alert('Could not import recipes: Invalid data format or empty file received.');
            }
        });
    } else {
        console.warn("Electron API not found (window.electronAPI is undefined). IPC for import/export will not work. Ensure preload.js is correctly configured and loaded.");
        // You might want to display a more user-friendly error on the UI itself if this happens
        const errorDiv = document.createElement('div');
        errorDiv.textContent = "Critical Error: Application features like Import/Export might be disabled. Please check console.";
        errorDiv.style.color = "red";
        errorDiv.style.position = "fixed";
        errorDiv.style.top = "10px";
        errorDiv.style.left = "10px";
        errorDiv.style.backgroundColor = "white";
        errorDiv.style.padding = "10px";
        errorDiv.style.zIndex = "2000";
        document.body.appendChild(errorDiv);
    }


    // --- 7. Application Initialization ---
    async function initializeApp() {
        // Initialize vis.js network
        if (graphContainer) {
            network = new vis.Network(graphContainer, graphData, graphOptions);
            network.on('click', handleNetworkClick); // Attach network click listener
        } else {
            console.error("Graph container not found! Network cannot be initialized.");
            alert("Fatal Error: Could not initialize recipe graph. Please check the HTML structure.");
            return;
        }

        const recipes = await loadData();
        populateGraph(recipes);

        // Optional: Fit the network to view after initial load
        if (network && recipes.length > 0) {
            setTimeout(() => network.fit(), 100); // Delay slightly for rendering
        }
    }

    initializeApp();
});
