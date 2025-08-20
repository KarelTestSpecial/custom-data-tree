document.addEventListener('DOMContentLoaded', () => {
    const accordionContainer = document.getElementById('accordion-container');
    const addNodeBtn = document.getElementById('add-node-btn');

    let nodeIdCounter = 0;

    // Functie om een nieuwe accordeon node te maken
    function createAccordionNode(isRoot = true) {
        nodeIdCounter++;
        const nodeId = `node-${nodeIdCounter}`;

        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item');
        accordionItem.dataset.id = nodeId;

        const titleText = prompt("Voer de titel voor de nieuwe node in:", `Node ${nodeIdCounter}`);
        if (titleText === null) return null; // Gebruiker annuleerde

        accordionItem.innerHTML = `
            <div class="accordion-title">
                <span class="title-text">${titleText}</span>
                <span class="toggle-btn">+</span>
            </div>
            <div class="accordion-content">
                <div class="content-area">
                    <p>Inhoud van ${titleText}.</p>
                    <div class="actions">
                        <button class="add-child-btn">Voeg Kind Toe</button>
                        <button class="edit-title-btn">Bewerk Titel</button>
                        <button class="delete-node-btn">Verwijder Node</button>
                    </div>
                </div>
                <div class="nested-accordion"></div>
            </div>
        `;

        return accordionItem;
    }

    // Event listener voor de hoofd "Voeg Node Toe" knop
    addNodeBtn.addEventListener('click', () => {
        const newNode = createAccordionNode(true);
        if (newNode) {
            accordionContainer.appendChild(newNode);
        }
    });

    // Gebruik event delegation voor dynamisch toegevoegde elementen
    accordionContainer.addEventListener('click', (e) => {
        const target = e.target;

        // Toggle voor accordeon (titel of +/- knop)
        if (target.classList.contains('toggle-btn') || target.classList.contains('title-text')) {
            const titleElement = target.closest('.accordion-title');
            const content = titleElement.nextElementSibling;
            const toggleBtn = titleElement.querySelector('.toggle-btn');

            content.classList.toggle('active');

            if (content.classList.contains('active')) {
                toggleBtn.textContent = '-';
            } else {
                toggleBtn.textContent = '+';
            }
        }

        // Voeg een kind-node toe
        if (target.classList.contains('add-child-btn')) {
            const parentContent = target.closest('.accordion-content');
            const nestedContainer = parentContent.querySelector('.nested-accordion');
            const newNode = createAccordionNode(false);
            if (newNode) {
                nestedContainer.appendChild(newNode);
                 // Zorg ervoor dat de ouder open is om het nieuwe kind te zien
                if (!parentContent.classList.contains('active')) {
                    parentContent.classList.add('active');
                    parentContent.previousElementSibling.querySelector('.toggle-btn').textContent = '-';
                }
            }
        }

        // Bewerk de titel
        if (target.classList.contains('edit-title-btn')) {
            const titleElement = target.closest('.accordion-item').querySelector('.title-text');
            const newTitle = prompt("Voer de nieuwe titel in:", titleElement.textContent);
            if (newTitle !== null && newTitle.trim() !== '') {
                titleElement.textContent = newTitle;
            }
        }

        // Verwijder een node
        if (target.classList.contains('delete-node-btn')) {
            if (confirm('Weet je zeker dat je deze node en alle kinderen wilt verwijderen?')) {
                const nodeToRemove = target.closest('.accordion-item');
                nodeToRemove.remove();
            }
        }
    });
});
