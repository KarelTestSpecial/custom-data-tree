document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const accordionContainer = document.getElementById('accordion-container');
    const addRootNodeBtn = document.getElementById('add-root-node-btn');
    const addChildBtn = document.getElementById('add-child-btn');
    const editTitleBtn = document.getElementById('edit-title-btn');
    const deleteNodeBtn = document.getElementById('delete-node-btn');

    // --- STATE MANAGEMENT ---
    let state = {
        nodes: [],
        selectedNodeId: null,
        nextId: 1,
        openNodes: new Set()
    };

    // --- DATA PERSISTENCE ---
    function saveState() {
        const stateToSave = { ...state, openNodes: Array.from(state.openNodes) };
        localStorage.setItem('accordionState', JSON.stringify(stateToSave));
    }

    function loadState() {
        const savedState = localStorage.getItem('accordionState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            parsedState.openNodes = new Set(parsedState.openNodes);
            state = parsedState;
        }
    }

    // --- DOM RENDERING & SYNCING ---
    function render() {
        accordionContainer.innerHTML = '';
        state.nodes.forEach(node => {
            accordionContainer.appendChild(createNodeElement(node));
        });
        updateActionButtons();
        // Use a slightly longer timeout to give the browser time to paint before calculating height.
        setTimeout(updateAllHeights, 100);
    }

    function updateAllHeights() {
        const contentElements = document.querySelectorAll('.accordion-content');

        const reversedElements = Array.from(contentElements).reverse();
        reversedElements.forEach(content => {
            const parentItem = content.parentElement;
            if (!parentItem) return;
            const id = parseInt(parentItem.dataset.id, 10);
            if (state.openNodes.has(id)) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0px';
            }
        });
    }

    function createNodeElement(node) {
        const isSelected = node.id === state.selectedNodeId;
        const isOpen = state.openNodes.has(node.id);

        const item = document.createElement('div');
        item.className = `accordion-item ${isSelected ? 'selected' : ''}`;
        item.dataset.id = node.id;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'accordion-title';
        titleDiv.innerHTML = `<span class="title-text">${node.title}</span><span class="toggle-btn">${isOpen ? '-' : '+'}</span>`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'accordion-content';

        const contentArea = document.createElement('div');
        contentArea.className = 'content-area';
        contentArea.innerHTML = `<p>Inhoud van ${node.title}.</p>`;

        const nestedContainer = document.createElement('div');
        nestedContainer.className = 'nested-accordion';

        if (node.children && node.children.length > 0) {
            node.children.forEach(childNode => {
                nestedContainer.appendChild(createNodeElement(childNode));
            });
        }

        contentDiv.appendChild(contentArea);
        contentDiv.appendChild(nestedContainer);
        item.appendChild(titleDiv);
        item.appendChild(contentDiv);

        return item;
    }

    // --- UI & ACTION HELPERS ---
    function updateActionButtons() {
        const isNodeSelected = state.selectedNodeId !== null;
        addChildBtn.disabled = !isNodeSelected;
        editTitleBtn.disabled = !isNodeSelected;
        deleteNodeBtn.disabled = !isNodeSelected;
    }

    function findNodeById(nodes, id) {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    function deleteNodeRecursive(nodes, id) {
        return nodes.filter(node => {
            if (node.id === id) return false;
            if (node.children) node.children = deleteNodeRecursive(node.children, id);
            return true;
        });
    }

    // --- EVENT LISTENERS ---
    addRootNodeBtn.addEventListener('click', () => {
        const title = prompt("Voer de titel voor de nieuwe hoofd node in:", `Node ${state.nextId}`);
        if (title) {
            state.nodes.push({ id: state.nextId++, title: title, children: [] });
            saveState();
            render();
        }
    });

    addChildBtn.addEventListener('click', () => {
        if (state.selectedNodeId === null) return;
        const title = prompt("Voer de titel voor de nieuwe kind node in:", `Kind Node ${state.nextId}`);
        if (title) {
            const parentNode = findNodeById(state.nodes, state.selectedNodeId);
            if (parentNode) {
                if (!parentNode.children) parentNode.children = [];
                parentNode.children.push({ id: state.nextId++, title: title, children: [] });
                state.openNodes.add(parentNode.id);
                saveState();
                render();
            }
        }
    });

    editTitleBtn.addEventListener('click', () => {
        if (state.selectedNodeId === null) return;
        const node = findNodeById(state.nodes, state.selectedNodeId);
        if (node) {
            const newTitle = prompt("Voer de nieuwe titel in:", node.title);
            if (newTitle && newTitle.trim()) {
                node.title = newTitle.trim();
                saveState();
                render();
            }
        }
    });

    deleteNodeBtn.addEventListener('click', () => {
        if (state.selectedNodeId === null) return;
        if (confirm('Weet je zeker dat je deze node en alle kinderen wilt verwijderen?')) {
            state.nodes = deleteNodeRecursive(state.nodes, state.selectedNodeId);
            state.openNodes.delete(state.selectedNodeId);
            state.selectedNodeId = null;
            saveState();
            render();
        }
    });

    accordionContainer.addEventListener('click', (e) => {
        const titleElement = e.target.closest('.accordion-title');
        if (titleElement) {
            const itemElement = titleElement.closest('.accordion-item');
            const id = parseInt(itemElement.dataset.id, 10);

            state.selectedNodeId = id;

            if (state.openNodes.has(id)) {
                state.openNodes.delete(id);
            } else {
                state.openNodes.add(id);
            }

            saveState();
            render();
        }
    });

    // --- INITIALIZATION ---
    loadState();
    render();
});
