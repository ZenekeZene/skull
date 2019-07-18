const utils = require("./utils");
const colors = require("./colors");

const game = (function() {
  "use strict";
  let config,
    configDefault = {
      numberRows: 10,
      numberCols: 10,
      repetitions: 30,
      maxParticlesPerCell: 1,
      delayTurn: 1000,
      maxTimeParticle: 7000,
      minTimeParticle: 3000,
      coefProbablySkulls: 4
    };

  let intervalID = 0,
    items = null,
    countSkull = 0,
    countFail = 0,
    seconds = 0,
    isLaunched = true,
    isPaused = isLaunched;

  // DOM Nodes:
  const gridTableNode = document.getElementById("js-grid-table"),
    countSkullNode = document.getElementById("js-skull-count"),
    countFailNode = document.getElementById("js-fail-count"),
    playButtonNode = document.getElementById("js-play-button"),
    secondsNode = document.getElementById("js-seconds"),
    backgroundNode = document.getElementById("js-background");

  const eventTap = "touchstart" in window ? "touchend" : "click";

  const shapes = ["circle", "square", "triangleUp", "trapezoid"];

  const areActiveStatus = (status1, status2) => {
    return status1 === 1 && status2 === 1;
  };

  const getGrid = () => {
    let grid = [];
    for (let i = 0; i < config.numberRows; i++) {
      let row = [];
      for (let j = 0; j < config.numberCols; j++) {
        row.push(new Cell(utils.getRandomInterval(0, 1)));
      }
      grid.push(row);
    }
    return grid;
  };

  const drawTable = size => {
    let boxes = [];
    for (let i = 0; i < size; i++) {
      const cellNode = document.createElement("div");
      boxes.push(cellNode);
      cellNode.classList.add("cell");
      gridTableNode.append(cellNode);
    }
    return boxes;
  };

  const changeCSSGrid = () => {
    document.documentElement.style.setProperty("--rowNum", config.numberRows);
    document.documentElement.style.setProperty("--colNum", config.numberCols);
  };

  const Cell = function(status) {
    this.status = status;
  };

  const configureShape = (shape, isSkull) => {
    let color = colors.getRandomColor();
    let configCSS = {
      classnames: ["shape", "fade"],
      properties: {}
    };

    if (isSkull) {
      configCSS.classnames.push("fas", "fa-skull", "skull");
      configCSS.properties.color = color;
    } else {
      const shapeTypeClass = shapes[utils.getRandomInterval(0, shapes.length)];
      configCSS.classnames.push(shapeTypeClass);
      if (shapeTypeClass === "triangleUp" || shapeTypeClass === "trapezoid") {
        configCSS.properties.borderBottomColor = color;
      } else {
        configCSS.properties.backgroundColor = color;
      }
    }

    configCSS.properties.animationDuration = `${utils.getRandomInterval(
      config.minTimeParticle,
      config.maxTimeParticle
    )}ms`;

    Object.assign(shape.style, configCSS.properties);
    shape.classList.add(...configCSS.classnames);
  };

  const isSkullShape = () => {
    return utils.getRandomInterval(0, 100) <= config.coefProbablySkulls;
  };

  const generateShapes = (cell, numShapesPerCell) => {
    if (numShapesPerCell > 0) {
      const shape = document.createElement("i");
      const isSkull = isSkullShape();
      configureShape(shape, isSkull);
      let shapeTapped = false;
      shape.addEventListener(eventTap, function() {
        if (shapeTapped) {
          return false;
        }
        if (!shapeTapped) {
          shapeTapped = true;
        }
        if (!isPaused) {
          if (isSkull) {
            countSkull += 1;
            countSkullNode.innerHTML = `${countSkull}`;
          } else {
            countFail += 1;
            countFailNode.innerHTML = `${countFail}`;
          }
          shape.style.visibility = "hidden";
        }
      });

      cell.append(shape);
      shape.addEventListener("webkitAnimationEnd", function() {
        shape.remove();
      });
      shape.addEventListener("animationend", function() {
        shape.remove();
      });
      generateShapes(cell, numShapesPerCell - 1);
    }
  };

  const walkAroundTable = (callback, grid1, grid2) => {
    let indexItem = 0;
    for (let i = 0; i < grid1.length; i++) {
      const rowGrid1 = grid1[i];
      const rowGrid2 = grid2[i];

      for (let j = 0; j < rowGrid1.length; j++) {
        const cell = items[indexItem];
        const celGrid1 = rowGrid1[j];
        const celGrid2 = rowGrid2[j];
        callback(cell, celGrid1, celGrid2);
        indexItem++;
      }
    }
  };

  const doTurn = (grid1, grid2) => {
    walkAroundTable(
      function(cell, celGrid1, celGrid2) {
        if (areActiveStatus(celGrid1.status, celGrid2.status)) {
          generateShapes(cell, config.maxParticlesPerCell);
        }
      },
      grid1,
      grid2
    );
  };

  const play = completedCallback => {
    intervalID = utils.setIntervalX(
      intervalID,
      function() {
        if (!isPaused) {
          doTurn(getGrid(), getGrid());
          seconds--;
          secondsNode.innerHTML = `${seconds}`;
        }
      },
      config.delayTurn,
      seconds,
      completedCallback
    );
    console.log(intervalID);
  };

  const walkAroundCell = (cell, callback) => {
    for (let i = 0; i < cell.childNodes.length; i++) {
      callback(cell.childNodes[i]);
    }
  };

  const handResume = () => {
    gridTableNode.classList.remove("grid--is-paused");
    playButtonNode.innerHTML = '<i class="fa fa-pause">';
    backgroundNode.style.animationPlayState = "running";
    for (let i = 0; i < items.length; i++) {
      walkAroundCell(items[i], function(shape) {
        shape.style.animationPlayState = "running";
      });
    }
    play(gameFinished);
  };

  const handPause = () => {
    gridTableNode.classList.add("grid--is-paused");
    playButtonNode.innerHTML = '<i class="fa fa-play">';
    backgroundNode.style.animationPlayState = "paused";
    clearInterval(intervalID);
    for (let i = 0; i < items.length; i++) {
      walkAroundCell(items[i], function(shape) {
        shape.style.animationPlayState = "paused";
      });
    }
  };

  const gameFinished = () => {
    seconds = config.repetitions + 1;
    isLaunched = false;
    secondsNode.innerHTML = "";
    playButtonNode.innerHTML = '<i class="fa fa-redo">';
    backgroundNode.style.animationPlayState = "paused";
  };

  const launchGame = () => {
    isLaunched = true;
    seconds = config.repetitions;
    countFail = 0;
    countSkull = 0;
    secondsNode.innerHTML = `${seconds}`;
    playButtonNode.innerHTML = '<i class="fas fa-pause">';
    countFailNode.innerHTML = `${countFail}`;
    countSkullNode.innerHTML = `${countSkull}`;
    backgroundNode.style.animationPlayState = "paused";
    play(gameFinished);
  };

  const init = configEntry => {
    const e = configEntry;
    const d = configDefault;
    config = {
      numberRows: e.numberRows || d.numberRows,
      numberCols: e.numberCols || d.numberCols,
      repetitions: e.repetitions || d.repetitions,
      maxParticlesPerCell: e.maxParticlesPerCell || d.maxParticlesPerCell,
      delayTurn: e.delayTurn || d.delayTurn,
      maxTimeParticle: e.maxTimeParticle || d.maxTimeParticle,
      minTimeParticle: e.minTimeParticle || d.minTimeParticle,
      coefProbablySkulls: e.coefProbablySkulls || d.coefProbablySkulls
    };
    document.documentElement.style.setProperty(
      "--repetitions",
      config.repetitions
    );
    document.documentElement.style.setProperty("--delayTurn", config.delayTurn);
    seconds = config.repetitions;
    secondsNode.innerHTML = `${seconds}`;
    isPaused = false;
    if (!isPaused) {
      playButtonNode.innerHTML = '<i class="fa fa-pause">';
      play(gameFinished);
    }

    playButtonNode.addEventListener("click", function(e) {
      if (isLaunched) {
        isPaused = !isPaused;
        isPaused ? handResume() : handPause();
        if (!isPaused) {
          handResume();
        } else {
          handPause();
        }
      } else {
        launchGame();
      }
    });

    changeCSSGrid();
    items = drawTable(config.numberRows * config.numberCols);
  };

  return {
    init: init
  };
})();

module.exports = game;
