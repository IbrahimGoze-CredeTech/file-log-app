/// <reference types="cypress" />

describe("File List E2E", () => {
  beforeEach(() => {
    cy.visit("/download");
  });

  it("should load and display files", () => {
    // Sayfanın yüklendiğini kontrol et
    cy.get("h1").should("contain", "Dosya Listesi");

    // Arama kutusunun varlığını kontrol et
    cy.get('input[placeholder="Dosya ara..."]').should("exist");

    // Dosya listesinin yüklendiğini kontrol et
    cy.get(".grid").should("exist");
  });

  it("should search files", () => {
    // Arama yap
    cy.get('input[placeholder="Dosya ara..."]').type("test");

    // Arama sonuçlarının filtrelendiğini kontrol et
    cy.get(".grid").children().should("have.length.at.least", 1);
  });

  it("should navigate through pages", () => {
    // İlk sayfada olduğumuzu kontrol et
    cy.contains("Sayfa 1").should("exist");

    // Sonraki sayfaya git
    cy.contains("Sonraki").click();

    // Sayfa 2'de olduğumuzu kontrol et
    cy.contains("Sayfa 2").should("exist");
  });
});
