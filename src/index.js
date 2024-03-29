import './styles.scss';
import './shapes.css';
import 'animate.css';

const game = require('./game');
game.init({
    numberRows: 7,
    numberCols: 7,
    repetitions: 30,
    maxParticlesPerCell: 2,
    delayTurn: 1000,
    maxTimeParticle: 7000,
    minTimeParticle: 3000,
    coefProbablySkulls: 2,
});
