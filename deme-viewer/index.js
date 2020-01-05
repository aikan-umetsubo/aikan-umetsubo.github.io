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
    this.position = (this.position　- 1 + config.symbolCount) % config.symbolCount;
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

// 選択のクラス
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
    this.cursors.left.show();
    this.cursors.center.hide();
    this.cursors.right.hide();
  }
  
  toString() {
    return this.current;
  }
  
  toLeft() {
    this.cursors[this.current].hide();

    if (this.current === "left") {
      this.current = "right";
    } else if (this.current === "center") {
      this.current = "left";
    } else {
      this.current = "center";
    }

    this.cursors[this.current].show();
  }
  
  toRight() {
    this.cursors[this.current].hide();

    if (this.current === "left") {
      this.current = "center";
    } else if (this.current === "center") {
      this.current = "right";
    } else {
      this.current = "left";
    }
    
    this.cursors[this.current].show();
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
  new Cursor("--upper-left-cursor-display", "--lower-left-cursor-display"),
  new Cursor("--upper-center-cursor-display", "--lower-center-cursor-display"),
  new Cursor("--upper-right-cursor-display", "--lower-right-cursor-display")
);

// ページの読み込み後にビューモデルを初期化
window.onload = () => {
  viewModel.init();
};

// 画面操作時のイベント設定
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
