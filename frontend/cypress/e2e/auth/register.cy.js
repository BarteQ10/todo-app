import RegisterPage from '../../page-objects/RegisterPage';

describe('Register Page', () => {
    beforeEach(() => {
        RegisterPage.visit();
    });

    it('should display register form with all elements', () => {
        cy.registerFormShouldBeVisible();
        RegisterPage.elements.loginLink().should('be.visible').and('contain', 'Login');
    });

    it('should allow user to input registration data', () => {
        cy.fixture('register-users').then((users) => {
            const { username, password, confirmPassword } = users.newUser;

            RegisterPage.typeUsername(username);
            RegisterPage.elements.usernameInput().should('have.value', username);

            RegisterPage.typePassword(password);
            RegisterPage.elements.passwordInput().parent().find('input').should('have.value', password);

            RegisterPage.typeConfirmPassword(confirmPassword);
            RegisterPage.elements.confirmPasswordInput().parent().find('input').should('have.value', confirmPassword);
        });
    });

    it('should toggle password visibility when clicking the eye icon', () => {
        cy.fixture('register-users').then((users) => {
            const { password } = users.newUser;

            RegisterPage.typePassword(password);

            cy.passwordFieldShouldHaveType('password', 'password');

            RegisterPage.togglePasswordVisibility();
            cy.passwordFieldShouldHaveType('password', 'text');

            RegisterPage.togglePasswordVisibility();
            cy.passwordFieldShouldHaveType('password', 'password');
        });
    });

    it('should toggle confirm password visibility when clicking the eye icon', () => {
        cy.fixture('register-users').then((users) => {
            const { confirmPassword } = users.newUser;

            RegisterPage.typeConfirmPassword(confirmPassword);

            cy.passwordFieldShouldHaveType('confirmPassword', 'password');

            RegisterPage.toggleConfirmPasswordVisibility();
            cy.passwordFieldShouldHaveType('confirmPassword', 'text');
        });
    });

    it('should show error when passwords do not match', () => {
        cy.fixture('register-users').then((users) => {
            const { username, password, confirmPassword } = users.mismatchedPasswords;

            RegisterPage.submitRegistrationForm(username, password, confirmPassword);

            cy.toastShouldContain('error', 'Passwords do not match');

            cy.url().should('include', '/register');
        });
    });

    it('should register successfully with valid data', () => {
        cy.fixture('register-users').then((users) => {
            const { username, password } = users.newUser;

            // Use a valid JWT token format to avoid decode errors
            const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

            cy.intercept('POST', '/api/register', {
                statusCode: 200,
                body: {
                    success: true,
                    token: validToken,
                    userId: '123'
                }
            }).as('registerRequest');

            RegisterPage.submitRegistrationForm(username, password, password);

            RegisterPage.elements.loadingIcon().should('be.visible');

            cy.wait('@registerRequest').then(interception => {
                expect(interception.request.body).to.deep.include({
                    username,
                    password
                });
            });

            // Check toast with extended timeout
            cy.toastShouldContain('success', 'Registered successfully');
            cy.wait(500);
            cy.url().should('include', '/todos');
        });
    });

    it('should show error when registration fails', () => {
        cy.fixture('register-users').then((users) => {
            const { username, password } = users.existingUser;

            cy.intercept('POST', '/api/register', {
                statusCode: 400,
                body: {
                    error: 'Username already exists' // Match the error key your backend uses
                }
            }).as('registerFailRequest');

            RegisterPage.submitRegistrationForm(username, password);

            cy.wait('@registerFailRequest');

            cy.toastShouldContain('error', 'Username already exists');

            cy.url().should('include', '/register');
        });
    });

    it('should handle unexpected errors during registration', () => {
        cy.fixture('register-users').then((users) => {
            const { username, password } = users.newUser;

            cy.intercept('POST', '/api/register', {
                statusCode: 500,
                body: {
                    error: 'An unexpected error occurred'
                }
            }).as('serverErrorRequest');

            RegisterPage.submitRegistrationForm(username, password);

            cy.wait('@serverErrorRequest');

            cy.toastShouldContain('error', 'An unexpected error occurred');
        });
    });

    it('should navigate to login page when clicking login link', () => {
        RegisterPage.clickLoginLink();

        cy.url().should('include', '/login');

        cy.get('.p-card-title[data-pc-section="title"]')
            .should('be.visible')
            .and('contain', 'Login');
    });

    it('should validate empty form submission', () => {
        RegisterPage.clickRegister();

        RegisterPage.elements.usernameInput().should('have.attr', 'required');
        RegisterPage.elements.passwordInput().parent().find('input').should('have.attr', 'required');
        RegisterPage.elements.confirmPasswordInput().parent().find('input').should('have.attr', 'required');

        cy.url().should('include', '/register');
    });
});