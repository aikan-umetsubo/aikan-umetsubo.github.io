class Simulator {
  constructor(bonusProb, enterProb, continueProb) {
    // 乱数生成器
    this.rng = new MersenneTwister();

    // ボーナス確率
    this.bonusProb = 1.0 / bonusProb;
    this.enterProb = enterProb / 100.0;
    this.continueProb = continueProb / 100.0;

    this.isBonus = false;
    this.isKakuhen = false;
  }

  // 通常を1ゲーム回す
  playANormalGame() {
    if (this.rng.genrand_real1() <= this.bonusProb) {
      this.isBonus = true;
      this.isKakuhen = this.enterKakuhen();
    }
  }

  // 確変に突入するか判定
  enterKakuhen() {
    return this.rng.genrand_real1() <= this.enterProb;
  }

  // 確変から転落するまで回す
  playUntilTenraku() {
    let bonusCount = 1;

    while (true) {
      let endKakuhen = this.rng.genrand_real1() > this.continueProb;
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

const resultListItem = (result, fundage) => {
  // 所持金の小数点以下を四捨五入
  let fundageInt = Number.parseFloat(fundage).toFixed();

  if (result.type === 'normal') {
    return `<li>${result.games}G 通常 所持金 ${fundageInt}円</li>`;

  } else if (result.type === 'kakuhen') {
    return `<li>${result.games}G 確変 ${result.count}連 所持金 ${fundageInt}円</li>`;

  } else {
    return `<li>${result.games}G やめ 所持金 ${fundageInt}円</li>`;
  }
}

$(document).ready(() => {
  $('button#start').click(() => {
    // 遊技結果をクリア
    $('ul#result-list li span').html('').removeClass('win draw lose');
    $('ol#result-history').html('');

    // 入力された機種情報、遊技情報を取得
    const bonus1 = Number($('input#bonus1').val());
    const normalPayout = Number($('input#normal-payout').val());
    const enter = Number($('input#enter').val());
    const cont = Number($('input#continue').val());
    const kakuhenPayout = Number($('input#kakuhen-payout').val());

    const initialFundage = Number($('input#initial-fundage').val());
    const gamesPerHideyo = Number($('input#games-per-1000').val());
    const games = Number($('input#normal-games').val());

    // 機種情報、遊技情報のバリデート
    if (!bonus1 || !normalPayout || !enter || !cont || !kakuhenPayout || !initialFundage || !gamesPerHideyo || !games) {
      // エラーメッセージの表示はそのうち実装したい
      return;
    }

    // シミュレーション実行
    const results = new Simulator(bonus1, enter, cont).play(games);

    // シミュレーション結果から欲しいデータを抽出
    let fundage = initialFundage;
    let hatsuatariCount = results.length - 1;
    results.forEach((result) => {
      // 大当りまでに使ったお金
      let bet = 1000 * (result.games / gamesPerHideyo);

      // 大当りで得たお金
      let payout = {
        normal: (r) => 4 * result.count * normalPayout,
        kakuhen: (r) => 4 * (normalPayout + (result.count - 1) * kakuhenPayout),
        finish: (r) => 0
      }[result.type](result);

      // 所持金と初当り回数を更新
      fundage = fundage - bet + payout;
      hatsuatariCount++;

      // 大当り履歴を画面に出力
      $('ol#result-history').append(resultListItem(result, fundage));
    });

    // 遊技の最終結果を画面に出力
    // 勝敗、収支
    if (initialFundage < fundage) {
      $('ul#result-list li span').addClass('win');
      $('span#balance').text(`+${Number.parseFloat(fundage - initialFundage).toFixed()}円`);
    } else if (initialFundage === fundage) {
      $('ul#result-list li span').addClass('draw');
      $('span#balance').text(`±0円`);
    } else {
      $('ul#result-list li span').addClass('lose');
      $('span#balance').text(`-${Number.parseFloat(initialFundage - fundage).toFixed()}円`);
    }

    // 初当り確率
    if (hatsuatariCount > 0) {
      let hatsuatariProb = Number.parseFloat(games / hatsuatariCount).toFixed(2);
      $('span#hatsuatari-prob').text(`1/${hatsuatariProb}`);
    } else {
      $('span#hatsuatari-prob').text('-');
    }
  });
});
