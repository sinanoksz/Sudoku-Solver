const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  const validPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';

  test('Solve a puzzle with valid puzzle string: POST request to /api/solve', (done) => {
    chai
      .request(server)
      .post('/api/solve')
      .send({ puzzle: validPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'solution');
        assert.isString(res.body.solution);
        assert.equal(res.body.solution.length, 81);
        done();
      });
  });

  test('Solve a puzzle with missing puzzle string: POST request to /api/solve', (done) => {
    chai
      .request(server)
      .post('/api/solve')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Required field missing');
        done();
      });
  });

  test('Solve a puzzle with invalid characters: POST request to /api/solve', (done) => {
    chai
      .request(server)
      .post('/api/solve')
      .send({ puzzle: validPuzzle.replace('.', 'X') })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Invalid characters in puzzle');
        done();
      });
  });

  test('Solve a puzzle with incorrect length: POST request to /api/solve', (done) => {
    chai
      .request(server)
      .post('/api/solve')
      .send({ puzzle: validPuzzle.slice(0, -1) })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  test('Solve a puzzle that cannot be solved: POST request to /api/solve', (done) => {
    const unsolvablePuzzle = '115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    chai
      .request(server)
      .post('/api/solve')
      .send({ puzzle: unsolvablePuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Puzzle cannot be solved');
        done();
      });
  });

  test('Check a puzzle placement with all fields: POST request to /api/check', (done) => {
    chai
      .request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A2', value: '3' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        assert.isTrue(res.body.valid);
        done();
      });
  });

  test('Check a puzzle placement with single placement conflict: POST request to /api/check', function(done) {
    chai
      .request(server)
      .post('/api/check')
      .send({
        puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
        coordinate: 'A2',
        value: '9'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        assert.isFalse(res.body.valid);
        assert.property(res.body, 'conflicts');
        assert.isArray(res.body.conflicts);
        assert.lengthOf(res.body.conflicts, 1);
        done();
      });
  });

  test('Check a puzzle placement with multiple placement conflicts: POST request to /api/check', (done) => {
    chai
      .request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A2', value: '2' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        assert.isFalse(res.body.valid);
        assert.property(res.body, 'conflicts');
        assert.isArray(res.body.conflicts);
        assert.isTrue(res.body.conflicts.length > 1);
        done();
      });
  });

  test('Check a puzzle placement with all placement conflicts: POST request to /api/check', (done) => {
    chai
      .request(server)
      .post('/api/check')
      .send({
        puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
        coordinate: 'E1',
        value: '2'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        assert.isFalse(res.body.valid);
        assert.property(res.body, 'conflicts');
        assert.isArray(res.body.conflicts);
        assert.lengthOf(res.body.conflicts, 3);
        assert.include(res.body.conflicts, 'row');
        assert.include(res.body.conflicts, 'column');
        assert.include(res.body.conflicts, 'region');
        done();
      });
  });

  test('Check a puzzle placement with missing required fields: POST request to /api/check', (done) => {
    chai
      .request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, value: '3' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Required field(s) missing');
        done();
      });
  });

  test('Check a puzzle placement with invalid characters: POST request to /api/check', (done) => {
    chai
      .request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle.replace('.', 'X'), coordinate: 'A2', value: '3' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Invalid characters in puzzle');
        done();
      });
  });

  test('Check a puzzle placement with incorrect length: POST request to /api/check', (done) => {
    chai
      .request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle.slice(0, -1), coordinate: 'A2', value: '3' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  test('Check a puzzle placement with invalid placement coordinate: POST request to /api/check', (done) => {
    chai
      .request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'J2', value: '3' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Invalid coordinate');
        done();
      });
  });

  test('Check a puzzle placement with invalid placement value: POST request to /api/check', (done) => {
    chai
      .request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A2', value: '0' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Invalid value');
        done();
      });
  });
});

