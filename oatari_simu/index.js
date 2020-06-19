/*
 * パチンコシミュレータのクラス
 */
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

  /*
   * 通常を1ゲーム回す
   */
  playANormalGame() {
    if (this.rng.genrand_real1() <= this.bonusProb) {
      this.isBonus = true;
      this.isKakuhen = this.enterKakuhen();
    }
  }

  /*
   * 確変に突入するか判定する
   */
  enterKakuhen() {
    return this.rng.genrand_real1() <= this.enterProb;
  }

  /*
   * 確変から転落するまで回し、継続回数を返す
   */
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

  /*
   * 決まった通常ゲーム数回し、遊技履歴を返す
   */
  play(maxNormalGames) {
    const results = [];
    let totalGames = 0;
    let games = 0;

    while (totalGames < maxNormalGames) {
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

/*
 * ビューのクラス
 * 画面表示の更新はこのクラス経由で実施する
 */
class View {
  constructor() { }

  /*
   * 遊技結果をクリア
   */
  clearResult() {
    $('ul#result-list li span').html('').removeClass('win draw lose');
    $('ol#play-history').html('');
  }

  /*
   * 遊技結果と所持金を元に遊技結果の一覧に履歴を1行追加する
   */
  appendPlayHistoryItem(result, fundage) {
    // 所持金の小数点以下を四捨五入
    let fundageInt = Number.parseFloat(fundage).toFixed();

    // 遊技履歴の一覧に履歴を1行追加
    $('ol#play-history').append(
      {
        normal:  `<li>${result.games}G 通常 所持金 ${fundageInt}円</li>`,
        kakuhen: `<li>${result.games}G 確変 ${result.count}連 所持金 ${fundageInt}円</li>`,
        finish:  `<li>${result.games}G やめ 所持金 ${fundageInt}円</li>`
      }[result.type]
    );
  }

  /*
   * 勝敗、収支、総ゲーム数、初当り回数を元に遊技の最終結果を更新する
   */
  updateResultList(balance, totalGames, hatsuatariCount) {
    // 勝敗
    const winOrDrawOrLose = balance > 0 ? 'win' : balance < 0 ? 'lose' : 'draw';
    $('ul#result-list li span').addClass(winOrDrawOrLose);

    // 収支
    $('span#balance').text(
      {
        win:  `+${Number.parseFloat(balance).toFixed()}円`,
        draw: '±0円',
        lose: `${Number.parseFloat(balance).toFixed()}円`
      }[winOrDrawOrLose]
    );

    // 初当り確率
    if (hatsuatariCount > 0) {
      let hatsuatariProb = Number.parseFloat(totalGames / hatsuatariCount).toFixed(2);
      $('span#hatsuatari-prob').text(`1/${hatsuatariProb}`);
    } else {
      $('span#hatsuatari-prob').text('-');
    }
  }
}

const view = new View();

$(document).ready(() => {
  $('button#start').click(() => {
    // 遊技結果をクリア
    view.clearResult();

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

    // シミュレーション結果を元に初当り回数を求める
    // (「やめ」を除くのでマイナス1)
    const hatsuatariCount = results.length - 1;

    // シミュレーション結果を元に最終的な所持金を求めつつ、大当り履歴を更新
    let fundage = initialFundage;
    results.forEach((result) => {
      // 大当りまでに使ったお金
      const bet = 1000 * (result.games / gamesPerHideyo);

      // 大当りで得たお金
      const payout = {
        normal: (r) => 4 * result.count * normalPayout,
        kakuhen: (r) => 4 * (normalPayout + (result.count - 1) * kakuhenPayout),
        finish: (r) => 0
      }[result.type](result);

      // 所持金を更新
      fundage = fundage - bet + payout;

      // 大当り履歴を画面に出力
      view.appendPlayHistoryItem(result, fundage);
    });

    // 収支を求め、遊技の最終結果を画面に出力
    const balance = fundage - initialFundage;
    view.updateResultList(balance, games, hatsuatariCount);
  });
});
