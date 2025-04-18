import LoginPage from '../../page-objects/loginPage';

describe('Login Page', () => {
  beforeEach(() => {
    LoginPage.visit();
  });

  it('should display login form with all elements', () => {
    cy.loginFormShouldBeVisible();
    LoginPage.elements.registerLink().should('be.visible').and('contain', 'Register');
  });

  it('should allow user to input credentials', () => {
    cy.fixture('users').then((users) => {
      const { username, password } = users.validUser;
      
      LoginPage.typeUsername(username);
      LoginPage.elements.usernameInput().should('have.value', username);
      
      LoginPage.typePassword(password);
      LoginPage.elements.passwordInput().should('have.value', password);
    });
  });

  it('should toggle password visibility multiple times', () => {
    cy.fixture('users').then((users) => {
      const { password } = users.validUser;
      
      LoginPage.typePassword(password);
      
      cy.passwordFieldShouldHaveType('password');
      
      LoginPage.togglePasswordVisibility();
      cy.passwordFieldShouldHaveType('text');
      
      LoginPage.togglePasswordVisibility();
      cy.passwordFieldShouldHaveType('password');
      
      LoginPage.togglePasswordVisibility();
      cy.passwordFieldShouldHaveType('text');
    });
  });

  it('should submit the form with valid credentials', () => {
    cy.fixture('users').then((users) => {
      cy.intercept('POST', '/api/login', {
        statusCode: 200,
        body: { success: true, token: 'fake-jwt-token' }
      }).as('loginRequest');
      
      LoginPage.submitLoginForm(users.validUser.username, users.validUser.password);
      
      cy.wait('@loginRequest').its('request.body').should('include', {
        username: users.validUser.username,
        password: users.validUser.password
      });
    });
  });

  it('should navigate to register page when clicking register link', () => {
    cy.intercept('GET', '/register', {
      statusCode: 200,
      body: '<html><body>Register Page</body></html>'
    }).as('registerPage');
    
    LoginPage.clickRegisterLink();
    
    cy.url().should('include', '/register');
  });

  it('should validate empty form submission', () => {
    LoginPage.clickLogin();
    
    LoginPage.elements.usernameInput().should('have.attr', 'required');
    LoginPage.elements.passwordInput().should('have.attr', 'required');
    cy.get(':invalid').should('exist');
  });
});