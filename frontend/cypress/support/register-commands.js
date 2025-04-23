Cypress.Commands.add('registerFormShouldBeVisible', () => {
    cy.get('.p-card-title').should('contain', 'Register');
    cy.get('#username').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('#confirmPassword').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Register');
});

Cypress.Commands.add('toastShouldContain', (severity, detail) => {
    cy.get(`.p-toast-message-${severity}`).should('be.visible');
    cy.get('.p-toast-detail').should('contain', detail);
});

Cypress.Commands.add('passwordFieldShouldHaveType', (fieldId, type) => {
    cy.get(`#${fieldId} input`).should('have.attr', 'type', type);
});