Cypress.Commands.add("save", (row: number) => {
  return cy
    .get("table")
    .find("tr")
    .eq(row)
    .find("td")
    .eq(1)
    .contains("check")
    .click({ force: true });
});

Cypress.Commands.add("edit", (row: number) => {
  return cy
    .get("table")
    .find("tr")
    .eq(row)
    .find("td")
    .eq(1)
    .contains("edit")
    .click();
});

Cypress.Commands.add("nextPage", () => {
  return cy.contains("chevron_right").click({ force: true });
});

Cypress.Commands.add("previousPage", () => {
  return cy.contains("chevron_left").click();
});

Cypress.Commands.add("lastPage", () => {
  return cy.contains("last_page").click();
});

Cypress.Commands.add("firstPage", () => {
  return cy.contains("first_page").click();
});

Cypress.Commands.add("deselectMultiselect", (row: number, cell: number) => {
  return cy
    .get("table")
    .find("tr")
    .eq(row)
    .find("td")
    .eq(cell)
    .click()
    .get("li.MuiListItem-button")
    .click({ force: true });
});

Cypress.Commands.add("selectMultiselect", (row: number, cell: number) => {
  return cy
    .get("table")
    .find("tr")
    .eq(row)
    .find("td")
    .eq(cell)
    .click()
    .get("li.MuiListItem-button")
    .click();
});

Cypress.Commands.add("getCellValues", (cell: number) => {
  return cy.get(".MuiTableBody-root").each((row) => row.find("td").eq(cell));
});

Cypress.Commands.add("countQuantity", (total: number) => {
  return cy
    .get("td:nth-child(6)")
    .then(toStrings)
    .then(toNumbers)
    .then(sum)
    .then((sum) => {
      cy.contains("chevron_right").then((btn: any) => {
        if (btn!.is(":disabled")) {
          return sum + total;
        } else {
          cy.nextPage();
          cy.countQuantity(sum + total);
        }
      });
    });
});

Cypress.Commands.add("generateActionCards", () => {
  cy.get("[data-testid=generate-action-cards-button]").click();
  return cy.wait(6000);
});

Cypress.Commands.add("verifyGeneratedActions", (expectedActions: number) => {
  return cy
    .get("[data-testid=action-card]")
    .should("have.length", expectedActions);
});

Cypress.Commands.add("getActionCard", (index: number) => {
  return cy.get("[data-testid=action-card]").eq(index);
});

Cypress.Commands.add("openSidebar", () => {
  return cy.get("[aria-label='open drawer']").click();
});

Cypress.Commands.add("renderProcedure", (index: number) => {
  return cy
    .get("[data-testid='procedure-dropdown']")
    .click()
    .get("[data-testid='procedure']")
    .eq(index)
    .click();
});

Cypress.Commands.add("selectTaxonomy", (taxonomy: string) => {
  return cy
    .get("[data-testid=taxonomy-selector]")
    .click()
    .get(`[data-value='${taxonomy}']`)
    .click();
});

Cypress.Commands.add("renderTaxonomy", (index: number) => {
  return cy
    .get("[data-testid='taxonomy-dropdown']")
    .click()
    .get("[data-testid='taxonomy']")
    .eq(index)
    .click();
});

Cypress.Commands.add("reviseAction", (index: number) => {
  return cy
    .get("[data-testid='revise-button']")
    .eq(index)
    .click({ force: true });
});

Cypress.Commands.add("verifyRevisionOptions", (length: number) => {
  return cy
    .get("[data-testid='revision-options']")
    .should("have.length", length);
});

Cypress.Commands.add("relieveAgent", () => {
  return cy.get("[data-testid='relieve-button']").click();
});

Cypress.Commands.add("scheduleAgent", (index: number) => {
  return cy.get("[data-testid='schedule-button']").eq(index).click();
});

Cypress.Commands.add(
  "verifyActionCardAgent",
  (index: number, agent: string) => {
    return cy
      .get("[data-testid=action-card]")
      .eq(index)
      .find("td:nth-child(1)")
      .contains(agent);
  }
);

Cypress.Commands.add("submitRevision", () => {
  cy.get("[data-testid='revision-submit-button']").click({ force: true });
  return cy.wait(5000);
});

const toStrings = (cells$: any) => Cypress._.map(cells$, "textContent");
const toNumbers = (texts: any) => Cypress._.map(texts, Number);
const sum = (numbers: any) => Cypress._.sum(numbers);
