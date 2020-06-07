const root = document.querySelector(":root");

// ビューモデルのクラス
class ViewModel {
  constructor(leftReel, centerReel, rightReel, leftCursor, centerCursor, rightCursor) {
    // リール
    this.reels = {
      left: leftReel,
      center: centerReel,
      right: rightReel
    }

    // カーソル
    this.cursors = {
      left: leftCursor,
      center: centerCursor,
      right: rightCursor,
    }

    // どのリールが選択されているか
    this.select = new Select(leftCursor, centerCursor, rightCursor);

    // コンフィグ
    this.config = new Config();

    // URLのハッシュの更新
    this.updateHash();
  }

  selectedReel() {
    return this.reels[this.select.current];
  }

  updateHash() {
    window.location.hash = `${this.reels.left.hash}${this.reels.center.hash}${this.reels.right.hash}`;
  }

  init() {
    if (!window.location.hash) {
      /* TODO: hashなしの場合の初期処理 */
    } else {
      this.reels.left.to(config.initialPosition.left);
      this.reels.center.to(config.initialPosition.center);
      this.reels.right.to(config.initialPosition.right);
    }
  }
};

// 図柄
class Symbol {
  constructor(position, cssVariable) {
    this.position = (position + config.symbolCount) % config.symbolCount;
    this.cssVariable = cssVariable;
    root.style.setProperty(this.cssVariable, this.position);
  }

  toString() {
    return `${this.cssVariable} : ${this.position}`;
  }

  toUp() {
    this.position = (this.position + 1) % config.symbolCount;
    root.style.setProperty(this.cssVariable, this.position);
  }

  toDown() {
    this.position = (this.position - 1 + config.symbolCount) % config.symbolCount;
    root.style.setProperty(this.cssVariable, this.position);
  }
  
  to(position) {
    this.position = (position + config.symbolCount) % config.symbolCount;
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

class Cursor {
  constructor(cssVariable) {
    this.cssVariable = cssVariable;
  }
  
  toString() {
    return `${this.cssVariable}`;
  }

  select() {
    root.style.setProperty(this.cssVariable, "#FF0000 #FF0000 transparent transparent");
  }

  deselect() {
    root.style.setProperty(this.cssVariable, "#565656 #565656 transparent transparent");
  }
}

// 選択されているリールを表すクラス
class Select {
  constructor(leftCursor, centerCursor, rightCursor) {
    // 初期値は左
    this.current = "left";

    this.cursors = {
      left: leftCursor,
      center: centerCursor,
      right: rightCursor
    };

    // 左は表示、中・右は非表示
    this.cursors.left.select();
    this.cursors.center.deselect();
    this.cursors.right.deselect();
  }
  
  toString() {
    return this.current;
  }
  
  // 選択位置を左に移動
  toLeft() {
    // 現在の選択位置
    const previous = this.current;

    // 内部的な選択位置の変更
    this.current = {
      "left": "right",
      "center": "left",
      "right": "center"
    }[previous];

    // 画面表示の変更
    this.cursors[previous].deselect();
    this.cursors[this.current].select();
  }

  // カーソルを右に移動
  toRight() {
    // 現在の選択位置
    const previous = this.current;

    // 内部的な選択位置の変更
    this.current = {
      "left": "center",
      "center": "right",
      "right": "left"
    }[previous];

    // 画面表示の変更
    this.cursors[previous].deselect();
    this.cursors[this.current].select();
  }
}

// URLのハッシュ
//
// 形式は「LLCCRR」。
// LL, CC, RRはそれぞれ01〜21の値を取り、左、中、右リールの位置を示す。
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
  
  // ハッシュが有効かどうかのチェック
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

const config = {
  "initialPosition": {
      "left": 7,
      "center": 9,
      "right": 13
  },
  "symbolCount": 21
}

// ビューモデルの生成
const viewModel = new ViewModel(
  new Reel(
    new Symbol(config.initialPosition.left, "--left-upper-reel-position"),
    new Symbol(config.initialPosition.left+1, "--left-middle-reel-position"),
    new Symbol(config.initialPosition.left+2, "--left-lower-reel-position")
  ),
  new Reel(
    new Symbol(config.initialPosition.center, "--center-upper-reel-position"),
    new Symbol(config.initialPosition.center+1, "--center-middle-reel-position"),
    new Symbol(config.initialPosition.center+2, "--center-lower-reel-position")
  ),
  new Reel(
    new Symbol(config.initialPosition.right, "--right-upper-reel-position"),
    new Symbol(config.initialPosition.right+1, "--right-middle-reel-position"),
    new Symbol(config.initialPosition.right+2, "--right-lower-reel-position")
  ),
  new Cursor("--left-cursor-color"),
  new Cursor("--center-cursor-color"),
  new Cursor("--right-cursor-color")
);

// ページの読み込み後の処理
window.onload = () => {
  // ビューモデルを初期化
  viewModel.init();

  // カーソルクリック時のイベント設定
  document.querySelector("#upper-left-cursor").onclick = (e) => {
    viewModel.reels.left.toUp();
  };
  document.querySelector("#upper-center-cursor").onclick = (e) => {
    viewModel.reels.center.toUp();
  };
  document.querySelector("#upper-right-cursor").onclick = (e) => {
    viewModel.reels.right.toUp();
  };
  document.querySelector("#lower-left-cursor").onclick = (e) => {
    viewModel.reels.left.toDown();
  };
  document.querySelector("#lower-center-cursor").onclick = (e) => {
    viewModel.reels.center.toDown();
  }
  document.querySelector("#lower-right-cursor").onclick = (e) => {
    viewModel.reels.right.toDown();
  };
};

// キー操作時のイベント設定
root.onkeydown = (e) => {
  if (e.code === "ArrowUp") {
    viewModel.selectedReel().toUp();
    viewModel.updateHash();
  } else if (e.code === "ArrowDown") {
    viewModel.selectedReel().toDown();
    viewModel.updateHash();
  } else if (e.code === "ArrowLeft") {
    viewModel.select.toLeft();
  } else if (e.code === "ArrowRight") {
    viewModel.select.toRight();
  }
};
