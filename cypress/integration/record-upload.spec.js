// const REPLAY_FILE = 'ESC_BUTTON_Spring_2022_-_16_PersonalBest_TimeAttack.Replay.Gbx';
const REPLAY_FILE = 'example.json';

describe('example to-do app', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8081/')
    })
  
    it('upload a record file', () => {
        cy.get('input[type="file"]').attachFile(REPLAY_FILE);
        cy.get('button').contains('Upload').click()
    })
  })
  