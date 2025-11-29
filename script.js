// 数秘術自動計算ツール - メインスクリプト

// 現在の表示モード（'brief': 一言解説, 'detail': 詳細解説）
let currentDisplayMode = 'brief';

// 計算結果を保持するグローバル変数
let cachedResults = null;

/**
 * 初期化処理
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeDateSelects();
    setupEventListeners();
});

/**
 * 生年月日のセレクトボックスを初期化
 */
function initializeDateSelects() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');

    // 年の選択肢を生成（1900年〜現在）
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}年`;
        yearSelect.appendChild(option);
    }

    // 月の選択肢を生成（1〜12月）
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = `${month}月`;
        monthSelect.appendChild(option);
    }

    // 日の選択肢を初期生成（1〜31日）
    updateDayOptions();

    // 年・月が変更されたら日の選択肢を更新
    yearSelect.addEventListener('change', updateDayOptions);
    monthSelect.addEventListener('change', updateDayOptions);
}

/**
 * 日の選択肢を更新（月の日数に応じて）
 */
function updateDayOptions() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');

    const currentDay = daySelect.value; // 現在選択されている日を保持

    const year = parseInt(yearSelect.value) || new Date().getFullYear();
    const month = parseInt(monthSelect.value) || 1;

    // 指定された年月の最終日を取得
    const daysInMonth = new Date(year, month, 0).getDate();

    // 日の選択肢をクリア
    daySelect.innerHTML = '<option value="">日</option>';

    // 有効な日数分の選択肢を生成
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = `${day}日`;
        daySelect.appendChild(option);
    }

    // 以前選択されていた日が有効な範囲内なら再選択
    if (currentDay && parseInt(currentDay) <= daysInMonth) {
        daySelect.value = currentDay;
    }
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    const form = document.getElementById('numerologyForm');
    form.addEventListener('submit', handleFormSubmit);

    // 表示モード切り替えボタンのイベントリスナー
    const briefModeBtn = document.getElementById('briefModeBtn');
    const detailModeBtn = document.getElementById('detailModeBtn');

    briefModeBtn.addEventListener('click', () => switchDisplayMode('brief'));
    detailModeBtn.addEventListener('click', () => switchDisplayMode('detail'));
}

/**
 * フォーム送信時の処理
 */
function handleFormSubmit(event) {
    event.preventDefault();

    // エラーメッセージをクリア
    hideError();

    // 入力値を取得
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const day = document.getElementById('day').value;
    const name = document.getElementById('name').value.trim();

    // バリデーション
    if (!validateInputs(year, month, day, name)) {
        return;
    }

    // 計算処理（今後実装）
    calculateNumerology(year, month, day, name);
}

/**
 * 入力値のバリデーション
 */
function validateInputs(year, month, day, name) {
    // 必須チェック
    if (!year || !month || !day) {
        showError('生年月日をすべて選択してください。');
        return false;
    }

    if (!name) {
        showError('お名前を入力してください。');
        return false;
    }

    // 名前の長さチェック
    if (name.length < 2) {
        showError('お名前は2文字以上で入力してください。');
        return false;
    }

    if (name.length > 50) {
        showError('お名前は50文字以内で入力してください。');
        return false;
    }

    // 名前のチェック（アルファベットとスペースのみ）
    if (!isValidName(name)) {
        showError('お名前はアルファベットとスペースのみで入力してください。');
        return false;
    }

    // 連続するスペースのチェック
    if (/\s{2,}/.test(name)) {
        showError('スペースは連続して使用できません。');
        return false;
    }

    // 先頭・末尾のスペースチェック
    if (name !== name.trim()) {
        showError('名前の先頭または末尾にスペースを含めることはできません。');
        return false;
    }

    // 未来の日付チェック
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const inputDate = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate > today) {
        showError('未来の日付は入力できません。');
        return false;
    }

    // 年齢チェック（150歳以上は警告）
    const age = today.getFullYear() - yearNum;
    if (age > 150) {
        showError('生年月日を確認してください。');
        return false;
    }

    return true;
}

/**
 * 名前の妥当性チェック
 */
function isValidName(name) {
    const namePattern = /^[A-Za-z\s]+$/;
    return namePattern.test(name);
}

/**
 * エラーメッセージを表示
 */
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

/**
 * エラーメッセージを非表示
 */
function hideError() {
    const errorElement = document.getElementById('errorMessage');
    errorElement.style.display = 'none';
}

// numerology-data.jsから読み込まれるデータを使用
// PYTHAGOREAN_TABLE, VOWELS, NUMBER_TYPE_DESCRIPTIONS, NUMBER_KEYWORDS, NUMBER_DESCRIPTIONS

/**
 * 文字を数値に変換
 * @param {string} letter - 変換する文字
 * @returns {number} 対応する数値
 */
function letterToNumber(letter) {
    const upperLetter = letter.toUpperCase();
    return PYTHAGOREAN_TABLE[upperLetter] || 0;
}

/**
 * 文字が母音かどうかを判定
 * @param {string} letter - 判定する文字
 * @returns {boolean} 母音ならtrue
 */
function isVowel(letter) {
    return VOWELS.includes(letter.toUpperCase());
}

/**
 * 名前を数値化（スペースを除く）
 * @param {string} name - 名前
 * @param {string} filter - 'all'（全て）, 'vowels'（母音のみ）, 'consonants'（子音のみ）
 * @returns {number} 合計値
 */
function nameToNumber(name, filter = 'all') {
    let sum = 0;
    for (let char of name) {
        // スペースは無視
        if (char === ' ') continue;

        // フィルター適用
        if (filter === 'vowels' && !isVowel(char)) continue;
        if (filter === 'consonants' && isVowel(char)) continue;

        sum += letterToNumber(char);
    }
    return sum;
}

/**
 * 数値を還元する（マスターナンバー対応）
 * @param {number} num - 還元する数値
 * @returns {number} 還元された数値
 */
function reduceNumber(num) {
    while (num > 9) {
        // マスターナンバー（11, 22, 33）はそのまま返す
        if (num === 11 || num === 22 || num === 33) {
            return num;
        }
        // 各桁を足す
        num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

/**
 * ライフパスナンバーを計算
 * @param {string} year - 年
 * @param {string} month - 月
 * @param {string} day - 日
 * @returns {number} ライフパスナンバー
 */
function calculateLifePath(year, month, day) {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    // 年、月、日をそれぞれ還元
    const reducedYear = reduceNumber(yearNum);
    const reducedMonth = reduceNumber(monthNum);
    const reducedDay = reduceNumber(dayNum);

    // 合計して還元
    const sum = reducedYear + reducedMonth + reducedDay;
    return reduceNumber(sum);
}

/**
 * ディスティニーナンバーを計算
 * @param {string} name - フルネーム
 * @returns {number} ディスティニーナンバー
 */
function calculateDestiny(name) {
    const sum = nameToNumber(name, 'all');
    return reduceNumber(sum);
}

/**
 * ソウルナンバーを計算
 * @param {string} name - フルネーム
 * @returns {number} ソウルナンバー
 */
function calculateSoul(name) {
    const sum = nameToNumber(name, 'vowels');
    return reduceNumber(sum);
}

/**
 * パーソナリティナンバーを計算
 * @param {string} name - フルネーム
 * @returns {number} パーソナリティナンバー
 */
function calculatePersonality(name) {
    const sum = nameToNumber(name, 'consonants');
    return reduceNumber(sum);
}

/**
 * バースデーナンバーを計算
 * @param {string} day - 誕生日の日
 * @returns {number} バースデーナンバー
 */
function calculateBirthday(day) {
    const dayNum = parseInt(day);
    return reduceNumber(dayNum);
}

/**
 * マチュリティーナンバーを計算
 * @param {number} lifePath - ライフパスナンバー
 * @param {number} destiny - ディスティニーナンバー
 * @returns {number} マチュリティーナンバー
 */
function calculateMaturity(lifePath, destiny) {
    const sum = lifePath + destiny;
    return reduceNumber(sum);
}

/**
 * 数秘術の計算処理
 */
function calculateNumerology(year, month, day, name) {
    console.log('計算開始:', { year, month, day, name });

    // 各ナンバーを計算
    const lifePath = calculateLifePath(year, month, day);
    const destiny = calculateDestiny(name);
    const soul = calculateSoul(name);
    const personality = calculatePersonality(name);
    const birthday = calculateBirthday(day);
    const maturity = calculateMaturity(lifePath, destiny);

    // 結果オブジェクトを作成
    const results = {
        lifePath: lifePath,
        destiny: destiny,
        soul: soul,
        personality: personality,
        birthday: birthday,
        maturity: maturity
    };

    console.log('計算結果:', results);

    // 結果を保持
    cachedResults = results;

    // 結果を表示
    displayResults(results);

    // 結果セクションを表示
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'block';

    // スムーズスクロール
    setTimeout(() => {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

/**
 * 表示モードを切り替える
 * @param {string} mode - 'brief' または 'detail'
 */
function switchDisplayMode(mode) {
    currentDisplayMode = mode;

    // ボタンのアクティブ状態を切り替え
    const briefModeBtn = document.getElementById('briefModeBtn');
    const detailModeBtn = document.getElementById('detailModeBtn');

    if (mode === 'brief') {
        briefModeBtn.classList.add('active');
        detailModeBtn.classList.remove('active');
    } else {
        briefModeBtn.classList.remove('active');
        detailModeBtn.classList.add('active');
    }

    // 結果を再表示
    if (cachedResults) {
        displayResults(cachedResults);
    }
}

/**
 * 結果を表示
 * @param {Object} results - 計算結果
 */
function displayResults(results) {
    const resultGrid = document.getElementById('resultGrid');
    resultGrid.innerHTML = '';

    // 各ナンバーのカードを作成
    const numberTypes = ['lifePath', 'destiny', 'soul', 'personality', 'birthday', 'maturity'];

    numberTypes.forEach(type => {
        const number = results[type];
        const card = createResultCard(type, number);
        resultGrid.appendChild(card);
    });
}

/**
 * 結果カードを作成
 * @param {string} type - ナンバータイプ
 * @param {number} number - 数値
 * @returns {HTMLElement} カード要素
 */
function createResultCard(type, number) {
    const card = document.createElement('div');
    card.className = 'result-card';

    // ナンバータイプの情報を取得
    const typeInfo = NUMBER_TYPE_DESCRIPTIONS[type];

    // キーワードを取得
    const keywords = NUMBER_KEYWORDS[number];

    // 表示モードに応じて解説を取得
    let cardBodyHTML;
    if (currentDisplayMode === 'brief') {
        // 一言解説モード（シンプル）
        const briefData = NUMBER_BRIEF_DESCRIPTIONS[type][number];
        cardBodyHTML = `
            <div class="card-body">
                <div class="card-brief-keyword">
                    ${briefData.keyword}
                </div>
                <p class="card-description">
                    ${briefData.description}
                </p>
            </div>
        `;
    } else {
        // 詳細解説モード（充実）
        const numberData = NUMBER_DESCRIPTIONS[type][number];
        cardBodyHTML = `
            <div class="card-body">
                <div class="card-keywords">
                    <strong>キーワード:</strong> ${keywords}
                </div>
                <p class="card-description">
                    ${numberData.description}<br><br>
                    💡 ${numberData.advice}
                </p>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="card-header">
            <div class="card-header-content">
                <h3 class="card-title">${typeInfo.title}<br><span style="font-size: 0.8em; opacity: 0.9;">${typeInfo.titleEn}</span></h3>
                <p class="card-meaning">${typeInfo.meaning}</p>
            </div>
            <div class="card-number">${number}</div>
        </div>
        ${cardBodyHTML}
    `;

    return card;
}
