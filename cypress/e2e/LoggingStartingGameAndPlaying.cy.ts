
describe('Phaser App E2E Tests', () => {
    before(() => {
        cy.viewport(2461, 1621);
        
        cy.visit('http://localhost:5173');
    });

    it('should log in and navigate to the Store scene, buy an upgrade', () => {
        cy.get('input[name="username"]').type('gosho', { force: true });
        cy.get('input[name="password"]').type('12345678', { force: true });
        cy.get('button[type="button"]').click();
        
        cy.intercept('POST', 'https://rutold.onrender.com//tokens').as('postLogin');
        cy.wait('@postLogin').then((interception) => {
            expect(interception.response.statusCode).to.equal(201);
            cy.window().then((win) => {
                expect(win.localStorage.getItem('token')).to.exist;
            });
        });
   
        cy.get('button.new-game', { timeout: 10000 }).should('exist').click();
        
            
        cy.wait(1000)
        cy.get('input[name="seed"]').type('testMatch', { force: true });
        cy.get('input[id="normal"]').click();
        cy.get('button[class="checkIfCanCreate"]').click();
        cy.get('input[name="madeseed"]').type('string', { force: true });
        cy.get('button[class="checkExisting"]').click();
        cy.get('canvas').then(($canvas) => {
            
            cy.intercept('POST', 'https://rutold.onrender.com//User/*/upgrades/*').as('buyUpgrade');
            cy.get('canvas').click(650, 1340);
            
            cy.wait(2000);
            cy.get('div[id="general-channel"]').click();
            cy.get('input[id="chatInput"]').type('test', { force: true });
          
            
        });
    });
});
