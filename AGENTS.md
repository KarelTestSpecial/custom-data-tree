## Instructies voor Agenten

Dit project is een eenvoudige webapplicatie voor het maken van een hiërarchisch accordeon.

### Projectstructuur

- `index.html`: De hoofdpagina van de applicatie.
- `style.css`: Bevat alle stijlen voor de applicatie.
- `script.js`: Bevat de logica voor het dynamisch aanmaken en beheren van de accordeon-nodes.

### Ontwikkelingsrichtlijnen

- **Event Delegation**: De applicatie maakt gebruik van event delegation in `script.js` om events af te handelen op dynamisch aangemaakte elementen. Houd dit patroon aan bij het toevoegen van nieuwe interactieve elementen.
- **Styling**: Houd de CSS eenvoudig en goed georganiseerd. Nieuwe stijlen moeten worden toegevoegd aan `style.css`.
- **HTML-structuur**: De HTML voor elke accordeon-node wordt dynamisch gegenereerd in `script.js`. Als je de structuur van een node wilt wijzigen, moet je de functie `createAccordionNode` in `script.js` aanpassen.
- **Geen externe bibliotheken**: Dit project gebruikt opzettelijk geen externe JavaScript-bibliotheken (zoals jQuery of React) om de basisprincipes van DOM-manipulatie te demonstreren. Probeer dit zo te houden, tenzij een nieuwe functie dit absoluut vereist.
