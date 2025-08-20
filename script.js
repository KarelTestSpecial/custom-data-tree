document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const accordionContainer = document.getElementById('accordion-container');
    const addRootNodeBtn = document.getElementById('add-root-node-btn');
    const addChildBtn = document.getElementById('add-child-btn');
    const editTitleBtn = document.getElementById('edit-title-btn');
    const editContentBtn = document.getElementById('edit-content-btn');
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
            if (parsedState.nodes) {
                fixMissingStateProperties(parsedState.nodes);
            }
            parsedState.openNodes = new Set(parsedState.openNodes);
            state = parsedState;
        }
    }

    function fixMissingStateProperties(nodes) {
        nodes.forEach(node => {
            if (node.contentVisible === undefined) node.contentVisible = false;
            if (node.content === undefined) node.content = `Inhoud van ${node.title}.`;
            if (node.children) fixMissingStateProperties(node.children);
        });
    }

    // --- DOM RENDERING ---
    function render() {
        accordionContainer.innerHTML = '';
        state.nodes.forEach(node => {
            accordionContainer.appendChild(createNodeElement(node));
        });
        updateActionButtons();
    }

    function createNodeElement(node) {
        const isSelected = node.id === state.selectedNodeId;
        const isAccordionOpen = state.openNodes.has(node.id);
        const isContentVisible = node.contentVisible === true;

        const item = document.createElement('div');
        item.className = `accordion-item ${isSelected ? 'selected' : ''}`;
        item.dataset.id = node.id;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'accordion-title';
        titleDiv.innerHTML = `<span class="title-text">${node.title}</span><span class="accordion-toggle-btn">${isAccordionOpen ? '-' : '+'}</span>`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'accordion-content';
        if (!isAccordionOpen) contentDiv.classList.add('hidden');

        const contentArea = document.createElement('div');
        contentArea.className = 'content-area';

        const contentParagraph = document.createElement('p');
        contentParagraph.textContent = node.content; // Use content from state
        if (!isContentVisible) contentParagraph.classList.add('hidden');

        const contentToggleBtn = document.createElement('button');
        contentToggleBtn.className = 'content-toggle-btn';
        contentToggleBtn.textContent = '>';
        if (isContentVisible) contentToggleBtn.classList.add('open');

        contentArea.appendChild(contentToggleBtn);
        contentArea.appendChild(contentParagraph);

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
        editContentBtn.disabled = !isNodeSelected; // Update new button
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
            const newNode = {
                id: state.nextId++,
                title: title,
                children: [],
                contentVisible: false,
                content: `Inhoud van ${title}.` // Default content
            };
            state.nodes.push(newNode);
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
                const newNode = {
                    id: state.nextId++,
                    title: title,
                    children: [],
                    contentVisible: false,
                    content: `Inhoud van ${title}.`
                };
                parentNode.children.push(newNode);
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

    editContentBtn.addEventListener('click', () => {
        if (state.selectedNodeId === null) return;
        const node = findNodeById(state.nodes, state.selectedNodeId);
        if (node) {
            const newContent = prompt("Voer de nieuwe inhoud in:", node.content);
            if (newContent !== null) { // Allow empty content
                node.content = newContent;
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
        const itemElement = e.target.closest('.accordion-item');
        if (!itemElement) return;

        const id = parseInt(itemElement.dataset.id, 10);
        state.selectedNodeId = id;

        if (e.target.closest('.content-toggle-btn')) {
            const node = findNodeById(state.nodes, id);
            if (node) node.contentVisible = !node.contentVisible;
        }
        else if (e.target.closest('.accordion-title')) {
            if (state.openNodes.has(id)) {
                state.openNodes.delete(id);
            } else {
                state.openNodes.add(id);
            }
        }

        saveState();
        render();
    });

    // --- INITIALIZATION ---
    loadState();
    render();
});
