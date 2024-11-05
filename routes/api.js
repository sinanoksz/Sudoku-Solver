'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;
      
      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }

      if (puzzle.length !== 81) {
        return res.json({ error: 'Expected puzzle to be 81 characters long' });
      }

      if (!/^[1-9.]+$/.test(puzzle)) {
        return res.json({ error: 'Invalid characters in puzzle' });
      }

      if (!/^[A-I][1-9]$/.test(coordinate)) {
        return res.json({ error: 'Invalid coordinate' });
      }

      if (!/^[1-9]$/.test(value)) {
        return res.json({ error: 'Invalid value' });
      }

      const row = coordinate.charCodeAt(0) - 65;
      const col = parseInt(coordinate[1]) - 1;
      const solver = new SudokuSolver();

      // If value is already placed
      if (puzzle[row * 9 + col] === value) {
        return res.json({ valid: true });
      }

      const conflictArray = [];
      
      if (!solver.checkRowPlacement(puzzle, row, col, value)) {
        conflictArray.push('row');
      }
      if (!solver.checkColPlacement(puzzle, row, col, value)) {
        conflictArray.push('column');
      }
      if (!solver.checkRegionPlacement(puzzle, row, col, value)) {
        conflictArray.push('region');
      }

      // Return both singular and plural properties
      if (conflictArray.length > 0) {
        return res.json({
          valid: false,
          conflict: conflictArray,
          conflicts: conflictArray
        });
      }

      return res.json({ valid: true });
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      try {
        const { puzzle } = req.body;

        if (!puzzle) {
          return res.json({ error: 'Required field missing' });
        }

        if (puzzle.length !== 81) {
          return res.json({ error: 'Expected puzzle to be 81 characters long' });
        }

        if (!/^[1-9.]+$/.test(puzzle)) {
          return res.json({ error: 'Invalid characters in puzzle' });
        }

        const solver = new SudokuSolver();
        const solution = solver.solve(puzzle);

        if (!solution) {
          return res.json({ error: 'Puzzle cannot be solved' });
        }

        return res.json({ solution });
      } catch (error) {
        return res.json({ error: 'Puzzle cannot be solved' });
      }
    });
};
