class Simulator {
  constructor(bonusProb, enterProb, continueProb) {
    this.bonusProb = 1.0 / bonusProb;
    this.enterProb = enterProb / 100.0;
    this.continueProb = continueProb / 100.0;
    this.mt = new MersenneTwister();

    this.isBonus = false;
    this.isKakuhen = false;
  }

  playANormalGame() {
    if (this.mt.genrand_real1() <= this.bonusProb) {
      this.isBonus = true;
      this.isKakuhen = this.enterKakuhen();
    }
  }

  // 確変に突入するか判定
  enterKakuhen() {
    return this.mt.genrand_real1() <= this.enterProb;
  }

  // 確変から転落するまで回す
  playUntilTenraku() {
    let bonusCount = 1;

    while (true) {
      let endKakuhen = this.mt.genrand_real1() > this.continueProb;
      if (endKakuhen) {
        break;
      }
      bonusCount++;
    }

    this.isBonus = false;
    this.isKakuhen = false;

    return bonusCount;
  }

  // 決まった通常ゲーム数回す
  play(maxNormalGames) {
    const results = [];
    let totalGames = 0;
    let games = 0;

    while (totalGames <= maxNormalGames) {
      games++;
      totalGames++;
      this.playANormalGame();

      if (this.isBonus && !this.isKakuhen) {
        // 通常大当り
        results.push({
          games: games,
          type: "normal",
          count: 1
        });
        games = 0;
        this.isBonus = false;

      } else if (this.isBonus && this.isKakuhen) {
        // 確変大当り
        let count = this.playUntilTenraku();
        results.push({
          games: games,
          type: "kakuhen",
          count: count
        });
        games = 0;
      }
    }

    results.push({
      games: games,
      type: "finish",
      count: null
    })

    return results;
  }
}

const output = (result) => {
  if (result.type === 'normal') {
    return `${result.games}G 通常<br>`;

  } else if (result.type === 'kakuhen') {
    return `${result.games}G 確変 ${result.count}連<br>`;

  } else {
    return `${result.games}G やめ<br>`;
  }
}

$(document).ready(() => {
  $('button#start').click(() => {
    $('ol#result-list').html('');

    let bonus1 = Number($('input#bonus1').val());
    let enter = Number($('input#enter').val());
    let cont = Number($('input#continue').val());
    let games = Number($('input#normal-games').val());

    if (!bonus1 || !enter || !cont || !games) {
      return;
    }

    new Simulator(bonus1, enter, cont).play(games).forEach((result) => {
      $('ol#result-list').html($('ol#result-list').html() + output(result));
    });
  });
});
