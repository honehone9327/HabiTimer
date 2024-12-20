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
  "今日という日は、昨日の自分を超えるためにある。",
  "一歩を踏み出すたび、未知の自分が顔を出す。",
  "集中とは、心の雑音を静め、目標に光を当てること。",
  "小さな積み重ねが、やがて崩れない自信となる。",
  "止まらない意思は、いずれ揺るぎない力へと育つ。",
  "目標は遠くても、足元を見失わなければ必ず近づく。",
  "困難は、真の強さを引き出す隠された鍵だ。",
  "今できる最善を尽くせば、未来が自然と整う。",
  "集中する瞬間、世界はあなたの味方になる。",
  "汗を流した分だけ、心の内側が澄んでいく。",
  "意志の炎は、行動によってしか燃え上がらない。",
  "目的を定めたら、あとは進み続けるのみ。",
  "微かな前進も、止まらなければ偉業となる。",
  "誰も見ていなくても、自分は自分を見ている。",
  "挑戦を恐れるな、その先には未知の実りがある。",
  "心を研ぎ澄ませば、一瞬一瞬が宝石のように光る。",
  "歩みは遅くても、確かな軌跡は必ず残る。",
  "努力は裏切らない。それは自分への最高の投資だ。",
  "立ち止まることなく進む者に、限界という壁は薄い。",
  "理想は雲の上、だが踏み出す足は常に地に着いている。",
  "迷いを断ち切るのは、行動という名の刀である。",
  "小さな勝利を積めば、大きな達成へとつながる。",
  "目標がある限り、人は常に未完の最高傑作だ。",
  "努力の過程こそが、成功という花を咲かせる根になる。",
  "まばゆい成果は、地道な努力の影に宿る。",
  "挑戦なくして成長なし、成長なくして勝利なし。",
  "集中は、雑念を振り払う勇気に等しい。",
  "今日の前進は、明日への自信を育む。",
  "心の安定は、揺るぎない行動によって築かれる。",
  "諦める理由よりも、続ける理由を強く抱け。",
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
