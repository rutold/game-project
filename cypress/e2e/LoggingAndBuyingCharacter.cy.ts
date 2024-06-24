
describe('Phaser App E2E Tests', () => {
    before(() => {
        cy.viewport(2461, 1621);
        
        cy.visit('http://localhost:5173');
    });

    it('should log in and navigate to the Store scene, buy an upgrade', () => {
        cy.get('input[name="username"]').type('gosho', { force: true });
        cy.get('input[name="password"]').type('12345678', { force: true });
        cy.get('button[type="button"]').click();
        
        cy.intercept('POST', 'https://rutold.onrender.com/tokens').as('postLogin');
        cy.wait('@postLogin').then((interception) => {
            expect(interception.response.statusCode).to.equal(201);
            cy.window().then((win) => {
                expect(win.localStorage.getItem('token')).to.exist;
            });
        });
   
        cy.get('button.Characters', { timeout: 10000 }).should('exist').click();
        
        cy.intercept('GET', 'https://rutold.onrender.com/gameData/characters')
        cy.intercept('GET', 'https://rutold.onrender.com/User/characters/*/*')
            
        cy.wait(1000)

        cy.get('canvas').then(($canvas) => {
            
            cy.intercept('POST', 'https://rutold.onrender.com/User/*/characters/*').as('buyUpgrade');
            cy.get('canvas').click(600, 513);
            
            cy.wait(500); 

            cy.wait('@buyUpgrade').then((interception) => {
                expect(interception.response.statusCode).to.equal(201);
            });
        });
    });
});
