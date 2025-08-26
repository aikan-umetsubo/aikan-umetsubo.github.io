/*
 * ビューのクラス
 * このクラスを更新することで画面表示も更新される
 */
class View {
  constructor() { }

  /*
   * 値を表示
   */
  updateResult(gameCount, big, reg) {
    $('li#total-game-count').html(`総ゲーム数：${gameCount}`);
    $('li#big-bonus-prob').html(`BIG：1/${big}`);
    $('li#reg-bonus-prob').html(`REG：1/${reg}`);
  }
}

const view = new View();

BigNumber.set({ DECIMAL_PLACES: 2, ROUNDING_MODE: 4 })

$(document).ready(() => {
  $('textarea#input-area').on("change", () => {
    const src = $('textarea#input-area').val();
    const data = [];

    src.split('\n').forEach(line => {
      const values = line.split(/ |　|\t/);
      if (values.length != 3) {
        return;
      }

      const [gameCount, bigCount, regCount] = values.map((v) => {
        str = v.replace(/[０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
        return new BigNumber(str);
      });
      data.push({gameCount: gameCount, bigCount: bigCount, regCount: regCount});
    })
    
    const totalGameCount = data.reduce((acc, v) => {
      return acc.plus(v.gameCount);
    }, new BigNumber(0));
    const totalBigCount = data.reduce((acc, v) => {
      return acc.plus(v.bigCount);
    }, new BigNumber(0));
    const totalRegCount = data.reduce((acc, v) => {
      return acc.plus(v.regCount);
    }, new BigNumber(0));

    const bigDenominator = totalGameCount.div(totalBigCount);
    const regDenominator = totalGameCount.div(totalRegCount);
    
    view.updateResult(totalGameCount, bigDenominator, regDenominator);
  });
});
