import { ChevronLeft, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const FAQ_ITEMS = [
  {
    question: "ポモドーロタイマーとは何ですか？",
    answer: "ポモドーロタイマーは、25分の作業と5分の休憩を交互に行う時間管理手法です。集中力を維持しながら効率的に作業を進めることができます。"
  },
  {
    question: "タイマーの時間は変更できますか？",
    answer: "はい、設定画面から作業時間と休憩時間を自由にカスタマイズすることができます。"
  },
  {
    question: "音楽の種類は増えますか？",
    answer: "定期的にアップデートで新しい音楽を追加していく予定です。現在は環境音を中心に複数の選択肢をご用意しています。"
  }
];

export const FAQ = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <header className="flex items-center mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">よくあるご質問</h1>
          </div>
        </header>

        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;
