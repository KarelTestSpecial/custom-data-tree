document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const accordionContainer = document.getElementById('accordion-container');
    const addRootNodeBtn = document.getElementById('add-root-node-btn');
    const addChildBtn = document.getElementById('add-child-btn');
    const editTitleBtn = document.getElementById('edit-title-btn');
    const editContentBtn = document.getElementById('edit-content-btn');
    const deleteNodeBtn = document.getElementById('delete-node-btn');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const importTxtFile = document.getElementById('import-txt-file');

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

        // --- Build Title Div ---
        const titleDiv = document.createElement('div');
        titleDiv.className = 'accordion-title';

        const contentToggleBtn = document.createElement('button');
        contentToggleBtn.className = 'content-toggle-btn';
        contentToggleBtn.textContent = '>';
        if (isContentVisible) contentToggleBtn.classList.add('open');

        const titleText = document.createElement('span');
        titleText.className = 'title-text';
        titleText.textContent = node.title;

        const accordionToggleBtn = document.createElement('span');
        accordionToggleBtn.className = 'accordion-toggle-btn';
        accordionToggleBtn.textContent = isAccordionOpen ? '-' : '+';

        titleDiv.appendChild(contentToggleBtn);
        titleDiv.appendChild(titleText);
        titleDiv.appendChild(accordionToggleBtn);

        // --- Build Content Div ---
        const contentDiv = document.createElement('div');
        contentDiv.className = 'accordion-content';
        if (!isAccordionOpen) contentDiv.classList.add('hidden');

        const contentArea = document.createElement('div');
        contentArea.className = 'content-area';

        const contentParagraph = document.createElement('p');
        contentParagraph.textContent = node.content;
        if (!isContentVisible) contentParagraph.classList.add('hidden');

        contentArea.appendChild(contentParagraph); // No button here anymore

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
        editContentBtn.disabled = !isNodeSelected;
        deleteNodeBtn.disabled = !isNodeSelected;
    }

    function parseTxtToNodes(text) {
        // Handle potential Byte Order Mark (BOM) at the start of the file
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
        }

        // Normalize line endings and filter out empty or whitespace-only lines
        const lines = text.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const getIndentLevel = (line) => {
            // Use a regex to count leading spaces. This is more robust than checking characters.
            const match = line.match(/^( |\t)*/);
            // Let's assume a tab is 4 spaces for consistency, though the source file uses spaces.
            return match ? match[0].replace(/\t/g, '    ').length : 0;
        };

        const rootNodes = [];
        const parentStack = []; // A stack to keep track of parent nodes at each level

        lines.forEach(line => {
            const indentLevel = getIndentLevel(line);
            const title = line.trim();
            const newNode = {
                id: state.nextId++,
                title: title,
                children: [],
                content: `Inhoud voor ${title}.`,
                contentVisible: false
            };

            // Pop from the stack until we find the correct parent for the current indent level
            while (parentStack.length > 0 && indentLevel <= parentStack[parentStack.length - 1].indent) {
                parentStack.pop();
            }

            if (parentStack.length === 0) {
                // This is a root node
                rootNodes.push(newNode);
            } else {
                // This is a child node
                const parent = parentStack[parentStack.length - 1].node;
                parent.children.push(newNode);
            }

            // Push the current node onto the stack to act as a potential parent for subsequent nodes
            parentStack.push({ node: newNode, indent: indentLevel });
        });

        return rootNodes;
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
                content: `Inhoud van ${title}.`
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
            if (newContent !== null) {
                node.content = newContent;
                saveState();
                render();
            }
        }
    });

    exportBtn.addEventListener('click', () => {
        const stateString = JSON.stringify(state, null, 2); // Pretty print JSON
        const blob = new Blob([stateString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'accordion-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    importFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedState = JSON.parse(e.target.result);
                // Basic validation
                if (importedState && Array.isArray(importedState.nodes) && importedState.openNodes) {
                    // Convert openNodes back to a Set
                    importedState.openNodes = new Set(importedState.openNodes);
                    state = importedState;
                    saveState();
                    render();
                    alert('Data succesvol geïmporteerd!');
                } else {
                    throw new Error('Ongeldig bestandsformaat.');
                }
            } catch (error) {
                alert(`Fout bij het importeren van het bestand: ${error.message}`);
            }
        };
        reader.readAsText(file);

        // Reset file input so the same file can be loaded again
        event.target.value = '';
    });

    importTxtFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const textContent = e.target.result;
                const newNodes = parseTxtToNodes(textContent);
                if (newNodes.length > 0) {
                    state.nodes = newNodes;
                    state.openNodes.clear(); // Clear open nodes as the structure is new
                    state.selectedNodeId = null; // Deselect any node
                    saveState();
                    render();
                    alert('TXT-bestand succesvol geïmporteerd!');
                } else {
                    throw new Error('Kon geen nodes uit het bestand parsen.');
                }
            } catch (error) {
                alert(`Fout bij het importeren van het TXT-bestand: ${error.message}`);
            }
        };
        reader.readAsText(file);

        event.target.value = ''; // Reset file input
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
