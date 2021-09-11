const people = new Array(100);
let chart;
const mt = new MersenneTwister();
let intervalId;
let playing = false;

window.onload = () => {
  initChart();
  initCtrl();
};

initPeople = () => {
  for (let i = 0; i < people.length; i++) {
    people[i] = 100;
  }
};

initChart = () => {
  initPeople();
  chart = bb.generate({
    bindto: "#chart",
    data: {
      columns: [
          ["people"].concat(people)
      ],
      types: {
        people: "bar"
      },
      colors: {
        people: "#53a9ff"
      },
      names: {
        people: "所持金"
      }
    },
    axis: {
      x: {
        label: {
          text: "100人の方々(No.0〜No.99)",
          position: "outer-center"
        }
      },
      y: {
        label: {
          text: "所持金(万円)",
          position: "outer-middle"
        }
      }
    },
    grid: {
      y: {
        lines: [
          {
            value: 100,
            color: "blue"
          }
        ]
      }
    }
  });
};

initCtrl = () => {
  document.querySelector("#play").onclick = play  
  document.querySelector("#stop").onclick = stop;
};

play = () => {
  if (playing) return;

  let hundredStep = () => { step(100) };
  let interval = 1;
  intervalId = setInterval(hundredStep, interval);

  playing = true;
}

stop = () => {
  clearInterval(intervalId);
  playing = false;
}

step = (count) => {
  for (let i = 0; i < count; i++) {
    updatePeople();
  }

  updateChart();
}

updatePeople = () => {
  // 1万円を渡す人をランダムに選択（所持金が10000円に満たない場合は選び直す）
  let from = mt.nextInt(0, 100);
  while (people[from] < 1) from = mt.nextInt(0, 100);

  // 1万円を受け取る人をランダムに選択（渡す人と同じになった場合は選び直す）
  let to = mt.nextInt(0, 100);
  while (from === to) to = mt.nextInt(0, 100);

  // 受け渡し
  people[from] = people[from] - 1;
  people[to] = people[to] + 1;
};

updateChart = () => {
  chart.load({
    columns: [
      ["people"].concat(people)
    ]
  });
};
