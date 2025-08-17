// Wait for the DOM to be fully loaded before running the app script
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const networkContainer = document.getElementById('mynetwork');
    const infoPanel = document.getElementById('info-panel');
    const infoContent = document.getElementById('info-content');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const editRecipeBtn = document.getElementById('edit-recipe-btn');
    const deleteRecipeBtn = document.getElementById('delete-recipe-btn');
    const addRecipeFab = document.getElementById('add-recipe-fab');
    const recipeModal = document.getElementById('recipe-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const recipeForm = document.getElementById('recipe-form');
    const modalTitle = document.getElementById('modal-title');

    // --- Global State ---
    let recipes = [];
    let nodes = new vis.DataSet([]);
    let edges = new vis.DataSet([]);
    let network = null;
    let selectedRecipeId = null;
    const cuisineColors = {};
    const colorPalette = [
        '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF',
        '#A0C4FF', '#BDB2FF', '#FFC6FF', '#FFFFFC'
    ];
    let colorIndex = 0;


    // --- Core Functions ---

    /**
     * Assigns a consistent color to each cuisine type for visualization.
     * @param {string} cuisine The cuisine type (e.g., "Italian").
     * @returns {string} A hex color code.
     */
    function getColorForCuisine(cuisine) {
        if (!cuisine) return '#CCCCCC'; // Default color for uncategorized
        if (!cuisineColors[cuisine]) {
            cuisineColors[cuisine] = colorPalette[colorIndex % colorPalette.length];
            colorIndex++;
        }
        return cuisineColors[cuisine];
    }

    /**
     * Loads recipes from localStorage or fetches initial data from recipes.json
     */
    async function loadRecipes() {
        const storedRecipes = localStorage.getItem('ingrediMapRecipes');
        if (storedRecipes && storedRecipes.length > 2) { // Check for non-empty array
            recipes = JSON.parse(storedRecipes);
        } else {
            try {
                const response = await fetch('recipes.json');
                if (!response.ok) throw new Error('Network response was not ok');
                const initialRecipes = await response.json();
                // Ensure all recipes have an ID and ingredients are objects
                recipes = initialRecipes.map((recipe, index) => ({
                    ...recipe,
                    id: recipe.id || index + 1,
                    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map(ing => typeof ing === 'string' ? { name: ing } : ing) : []
                }));
                saveRecipes();
            } catch (error) {
                console.error('Failed to fetch initial recipes:', error);
            }
        }
        updateGraph();
    }

    /**
     * Saves the current recipes array to localStorage
     */
    function saveRecipes() {
        localStorage.setItem('ingrediMapRecipes', JSON.stringify(recipes));
    }

    /**
     * Re-calculates and redraws the entire network graph from the recipes array
     */
    function updateGraph() {
        const newNodes = [];
        const newEdges = [];
        const edgeTracker = new Set();

        // Create a node for each recipe
        recipes.forEach(recipe => {
            newNodes.push({
                id: recipe.id,
                label: recipe.name,
                title: recipe.cuisine,
                shape: 'dot',
                color: getColorForCuisine(recipe.cuisine),
                value: recipe.ingredients.length // Size node by ingredient count
            });
        });

        // Compare every recipe with every other recipe to create edges
        for (let i = 0; i < recipes.length; i++) {
            for (let j = i + 1; j < recipes.length; j++) {
                const recipeA = recipes[i];
                const recipeB = recipes[j];

                const ingredientsA = recipeA.ingredients.map(ing => ing.name.toLowerCase().trim());
                const ingredientsB = recipeB.ingredients.map(ing => ing.name.toLowerCase().trim());

                const ingredientsBSet = new Set(ingredientsB);
                const sharedIngredients = ingredientsA.filter(name => ingredientsBSet.has(name));

                // FIX: Changed the condition from '>= 2' to '>= 1' to show an edge for a single shared ingredient.
                if (sharedIngredients.length >= 1) {
                    const edgeId = `${recipeA.id}-${recipeB.id}`;
                    if (!edgeTracker.has(edgeId)) {
                        newEdges.push({
                            from: recipeA.id,
                            to: recipeB.id,
                            value: sharedIngredients.length,
                            title: `Shared: ${sharedIngredients.join(', ')}`
                        });
                        edgeTracker.add(edgeId);
                    }
                }
            }
        }

        // Update the DataSet, which automatically redraws the network
        nodes.clear();
        edges.clear();
        nodes.add(newNodes);
        edges.add(newEdges);
    }

    /**
     * Initializes the vis.js network with options
     */
    function initializeNetwork() {
        const options = {
            nodes: {
                font: { size: 16, color: '#333' },
                borderWidth: 2,
            },
            edges: {
                color: {
                    color: '#cccccc',
                    highlight: '#007bff',
                    hover: '#848484'
                },
                smooth: true,
            },
            physics: {
                solver: 'forceAtlas2Based',
                stabilization: { iterations: 150 }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
            },
        };
        const data = { nodes, edges };
        network = new vis.Network(networkContainer, data, options);
        setupNetworkEventListeners();
    }

    // --- UI and Event Handling ---

    /**
     * Sets up event listeners for the network graph (e.g., clicks on nodes)
     */
    function setupNetworkEventListeners() {
        network.on('click', (params) => {
            if (params.nodes.length > 0) {
                const recipeId = params.nodes[0];
                selectedRecipeId = recipeId;
                displayRecipeInfo(recipeId);
            } else {
                hideInfoPanel();
            }
        });
    }

    /**
     * Displays the selected recipe's details in the info panel
     * @param {number} recipeId The ID of the recipe to display
     */
    function displayRecipeInfo(recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        infoContent.innerHTML = `
            <h2>${recipe.name}</h2>
            <p><em>${recipe.cuisine}</em></p>
            <h3>Ingredients</h3>
            <ul>
                ${recipe.ingredients.map(ing => `<li>${ing.name}</li>`).join('')}
            </ul>
            <h3>Instructions</h3>
            <ol>
                ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
            </ol>
        `;
        infoPanel.classList.add('info-panel-visible');
    }

    /**
     * Hides the recipe info panel
     */
    function hideInfoPanel() {
        infoPanel.classList.remove('info-panel-visible');
        selectedRecipeId = null;
        network.unselectAll();
    }

    /**
     * Shows the modal for adding or editing a recipe
     * @param {object|null} recipeToEdit The recipe object to edit, or null to add a new one
     */
    function showModal(recipeToEdit = null) {
        recipeForm.reset();
        if (recipeToEdit) {
            modalTitle.textContent = 'Edit Recipe';
            document.getElementById('recipe-id').value = recipeToEdit.id;
            document.getElementById('recipe-name').value = recipeToEdit.name;
            document.getElementById('recipe-cuisine').value = recipeToEdit.cuisine;
            document.getElementById('recipe-ingredients').value = recipeToEdit.ingredients.map(ing => ing.name).join(', ');
            document.getElementById('recipe-instructions').value = recipeToEdit.instructions.join('\n');
        } else {
            modalTitle.textContent = 'Add a New Recipe';
        }
        recipeModal.classList.remove('modal-hidden');
        recipeModal.style.display = 'flex'; // Use flex to center it
    }

    /**
     * Hides the add/edit recipe modal
     */
    function hideModal() {
        recipeModal.classList.add('modal-hidden');
        recipeModal.style.display = 'none';
    }

    /**
     * Handles the form submission for adding or editing a recipe
     * @param {Event} event The form submission event
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        const id = document.getElementById('recipe-id').value;

        const ingredientsArray = document.getElementById('recipe-ingredients').value
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .map(name => ({ name }));

        const newRecipe = {
            id: id ? parseInt(id) : Date.now(), // Use timestamp for new unique ID
            name: document.getElementById('recipe-name').value,
            cuisine: document.getElementById('recipe-cuisine').value,
            ingredients: ingredientsArray,
            instructions: document.getElementById('recipe-instructions').value.split('\n').map(s => s.trim()).filter(Boolean),
        };

        if (id) { // Editing existing recipe
            const index = recipes.findIndex(r => r.id === newRecipe.id);
            if (index !== -1) recipes[index] = newRecipe;
        } else { // Adding new recipe
            recipes.push(newRecipe);
        }

        saveRecipes();
        updateGraph();
        hideModal();

        if (id) {
            network.selectNodes([newRecipe.id]);
            displayRecipeInfo(newRecipe.id);
        }
    }

    /**
     * Handles the deletion of the currently selected recipe
     */
    function handleDeleteRecipe() {
        if (!selectedRecipeId) return;

        if (confirm(`Are you sure you want to delete this recipe?`)) {
            recipes = recipes.filter(r => r.id !== selectedRecipeId);
            saveRecipes();
            updateGraph();
            hideInfoPanel();
        }
    }

    // --- Event Listener Bindings ---
    addRecipeFab.addEventListener('click', () => showModal());
    closeModalBtn.addEventListener('click', hideModal);
    closePanelBtn.addEventListener('click', hideInfoPanel);
    recipeForm.addEventListener('submit', handleFormSubmit);
    editRecipeBtn.addEventListener('click', () => {
        if (!selectedRecipeId) return;
        const recipe = recipes.find(r => r.id === selectedRecipeId);
        showModal(recipe);
    });
    deleteRecipeBtn.addEventListener('click', handleDeleteRecipe);

    // --- App Initialization ---
    initializeNetwork();
    loadRecipes();
});
