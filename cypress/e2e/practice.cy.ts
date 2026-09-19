describe('interview practice', () => {
  it('unlocks the room and starts a category session', () => {
    cy.intercept('GET', '/api/session', { authenticated: false, aiAvailable: true })
    cy.intercept('POST', '/api/session', { authenticated: true, aiAvailable: true })
    cy.visit('/')
    cy.get('#password').type('test-password')
    cy.contains('button', 'Enter').click()
    cy.contains('h1', 'Practice the answer.')
    cy.contains('button', 'Personal narrative & motivation').click()
    cy.contains('button', 'Record answer')
    cy.contains('1 / 4')
  })

  it('falls back to timed self-review when AI is not configured', () => {
    cy.intercept('GET', '/api/session', { authenticated: true, aiAvailable: false })
    cy.visit('/')
    cy.contains('button', 'Personal narrative & motivation').click()
    cy.contains('button', 'Start answer timer').click()
    cy.contains('button', 'Finish & reveal guide').click()
    cy.contains('h2', 'Compare your answer with the guide')
    cy.contains('No AI score')
  })
})
