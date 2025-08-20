document.addEventListener('DOMContentLoaded', () => {
    const accordionContainer = document.getElementById('accordion-container');
    const addRootNodeBtn = document.getElementById('add-root-node-btn');
    const addChildBtn = document.getElementById('add-child-btn');
    const editTitleBtn = document.getElementById('edit-title-btn');
    const deleteNodeBtn = document.getElementById('delete-node-btn');

    let nodeIdCounter = 0;
    let selectedNode = null;

    // --- Helper Functions ---

    function updateActionButtons() {
        const isNodeSelected = selectedNode !== null;
        addChildBtn.disabled = !isNodeSelected;
        editTitleBtn.disabled = !isNodeSelected;
        deleteNodeBtn.disabled = !isNodeSelected;
    }

    function updateParentMaxHeight(element) {
        const parentContent = element.closest('.accordion-content');
        if (parentContent && parentContent.style.maxHeight && parentContent.style.maxHeight !== '0px') {
            parentContent.style.maxHeight = parentContent.scrollHeight + 'px';
            // Recurse up the DOM tree
            updateParentMaxHeight(parentContent.parentElement);
        }
    }

    function setSelectedNode(nodeElement) {
        if (selectedNode) {
            selectedNode.classList.remove('selected');
        }
        selectedNode = nodeElement;
        if (selectedNode) {
            selectedNode.classList.add('selected');
        }
        updateActionButtons();
    }

    function createAccordionNode(title) {
        nodeIdCounter++;
        const nodeId = `node-${nodeIdCounter}`;
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item');
        accordionItem.dataset.id = nodeId;
        accordionItem.innerHTML = `
            <div class="accordion-title">
                <span class="title-text">${title}</span>
                <span class="toggle-btn">+</span>
            </div>
            <div class="accordion-content">
                <div class="content-area">
                    <p>Inhoud van ${title}.</p>
                </div>
                <div class="nested-accordion"></div>
            </div>
        `;
        return accordionItem;
    }

    // --- Global Action Button Listeners ---

    addRootNodeBtn.addEventListener('click', () => {
        const titleText = prompt("Voer de titel voor de nieuwe hoofd node in:", `Node ${nodeIdCounter + 1}`);
        if (titleText) {
            const newNode = createAccordionNode(titleText);
            accordionContainer.appendChild(newNode);
        }
    });

    addChildBtn.addEventListener('click', () => {
        if (!selectedNode) return;
        const titleText = prompt("Voer de titel voor de nieuwe kind node in:", `Kind van ${selectedNode.dataset.id}`);
        if (titleText) {
            const newNode = createAccordionNode(titleText);
            const nestedContainer = selectedNode.querySelector('.nested-accordion');
            nestedContainer.appendChild(newNode);

            const content = selectedNode.querySelector('.accordion-content');
            if (!content.style.maxHeight || content.style.maxHeight === '0px') {
                 content.parentElement.querySelector('.accordion-title').click();
            } else {
                updateParentMaxHeight(nestedContainer);
            }
        }
    });

    editTitleBtn.addEventListener('click', () => {
        if (!selectedNode) return;
        const titleElement = selectedNode.querySelector('.title-text');
        const newTitle = prompt("Voer de nieuwe titel in:", titleElement.textContent);
        if (newTitle && newTitle.trim() !== '') {
            titleElement.textContent = newTitle;
            selectedNode.querySelector('.content-area p').textContent = `Inhoud van ${newTitle}.`;
        }
    });

    deleteNodeBtn.addEventListener('click', () => {
        if (!selectedNode) return;
        if (confirm('Weet je zeker dat je deze node en alle kinderen wilt verwijderen?')) {
            const parent = selectedNode.parentElement;
            selectedNode.remove();
            setSelectedNode(null);
            updateParentMaxHeight(parent);
        }
    });

    // --- Accordion Interaction (Event Delegation) ---

    accordionContainer.addEventListener('click', (e) => {
        const titleElement = e.target.closest('.accordion-title');
        if (titleElement) {
            const accordionItem = titleElement.parentElement;
            setSelectedNode(accordionItem);

            const content = titleElement.nextElementSibling;
            const toggleBtn = titleElement.querySelector('.toggle-btn');

            if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                content.style.maxHeight = '0px';
                toggleBtn.textContent = '+';
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                toggleBtn.textContent = '-';
            }
            // After toggling, always update parents
            updateParentMaxHeight(accordionItem);
        }
    });
});
