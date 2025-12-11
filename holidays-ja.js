// holidays-ja.js
// 日本の祝日データ（例：2025年）
// 必要に応じて年や祝日を追加してください。
var JAPANESE_HOLIDAYS = [
  { month: 1, day: 1, name: "元日" },
  { month: 1, day: 13, name: "成人の日" },
  { month: 2, day: 11, name: "建国記念の日" },
  { month: 2, day: 23, name: "天皇誕生日" },
  { month: 3, day: 20, name: "春分の日" },
  { month: 4, day: 29, name: "昭和の日" },
  { month: 5, day: 3, name: "憲法記念日" },
  { month: 5, day: 4, name: "みどりの日" },
  { month: 5, day: 5, name: "こどもの日" },
  { month: 7, day: 21, name: "海の日" },
  { month: 8, day: 11, name: "山の日" },
  { month: 9, day: 15, name: "敬老の日" },
  { month: 9, day: 23, name: "秋分の日" },
  { month: 10, day: 13, name: "スポーツの日" },
  { month: 11, day: 3, name: "文化の日" },
  { month: 11, day: 23, name: "勤労感謝の日" }
];

/**
 * 次の祝日を取得する共通関数
 * @param {Date} baseDate - 基準日。未指定なら今日。
 * @returns {{date: Date, name: string} | null}
 */
function getNextJapaneseHoliday(baseDate) {
  var now = baseDate instanceof Date ? new Date(baseDate.getTime()) : new Date();
  // 時刻を 0:00 にそろえる
  now.setHours(0, 0, 0, 0);
  var year = now.getFullYear();

  // 今年の祝日候補を作る
  var candidates = JAPANESE_HOLIDAYS.map(function (h) {
    return {
      name: h.name,
      date: new Date(year, h.month - 1, h.day)
    };
  });

  // 日付順にソート
  candidates.sort(function (a, b) {
    return a.date - b.date;
  });

  // 今日以降の最初の祝日を探す
  for (var i = 0; i < candidates.length; i++) {
    if (candidates[i].date >= now) {
      return candidates[i];
    }
  }

  // 今年の祝日がすべて過ぎていたら、翌年の元日を返す（簡易実装）
  return {
    name: "元日",
    date: new Date(year + 1, 0, 1)
  };
}
