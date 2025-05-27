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
        physics: { solver: 'forceAtlas2Based', forceAtlas2Based: { gravitationalConstant: -70, springLength: 200 } },
        interaction: { hover: true }
    };
    const network = new vis.Network(graphContainer, graphData, graphOptions);

    // --- 4. Core Helper Functions ---

    function saveData() {
        const allRecipes = nodes.get({ fields: ['recipeData'] }).map(node => node.recipeData);
        localStorage.setItem('ingrediMapRecipes', JSON.stringify(allRecipes));
        console.log("Data saved successfully.");
    }

    async function loadData() {
        const savedRecipes = localStorage.getItem('ingrediMapRecipes');
        if (savedRecipes && savedRecipes.length > 2) {
            console.log("Loading data from localStorage.");
            return JSON.parse(savedRecipes);
        } else {
            console.log("LocalStorage empty. Loading initial data from recipes.json.");
            const response = await fetch('recipes.json');
            return await response.json();
        }
    }

    function populateGraph(recipes) {
        if (!recipes || recipes.length === 0) {
            console.log("No recipes to populate.");
            return;
        }

        const recipeNodes = recipes.map(recipe => ({
            id: recipe.id, label: recipe.name, recipeData: recipe,
            color: CUISINE_COLORS[recipe.cuisine] || CUISINE_COLORS['default']
        }));
        nodes.add(recipeNodes);

        const newEdges = [];
        for (let i = 0; i < recipes.length; i++) {
            for (let j = i + 1; j < recipes.length; j++) {
                const ingredients1 = new Set((recipes[i].ingredients || []).map(ing => ing.toLowerCase().trim()));
                const ingredients2 = new Set((recipes[j].ingredients || []).map(ing => ing.toLowerCase().trim()));
                const sharedIngredients = [...ingredients1].filter(ing => ingredients2.has(ing));

                if (sharedIngredients.length >= SHARED_INGREDIENT_THRESHOLD) {
                    newEdges.push({ from: recipes[i].id, to: recipes[j].id, title: `Shared: ${sharedIngredients.join(', ')}` });
                }
            }
        }
        edges.add(newEdges);
    }

    function addSingleRecipeAndEdges(recipe) {
        nodes.add({
            id: recipe.id, label: recipe.name, recipeData: recipe,
            color: CUISINE_COLORS[recipe.cuisine] || CUISINE_COLORS['default']
        });

        const newEdges = [];
        const existingNodesData = nodes.get({ filter: n => n.id !== recipe.id });
        existingNodesData.forEach(existingNode => {
            const ingredients1 = new Set((recipe.ingredients || []).map(ing => ing.toLowerCase().trim()));
            const ingredients2 = new Set((existingNode.recipeData.ingredients || []).map(ing => ing.toLowerCase().trim()));
            const sharedIngredients = [...ingredients1].filter(ing => ingredients2.has(ing));

            if (sharedIngredients.length >= SHARED_INGREDIENT_THRESHOLD) {
                newEdges.push({ from: recipe.id, to: existingNode.id, title: `Shared: ${sharedIngredients.join(', ')}` });
            }
        });
        edges.add(newEdges);
    }

    function updateInfoPanel(nodeId) {
        selectedNodeId = nodeId;
        if (!selectedNodeId) {
            infoPanel.classList.remove('show');
            return;
        }
        const recipeData = nodes.get(selectedNodeId).recipeData;
        infoRecipeName.textContent = recipeData.name;
        infoRecipeCuisine.textContent = `Cuisine: ${recipeData.cuisine}`;
        infoIngredientList.innerHTML = '';
        (recipeData.ingredients || []).forEach(ing => { const li = document.createElement('li'); li.textContent = ing; infoIngredientList.appendChild(li); });
        infoInstructionsList.innerHTML = '';
        (recipeData.instructions || []).forEach(step => { const li = document.createElement('li'); li.textContent = step; infoInstructionsList.appendChild(li); });
        infoPanel.classList.add('show');
    }

    // --- 5. Event Handlers ---

    function handleFormSubmit(event) {
        event.preventDefault();
        const recipeIdToEdit = editModeIdInput.value;
        const name = document.getElementById('recipe-name').value;
        const cuisine = document.getElementById('recipe-cuisine').value;
        const ingredients = document.getElementById('recipe-ingredients').value.split(',').map(item => item.trim());
        const instructions = document.getElementById('recipe-instructions').value.split('\n').filter(step => step.trim() !== '');

        if (recipeIdToEdit) {
            const updatedRecipe = { id: recipeIdToEdit, name, cuisine, ingredients, instructions };
            nodes.remove(recipeIdToEdit);
            addSingleRecipeAndEdges(updatedRecipe);
        } else {
            const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
            const newRecipe = { id, name, cuisine, ingredients, instructions };
            addSingleRecipeAndEdges(newRecipe);
        }
        saveData();
        recipeForm.reset();
        editModeIdInput.value = '';
        modal.classList.remove('show');
    }

    function handleAddClick() {
        formTitle.textContent = "Add to IngrediMap";
        recipeForm.reset();
        editModeIdInput.value = '';
        modal.classList.add('show');
    }

    function handleEditClick() {
        if (!selectedNodeId) return;
        const data = nodes.get(selectedNodeId).recipeData;
        formTitle.textContent = "Edit Recipe";
        editModeIdInput.value = data.id;
        document.getElementById('recipe-name').value = data.name;
        document.getElementById('recipe-cuisine').value = data.cuisine;
        document.getElementById('recipe-ingredients').value = (data.ingredients || []).join(', ');
        document.getElementById('recipe-instructions').value = (data.instructions || []).join('\n');
        modal.classList.add('show');
    }

    function handleDeleteClick() {
        if (!selectedNodeId) return;
        const nodeToDelete = nodes.get(selectedNodeId);
        if (confirm(`Are you sure you want to delete "${nodeToDelete.recipeData.name}"?`)) {
            nodes.remove(selectedNodeId);
            updateInfoPanel(null);
            saveData();
        }
    }

    function handleNetworkClick(params) {
        if (params.nodes.length > 0) {
            updateInfoPanel(params.nodes[0]);
        } else {
            updateInfoPanel(null);
        }
    }

    // --- 6. Attach Event Listeners ---
    addRecipeBtn.addEventListener('click', handleAddClick);
    editRecipeBtn.addEventListener('click', handleEditClick);
    deleteRecipeBtn.addEventListener('click', handleDeleteClick);
    closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    window.addEventListener('click', (event) => { if (event.target === modal) modal.classList.remove('show'); });
    recipeForm.addEventListener('submit', handleFormSubmit);
    network.on('click', handleNetworkClick);

    // --- 7. Application Initialization ---
    async function initializeApp() {
        const recipes = await loadData();
        populateGraph(recipes);
    }

    initializeApp();
});