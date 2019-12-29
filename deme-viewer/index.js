const root = document.querySelector(":root");

// ビューモデルのクラス
class ViewModel {
  constructor(leftReel, centerReel, rightReel, leftCursor, centerCursor, rightCursor) {
    // リール
    this.leftReel = leftReel;
    this.centerReel = centerReel;
    this.rightReel = rightReel;

    // カーソル
    this.leftCursor = leftCursor;
    this.centerCursor = centerCursor;
    this.rightCursor = rightCursor;

    // URLのハッシュの更新
    this.updateHash();
  }
  selectedReel() {
    let reels = {
      left: this.leftReel,
      center: this.centerReel,
      right: this.rightReel
    }
    return reels[this.cursor.select];
  }
  updateHash() {
    window.location.hash = `${this.left.hash}${this.center.hash}${this.right.hash}`;
  }
  init() {
    if (!window.location.hash) {
      /* TODO: hashなしの場合の初期処理 */
    } else {
      viewModel.left.to(initialPosition.left);
      viewModel.center.to(initialPosition.center);
      viewModel.right.to(initialPosition.right);
    }
  }
};

// 図柄
class Symbol {
  constructor(position, cssVariable) {
    this.position = (position + symbolCount) % symbolCount;
    this.cssVariable = cssVariable;
    root.style.setProperty(this.cssVariable, this.position);
  }
  toString() {
    return `${this.cssVariable} : ${this.position}`;
  }
  toUp() {
    this.position = (this.position + 1) % symbolCount;
    root.style.setProperty(this.cssVariable, this.position);
  }
  toDown() {
    this.position = (this.position　- 1 + symbolCount) % symbolCount;
    root.style.setProperty(this.cssVariable, this.position);
  }
  to(position) {
    this.position = (position + symbolCount) % symbolCount;
    root.style.setProperty(this.cssVariable, this.position);
  }
}

// リール
class Reel {
  constructor(upper, middle, lower) {
    this.upper_symbol = upper;
    this.middle_symbol = middle;
    this.lower_symbol = lower;
    this.updateHash();
  }
  toString() {
    return [
      this.upper_symbol.toString(),
      this.middle_symbol.toString(),
      this.lower_symbol.toString()
    ];
  }
  toUp() {
    this.upper_symbol.toUp();
    this.middle_symbol.toUp();
    this.lower_symbol.toUp();
    this.updateHash();
  }
  toDown() {
    this.upper_symbol.toDown();
    this.middle_symbol.toDown();
    this.lower_symbol.toDown();
    this.updateHash();
  }
  to(position) {
    this.upper_symbol.to(position);
    this.middle_symbol.to(position+1);
    this.lower_symbol.to(position+2);
    this.updateHash();
  }
  updateHash() {
    this.hash = String(this.upper_symbol.position+1).padStart(2, "0");
  }
}

// カーソルのクラス
class Cursors {
  constructor() {
    // 左・中・右のカーソル
    this.cursors = [
      new Cursor("--upper-left-cursor-display", "--lower-left-cursor-display"),
      new Cursor("--upper-center-cursor-display", "--lower-center-cursor-display"),
      new Cursor("--upper-right-cursor-display", "--lower-right-curso-displayr")
    ];

    // 初期値は左
    this.current = 0;

    // 左は表示、中・右は非表示
    this.cursors[0].show();
    this.cursors[1].hide();
    this.cursors[2].hide();
  }
  current() {
    return _current;
  }
  toString() {
    return ["left", "center", "right"][this._current];
  }
  toLeft() {
    /* TODO:今のカーソルをhiddenに */
    this._current = (this._current + 2) % 3;
    this.current = this.toString();
    /* TODO:新しいカーソルを表示 */
  }
  toRight() {
    /* TODO:今のカーソルをhiddenに */
    this._current = (this._current + 1) % 3;
    this.current = this.toString();
    /* TODO:新しいカーソルを表示 */
  }
}
class Cursor {
  constructor(upperCssVariable, lowerCssVariable) {
    this.upperCssVariable = upperCssVariable;
    this.lowerCssVariable = lowerCssVariable;
  }
  toString() {
    return `${this.upperCssVariable} - ${this.lowerCssVariable}`;
  }
  hide() {
    root.style.setProperty(this.upperCssVariable, 'hidden');
    root.style.setProperty(this.lowerCssVariable, 'hidden');
  }
  show() {
    root.style.setProperty(this.upperCssVariable, 'visible');
    root.style.setProperty(this.lowerCssVariable, 'visible');
  }
}

// URLのハッシュ
class Hash {
  constructor(left, center, right) {
    if (this.isValid(left, center, right)) {
        this._left = left;
        this._center = center;
        this._right = right;
    } else {

    }
    window.location.hash = `${this.left.hash}${this.center.hash}${this.right.hash}`;
  }
  isValid(left, center, right) {
    return !left && String(left).match(/0[1-9]|1[1-9]|2[0-1]/)
           &&
           !center && String(center).match(/0[1-9]|1[1-9]|2[0-1]/)
           &&
           !left && String(left).match(/0[1-9]|1[1-9]|2[0-1]/);
  }
}

// コンフィグ
class Config {
  constructor() {
      
  }
}

// ビューモデルの生成
const viewModel = new ViewModel(
  /* TODO:正式なCSS変数を渡す */
  new Cursors(),
  new Reel(
    new Symbol(initialPosition.left, "--left-upper-reel-position"),
    new Symbol(initialPosition.left+1, "--left-middle-reel-position"),
    new Symbol(initialPosition.left+2, "--left-lower-reel-position")
  ),
  new Reel(
    new Symbol(initialPosition.center, "--center-upper-reel-position"),
    new Symbol(initialPosition.center+1, "--center-middle-reel-position"),
    new Symbol(initialPosition.center+2, "--center-lower-reel-position")
  ),
  new Reel(
    new Symbol(initialPosition.right, "--right-upper-reel-position"),
    new Symbol(initialPosition.right+1, "--right-middle-reel-position"),
    new Symbol(initialPosition.right+2, "--right-lower-reel-position")
  )
);

// ページの読み込み後にビューモデルを初期化
window.onload = () => {
  viewModel.init();
};

// 画面操作時のイベントの
root.onkeydown = () => {
  if (e.code === "ArrowUp") {
    viewModel.selectedReel().toUp();
    viewModel.updateHash();
  } else if (e.code === "ArrowDown") {
    viewModel.selectedReel().toDown();
    viewModel.updateHash();
  } else if (e.code === "ArrowLeft") {
    viewModel.cursor.toLeft();
  } else if (e.code === "ArrowRight") {
    viewModel.cursor.toRight();
  }
};