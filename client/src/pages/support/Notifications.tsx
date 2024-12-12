import { ChevronLeft, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

// ダミーデータ
const NOTIFICATIONS = [
  {
    id: 1,
    date: "2024-12-05",
    title: "新機能追加のお知らせ",
    content: "トレーナーモードが追加されました。様々なトレーニングスタイルをお試しください。"
  },
  {
    id: 2,
    date: "2024-12-03",
    title: "システムメンテナンスのお知らせ",
    content: "12月10日午前2時から4時まで、システムメンテナンスを実施いたします。"
  },
  {
    id: 3,
    date: "2024-12-01",
    title: "アップデート完了のお知らせ",
    content: "パフォーマンスの改善と細かな不具合の修正を行いました。"
  }
];

export const Notifications = () => {
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
            <Bell className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">お知らせ</h1>
          </div>
        </header>

        <div className="space-y-4">
          {NOTIFICATIONS.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {notification.date}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold">
                    {notification.title}
                  </h2>
                  <p className="text-gray-600">
                    {notification.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
