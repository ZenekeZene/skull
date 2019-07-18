const utils = require("./utils");

const colors = (() => {
  const colors = [
    [
      "rgba(135, 168, 120, 1)",
      "rgba(176, 188, 152, 1)",
      "rgba(199, 204, 185, 1)",
      "rgba(202, 226, 188, 1)",
      "rgba(219, 249, 184, 1)"
    ],
    [
      "rgba(54, 21, 30, 1)",
      "rgba(89, 63, 98, 1)",
      "rgba(123, 109, 141, 1)",
      "rgba(132, 153, 177, 1)",
      "rgba(165, 196, 212, 1)"
    ],
    [
      "rgba(235, 245, 223, 1)",
      "rgba(186, 212, 170, 1)",
      "rgba(212, 212, 170, 1)",
      "rgba(237, 180, 88, 1)",
      "rgba(232, 135, 30, 1)"
    ]
  ];

  const getRandomColor = () => {
    return colors[Math.round(Math.random() * 1 + 1)][
      utils.getRandomInterval(0, colors.length)
    ];
  };

  return {
    getRandomColor: getRandomColor
  };
})();

module.exports = colors;
