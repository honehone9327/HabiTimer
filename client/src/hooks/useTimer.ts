import { useState, useEffect, useCallback } from 'react';

// 名言リスト
const motivationalQuotes = [
  "集中力を保ち、決して諦めない。",
  "限界はあなたの想像力だけ。",
  "自分を追い込んで、他の誰にも頼らない。",
  "偉大なものは快適ゾーンから生まれない。",
  "夢を見て、願い、実行する。",
  "前向きに、努力し、実現させる。",
  "疲れたときに止まるのではなく、終わったときに止まる。",
  "何かのために一生懸命働けば、達成したときの喜びも大きい。",
  "もっと大きな夢を。もっと大きなことを。",
  "チャンスを待つのではなく、作り出す。",
];

const useTimer = () => {
  const [motivationalQuote, setMotivationalQuote] = useState("");

  // 名言の初期設定
  useEffect(() => {
    setMotivationalQuote(getRandomQuote());
  }, []);

  // ランダムな名言の取得
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  };

  return {
    motivationalQuote,
    getRandomQuote,
  };
};

export default useTimer;
