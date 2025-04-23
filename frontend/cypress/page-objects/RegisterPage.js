class RegisterPage {
    elements = {
        usernameInput: () => cy.get('[data-testid="username"]'),
        passwordInput: () => cy.get('[data-testid="password"]'),
        confirmPasswordInput: () => cy.get('[data-testid="confirmPassword"]'),
        registerButton: () => cy.get('button[type="submit"]'),
        loginLink: () => cy.get('a[href="/login"]'),
        passwordToggle: () => cy.get('#password').parent().find('.p-icon[role="switch"]'),
        confirmPasswordToggle: () => cy.get('#confirmPassword').parent().find('.p-icon[role="switch"]'),
        formTitle: () => cy.get('.p-card-title'),
        toastMessage: () => cy.get('.p-toast-message'),
        toastDetail: () => cy.get('.p-toast-detail'),
        loadingIcon: () => cy.get('.p-button-loading-icon'),
    };

    visit() {
        cy.visit('/register');
        return this;
    }

    typeUsername(username) {
        this.elements.usernameInput().clear().type(username);
        return this;
    }

    typePassword(password) {
        this.elements.passwordInput().clear({ force: true }).type(password, { force: true });
        return this;
    }

    typeConfirmPassword(password) {
        this.elements.confirmPasswordInput().clear({ force: true }).type(password, { force: true });
        return this;
    }

    clickRegister() {
        this.elements.registerButton().click();
        return this;
    }

    clickLoginLink() {
        this.elements.loginLink().click();
        return this;
    }

    togglePasswordVisibility() {
        this.elements.passwordToggle().click();
        return this;
    }

    toggleConfirmPasswordVisibility() {
        this.elements.confirmPasswordToggle().click();
        return this;
    }
    closePasswordPanel() {
        cy.get('body').click(0, 0);
        return this;
    }

    fillRegistrationForm(username, password, confirmPassword) {
        this.typeUsername(username);
        this.typePassword(password);
        this.closePasswordPanel();
        this.typeConfirmPassword(confirmPassword || password);
        this.closePasswordPanel();
        return this;
    }

    submitRegistrationForm(username, password, confirmPassword) {
        this.fillRegistrationForm(username, password, confirmPassword);
        this.clickRegister();
        return this;
    }
}

export default new RegisterPage();