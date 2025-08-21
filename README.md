# Hiërarchisch Accordeon Web App

Dit is een geavanceerde webapplicatie voor het bouwen, beheren en opslaan van dynamische, hiërarchische accordeonstructuren. Uw werk wordt automatisch opgeslagen in uw browser.

## Functies

-   **Node Beheer:**
    -   Voeg root-level en geneste (kind) nodes toe.
    -   Bewerk de titel van elke node.
    -   Bewerk de paragraaf-inhoud van elke node.
    -   Verwijder nodes (inclusief alle kinderen).
-   **Dubbele Zichtbaarheid-Toggle:**
    -   **Accordeon Toggle (+/-):** Klap een node open of dicht om de kind-nodes te tonen of te verbergen. Dit kan met de `+/-` knop of door op de titel te klikken.
    -   **Inhoud Toggle (>):** Toon of verberg de tekstparagraaf binnen een node, onafhankelijk van de accordeon-staat.
-   **Data Persistentie:**
    -   Alle wijzigingen worden automatisch opgeslagen in de `localStorage` van uw browser. Uw structuur blijft bewaard, zelfs na het herladen van de pagina.
-   **Import & Export:**
    -   **Export:** Download uw volledige accordeon-structuur als een `JSON`-bestand.
    -   **Import:** Laad een eerder opgeslagen `JSON`-bestand om een structuur te herstellen of te delen.

## Hoe te gebruiken

1.  Open `index.html` in een webbrowser.
2.  Gebruik de knoppen in de linker zijbalk om uw structuur te beheren:
    -   **Voeg Hoofd Node Toe:** Maakt een nieuwe node op het hoogste niveau.
    -   Selecteer een node door erop te klikken. De geselecteerde node krijgt een blauwe rand.
    -   Gebruik de andere knoppen ('Voeg Kind Toe', 'Bewerk Titel', etc.) om de geselecteerde node aan te passen.
    -   Gebruik de 'Export' en 'Import' knoppen om uw data te beheren.
