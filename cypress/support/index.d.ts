declare namespace Cypress {
  interface Chainable {
    save(row: number): Chainable;
    edit(row: number): Chainable;
    nextPage(): Chainable;
    previousPage(): Chainable;
    lastPage(): Chainable;
    firstPage(): Chainable;
    deselectMultiselect(row: number, cell: number): Chainable;
    selectMultiselect(row: number, cell: number): Chainable;
    getCellValues(cell: number): Chainable;
    countQuantity(total: number): Chainable;
    generateActionCards(): Chainable;
    verifyGeneratedActions(expectedActions): Chainable;
    getActionCard(index: number): Chainable;
    openSidebar(): Chainable;
    selectTaxonomy(taxonomy: string): Chainable;
    renderProcedure(index: number): Chainable;
    renderTaxonomy(index: number): Chainable;
    reviseAction(index: number): Chainable;
    verifyRevisionOptions(length: number): Chainable;
    relieveAgent(): Chainable;
    scheduleAgent(index: number): Chainable;
    verifyActionCardAgent(index: number, agent: string): Chainable;
    submitRevision(): Chainable;
  }
}
