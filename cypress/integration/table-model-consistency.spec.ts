describe("Verify EA fire scenario and taxonomy", () => {
  const url = "localhost:3000";

  it("should fail to fetch action cards", () => {
    cy.visit(url);
    cy.wait(2000);
    cy.generateActionCards();
    cy.contains('"Result": "UNSATISFIABLE"');
  });

  it("should successfully fetch action cards", () => {
    cy.nextPage();
    cy.edit(1);
    cy.deselectMultiselect(1, 3);
    cy.save(1);
    cy.generateActionCards();
    cy.previousPage();
    cy.contains("Revise response");
  });

  it("should verify number of expected actions with number of generated actions", () => {
    cy.generateActionCards();
    return cy.countQuantity(0).then((res) => cy.verifyGeneratedActions(res));
  });

  it("should change action quantity", () => {
    cy.firstPage();
    cy.edit(1);
    cy.get("input[placeholder=Quantity]").clear().type("2");
    cy.wait(10);
    cy.save(1);
  });

  it("should verify quantity change", () => {
    cy.generateActionCards();
    return cy.countQuantity(0).then((res) => cy.verifyGeneratedActions(res));
  });

  it("should verify role restrictions", () => {
    cy.getActionCard(4).get("td:nth-child(1)").contains("john");
    cy.firstPage();
    cy.edit(4);
    cy.selectMultiselect(4, 3);
    cy.save(4);
    cy.generateActionCards();
    cy.getActionCard(4).get("td:nth-child(1)").contains("barry");
  });

  it("should reset EA fire scenario", () => {
    cy.edit(1);
    cy.get("input[placeholder=Quantity]").clear().type("1");
    cy.save(1);
    cy.wait(2000);
    cy.edit(4);
    cy.deselectMultiselect(4, 3);
    cy.save(4);
    cy.wait(2000);
    cy.nextPage();
    cy.edit(1);
    cy.deselectMultiselect(1, 3);
    cy.save(1);
  });
});

describe("Verify Hamar scenario and taxonomy", () => {
  it("should select Hamar scenario and taxonomy", () => {
    cy.openSidebar();
    cy.renderProcedure(2); //index of the procedure
    cy.wait(1000);
    cy.selectTaxonomy("Hamar");
  });

  it("should verify generated actions match expected actions", () => {
    cy.firstPage();
    cy.generateActionCards();
    return cy.countQuantity(0).then((res) => cy.verifyGeneratedActions(res));
  });

  it("should verify selected agents", () => {
    //Actions at 1
    cy.verifyActionCardAgent(0, "Lukas");
    //Actions at 2
    cy.verifyActionCardAgent(1, "Ingolf");
    cy.verifyActionCardAgent(2, "Peter");
    //Actions at 3
    cy.verifyActionCardAgent(3, "Sven");
    cy.verifyActionCardAgent(4, "Miriam");
    cy.verifyActionCardAgent(5, "Ingolf");
    cy.verifyActionCardAgent(6, "Kari");
    cy.verifyActionCardAgent(7, "Rikard");
    cy.verifyActionCardAgent(8, "Herman");
    cy.verifyActionCardAgent(9, "Mikael");
    cy.verifyActionCardAgent(10, "Morten");
    cy.verifyActionCardAgent(11, "Halvard");
    //Actions at 4
    cy.verifyActionCardAgent(12, "Ingolf");
    cy.verifyActionCardAgent(13, "Theodor");
  });

  it("should verify available agents", () => {
    cy.reviseAction(0);
    cy.verifyRevisionOptions(1);
    cy.reviseAction(2);
    cy.verifyRevisionOptions(2);
    cy.reviseAction(9);
    cy.verifyRevisionOptions(10);
    cy.reviseAction(10);
    cy.verifyRevisionOptions(12);
    cy.reviseAction(11);
    cy.verifyRevisionOptions(10);
  });

  it("should verify revised agents", () => {
    cy.relieveAgent();
    cy.reviseAction(13); //Weird that it skips 12.. Whatever, it's atleast the last element
    cy.scheduleAgent(1);
    cy.submitRevision();
    cy.verifyActionCardAgent(9, "Lukas");
    cy.verifyActionCardAgent(10, "Sven");
    cy.firstPage();
    return cy.countQuantity(0).then((res) => cy.verifyGeneratedActions(res));
  });
});
