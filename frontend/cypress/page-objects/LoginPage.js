class LoginPage {
    elements = {
      usernameInput: () => cy.get('[data-testid="username"]'),
      passwordInput: () => cy.get('[data-testid="password"]'),
      loginButton: () => cy.get('button[type="submit"]'),
      registerLink: () => cy.get('a[href="/register"]'),
      passwordToggle: () => cy.get('.p-icon[role="switch"][aria-label="Show Password"], .p-icon[role="switch"][aria-label="Hide Password"]'),
      formTitle: () => cy.get('.p-card-title'),
    };
  
    visit() {
      cy.visit('/');
      return this;
    }
  
    typeUsername(username) {
      this.elements.usernameInput().clear().type(username);
      return this;
    }
  
    typePassword(password) {
      this.elements.passwordInput().clear().type(password);
      return this;
    }
  
    clickLogin() {
      this.elements.loginButton().click();
      return this;
    }
  
    clickRegisterLink() {
      this.elements.registerLink().click();
    }
  
    togglePasswordVisibility() {
      this.elements.passwordToggle().click();
      return this;
    }
  
    submitLoginForm(username, password) {
      this.typeUsername(username);
      this.typePassword(password);
      this.clickLogin();
      return this;
    }
  }
  
  export default new LoginPage();