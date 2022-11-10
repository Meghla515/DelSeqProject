const taxonomyName = "E2E taxonomy test";
const url = "localhost:3000";
const firstParent = "First parent agent";
const secondParent = "Second parent agent";
const firstChild = "First child agent";
const driverRole = "driver";
const secondChild = "Second child agent";

describe("Verify taxonomy creation", () => {
  it("should create a new taxonomy", () => {
    cy.visit(url);
    cy.wait(2000);
    cy.openSidebar();
    cy.get("[data-testid='new-taxonomy'").click();
    cy.get("[data-testid='dialog-input'").type(taxonomyName);
    cy.get("[data-testid='dialog-submit'").click();
    cy.contains(taxonomyName);
    cy.wait(2000);
  });

  it("should create a new parent element", () => {
    cy.contains("add_box").click();
    cy.get("input[placeholder=Agent]").type(firstParent);
    cy.save(1);
  });

  it("should verify the parent element", () => {
    cy.get("table").find("tr").eq(1).find("td").eq(2).contains(firstParent);
    cy.get("table").find("tr").eq(1).find("td").eq(4).contains("None");
  });

  it("should create a child element", () => {
    cy.contains("add_box").click();
    cy.get("input[placeholder=Agent]").type(firstChild);
    cy.get("input[placeholder=Role]").type(driverRole);
    cy.get(".MuiFormControl-root > .MuiInputBase-root > .MuiSelect-root")
      .click()
      .get("li.MuiListItem-button:nth-child(1)")
      .click();
    cy.save(2);
    cy.wait(2000);
  });

  it("should verify the child element", () => {
    cy.get("table").find("tr").eq(1).find("td").eq(0).click();
    cy.get("table").find("tr").eq(2).find("td").eq(2).contains(firstChild);
    cy.get("table").find("tr").eq(2).find("td").eq(3).contains(driverRole);
    cy.get("table").find("tr").eq(2).find("td").eq(4).contains(firstParent);
  });

  it("should create a second parent element", () => {
    cy.contains("add_box").click();
    cy.get("input[placeholder=Agent]").type(secondParent);
    cy.save(3);
    cy.wait(2000);
  });

  it("should verify the second parent element", () => {
    cy.get("table").find("tr").eq(2).find("td").eq(2).contains(secondParent);
    cy.get("table").find("tr").eq(2).find("td").eq(4).contains("None");
    cy.wait(2000);
  });

  it("should change the first child element's role", () => {
    cy.get("table").find("tr").eq(1).find("td").eq(0).click();
    cy.edit(2);
    cy.get(".MuiFormControl-root > .MuiInputBase-root > .MuiSelect-root")
      .click()
      .get("li.MuiListItem-button:nth-child(2)")
      .click();
    cy.save(2);
    cy.wait(2000);
  });

  it("should create a second child element", () => {
    cy.contains("add_box").click();
    cy.get("input[placeholder=Agent]").type(secondChild);
    cy.get(".MuiFormControl-root > .MuiInputBase-root > .MuiSelect-root")
      .click()
      .get("li.MuiListItem-button:nth-child(1)")
      .click();
    cy.save(3);
    cy.wait(2000);
  });

  it("should verify the second child element", () => {
    cy.get("table").find("tr").eq(1).find("td").eq(0).click();
    cy.get("table").find("tr").eq(2).find("td").eq(0).click();
    cy.get("table").find("tr").eq(2).find("td").eq(2).contains(secondChild);
    cy.get("table").find("tr").eq(2).find("td").eq(4).contains(firstParent);
  });
});

describe("Verify procedure creation", () => {
  const procedureName = "E2E procedure test";
  const firstAction = {
    action: "First action",
    role: "driver",
    agent: secondParent,
    quantity: "1",
    abbreviation: "FA",
    precedence: "None",
  };

  const secondAction = {
    action: "Second action",
    role: "",
    agent: firstParent,
    quantity: "1",
    abbreviation: "SA",
    precedence: firstAction.abbreviation,
  };

  it("should create a new procedure", () => {
    cy.get("[data-testid='new-procedure'").click();
    cy.get("[data-testid='dialog-input'").type(procedureName);
    cy.get("[data-testid='dialog-submit'").click();
    cy.contains(procedureName);
    cy.wait(2000);
    cy.selectTaxonomy(taxonomyName);
  });

  it("should create a new action", () => {
    cy.contains("add_box").click({ force: true });
    cy.get("input[placeholder=Action]").type(firstAction.action);
    cy.get("table")
      .find("tr")
      .eq(1)
      .find("td")
      .eq(3)
      .click()
      .get("li.MuiListItem-button:nth-child(1)")
      .click();
    cy.get(".MuiPopover-root").click(); //defocus multiselect
    cy.get("table")
      .find("tr")
      .eq(1)
      .find("td")
      .eq(4)
      .click()
      .get("li.MuiListItem-button:nth-child(2)")
      .click();
    cy.get(".MuiPopover-root").click(); //defocus multiselect
    cy.get("input[placeholder=Quantity]").type(firstAction.quantity);
    cy.get("input[placeholder=Abbreviation]").type(firstAction.abbreviation);
    cy.get(".MuiFormControl-root > .MuiInputBase-root > .MuiSelect-root")
      .eq(1)
      .click()
      .get("li.MuiListItem-button:nth-child(1)")
      .click();
    cy.save(1);
  });

  it("should verify the created action", () => {
    cy.get("table")
      .find("tr")
      .eq(1)
      .find("td")
      .eq(2)
      .contains(firstAction.action);
    cy.get("table")
      .find("tr")
      .eq(1)
      .find("td")
      .eq(3)
      .contains(firstAction.role);
    cy.get("table")
      .find("tr")
      .eq(1)
      .find("td")
      .eq(4)
      .contains(firstAction.agent);
    cy.get("table")
      .find("tr")
      .eq(1)
      .find("td")
      .eq(5)
      .contains(firstAction.quantity);
    cy.get("table")
      .find("tr")
      .eq(1)
      .find("td")
      .eq(6)
      .contains(firstAction.abbreviation);
    cy.get("table")
      .find("tr")
      .eq(1)
      .find("td")
      .eq(7)
      .contains(firstAction.precedence);
  });

  it("should create a second action", () => {
    cy.wait(2000);
    cy.contains("add_box").click({ force: true });
    cy.get("input[placeholder=Action]").type(secondAction.action);
    cy.get("table")
      .find("tr")
      .eq(2)
      .find("td")
      .eq(4)
      .click()
      .get("li.MuiListItem-button:nth-child(1)")
      .click();
    cy.get(".MuiPopover-root").click(); //defocus multiselect
    cy.get("input[placeholder=Quantity]").type(secondAction.quantity);
    cy.get("input[placeholder=Abbreviation]").type(secondAction.abbreviation);
    cy.get(".MuiFormControl-root > .MuiInputBase-root > .MuiSelect-root")
      .eq(1)
      .click()
      .get("li.MuiListItem-button:nth-child(1)")
      .click();
    cy.save(2);
  });

  it("should verify the second action", () => {
    cy.get("table")
      .find("tr")
      .eq(2)
      .find("td")
      .eq(2)
      .contains(secondAction.action);
    cy.get("table")
      .find("tr")
      .eq(2)
      .find("td")
      .eq(4)
      .contains(secondAction.agent);
    cy.get("table")
      .find("tr")
      .eq(2)
      .find("td")
      .eq(5)
      .contains(secondAction.quantity);
    cy.get("table")
      .find("tr")
      .eq(2)
      .find("td")
      .eq(6)
      .contains(secondAction.abbreviation);
    cy.get("table")
      .find("tr")
      .eq(2)
      .find("td")
      .eq(7)
      .contains(secondAction.precedence);
  });

  it("should verify generated action card", () => {
    cy.generateActionCards();
    return cy.countQuantity(0).then((res) => cy.verifyGeneratedActions(res));
  });
});

describe("Clean up created resources", () => {
  it("should delete the procedure and all its data", () => {
    cy.get("[data-testid='delete-document'").click();
  });

  it("should delete the taxonomy and all its data", () => {
    cy.renderTaxonomy(1);
    cy.get("[data-testid='delete-document'").click();
  });
});
