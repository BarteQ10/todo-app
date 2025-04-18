Cypress.Commands.add('loginFormShouldBeVisible', () => {
  cy.get('.p-card-title').should('contain', 'Login');
  cy.get('[data-testid="username"]').should('be.visible');
  cy.get('[data-testid="password"]').should('be.visible');
  cy.get('button[type="submit"]').should('be.visible');
});

Cypress.Commands.add('login', (username, password) => {
  cy.get('[data-testid="username"]').clear().type(username);
  cy.get('[data-testid="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('passwordFieldShouldHaveType', (type) => {
  cy.get('.p-password-input')
    .should('exist')
    .and('be.visible')
    .and('have.attr', 'type', type);
});