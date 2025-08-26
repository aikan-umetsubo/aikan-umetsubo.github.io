const people = new Array(100);
let chart;
let aliveCount;
const mt = new MersenneTwister();
let intervalId;
let playing = false;

window.onload = () => {
  initView();
  initCtrl();
};

initPeople = () => {
  for (let i = 0; i < people.length; i++) {
    people[i] = {
      alive: true,
      money: 100
    };
  }
};

initView = () => {
  initPeople();

  aliveCount = document.querySelector('span#aliveCount');
  aliveCount.innerHTML = people.filter((p) => p.alive).length;

  chart = bb.generate({
    bindto: "#chart",
    data: {
      columns: [
          ["people"].concat(people.map(p => p.money))
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
            color: "black"
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

  let steps = () => { step(5000) };
  let interval = 1;
  intervalId = setInterval(steps, interval);

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

  updateView();
}

updatePeople = () => {
  // 1万円を渡す人をランダムに選択（所持金が10000円に満たないか、死んでる人の場合は選び直す）
  let from = mt.nextInt(0, 100);
  while (people[from].money < 1 || !people[from].alive) from = mt.nextInt(0, 100);

  // 1万円を受け取る人をランダムに選択（渡す人と同じになったか、死んでる人の場合は選び直す）
  let to = mt.nextInt(0, 100);
  while (from === to || !people[to].alive) to = mt.nextInt(0, 100);

  // 受け渡し
  people[from].money = people[from].money - 1;
  people[to].money = people[to].money + 1;

  // 受け渡しの結果、所持金が10000円以下になった場合は死んじゃう
  if (people[from].money < 1) people[from].alive = false;
};

updateView = () => {
  aliveCount.innerHTML = people.filter((p) => p.alive).length;

  chart.load({
    columns: [
      ["people"].concat(people.map(p => p.money))
    ]
  });
};
