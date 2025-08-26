/*
 * ビューモデルのクラス
 * このクラスを更新することで画面表示も更新される
 */
class ViewModel {
  constructor() { }

  /*
   * 表示をクリア
   */
  clearResult() {
    $('article#output-article').html('').innerText = '';
  }

  /*
   * 値を表示
   */
  updateResult(gameCount, big, reg) {
    $('article#output-article').html('').innerText = `総ゲーム数 ${gameCount} G BIG 1/${big} REG 1/${reg}`;
  }
}

const view = new View();

$(document).ready(() => {
  $('textarea#input-area').on("change", () => {
    const src = $('textarea#input-area').val();
    const data = [];

    src.split('\n').forEach(line => {
      const values = line.split('( |　|\t)');
      if (values.length != 3) {
        return;
      }

      const [gameCount, bigCount, regCount] = values.map((v) => {
        str = str.replace(/[０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
        return new BigNumber(v);
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
    
    this.updateResult(totalGameCount, bigDenominator, regDenominator);

    $('article#output-article').html(result);
  });
});
