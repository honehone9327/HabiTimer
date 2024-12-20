import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

export const Privacy = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <header className="flex items-center mb-8">
          <button
            onClick={() => setLocation("/mypage")}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
        </header>

        <Card>
          <CardContent className="p-6 prose prose-sm">
            <p>
              本プライバシーポリシー（以下「本ポリシー」といいます）は、funsunevery（個人事業主名：作田勇次、以下「当事業者」といいます）が提供するHabiTimerPro（以下「本サービス」といいます）において、ユーザーの個人情報および関連データ（以下総称して「個人情報」）をどのように取得、利用、管理、保護するかを定めたものです。ユーザーは、本サービスを利用することで本ポリシーに同意したものとみなします。
            </p>

            <h2>第1条（収集する情報）</h2>
            <p>当事業者は、ユーザーから以下の情報を収集する場合があります。</p>
            <ul>
              <li>
                ユーザー登録時に提供されるメールアドレス、ユーザー名などの基本情報
              </li>
              <li>
                タスク、日記、タイマー利用履歴など、本サービス内でユーザーが記録した情報
              </li>
              <li>
                アプリ利用時のアクセスログ、デバイス情報、Cookie等の技術的情報
              </li>
            </ul>

            <h2>第2条（利用目的）</h2>
            <p>当事業者は、収集した個人情報を以下の目的で利用します。</p>
            <ul>
              <li>本サービスの提供・運営・改善</li>
              <li>
                ユーザーサポート対応（問い合わせ対応、トラブルシューティング）
              </li>
              <li>
                新機能、キャンペーン、アップデート情報等のお知らせ（ユーザーが同意した場合に限る）
              </li>
              <li>利用状況の分析およびサービス改善のための統計データ作成</li>
              <li>法令または規約違反行為に対処するための調査・対応</li>
            </ul>

            <h2>第3条（法令遵守）</h2>
            <p>
              当事業者は、個人情報の保護に関する法令およびガイドライン、その他関連する規範を遵守します。
            </p>

            <h2>第4条（個人情報の保管およびセキュリティ対策）</h2>
            <ul>
              <li>
                当事業者は、ユーザーの個人情報を適切なセキュリティ対策を講じたサーバー上で保管します。
              </li>
              <li>
                不正アクセス、情報漏えい、紛失、改ざんを防止するため、合理的なセキュリティ対策を実施します。
              </li>
            </ul>

            <h2>第5条（第三者提供）</h2>
            <ul>
              <li>
                当事業者は、ユーザーの同意がある場合、または法令上必要な場合を除き、個人情報を第三者に提供することはありません。
              </li>
              <li>
                業務委託に伴い、委託先に個人情報を提供する場合は、適正な契約を締結し、個人情報保護義務を遵守させます。
              </li>
            </ul>

            <h2>第6条（Cookie・トラッキング技術の利用）</h2>
            <p>
              本サービスは、利便性向上や利用状況分析のためにCookieや類似のトラッキング技術を用いる場合があります。ユーザーはブラウザ設定等によりCookieを無効化できますが、その場合、一部機能が利用できない可能性があります。
            </p>

            <h2>第7条（アクセス解析ツールの利用）</h2>
            <p>
              本サービスは、Google Analytics等のアクセス解析ツールを利用する場合があります。これらツールの利用に伴い取得される情報は、当該ツール提供者のプライバシーポリシーに基づき管理されます。
            </p>

            <h2>第8条（個人情報の開示・訂正・削除・利用停止）</h2>
            <p>
              ユーザーは、当事業者が保有する個人情報の開示、訂正、削除、利用停止を希望する場合、当事業者所定の手続きに従い請求できます。請求を受けた場合、当事業者は法令に基づき適切に対応します。
            </p>

            <h2>第9条（未成年者の利用）</h2>
            <p>
              未成年者が本サービスを利用する場合、法定代理人の同意が必要となる場合があります。法定代理人が同意した時点で、当事業者はその利用を未成年者本人が同意したものとみなします。
            </p>

            <h2>第10条（プライバシーポリシーの変更）</h2>
            <ul>
              <li>当事業者は、本ポリシーを随時変更することができます。</li>
              <li>
                本ポリシーを変更する場合、変更後のポリシーを本サービス内で公表します。
              </li>
              <li>
                変更後も本サービスを利用することで、ユーザーは変更後のポリシーに同意したものとみなします。
              </li>
            </ul>

            <h2>第11条（問い合わせ窓口）</h2>
            <p>
              プライバシーに関するお問い合わせは、下記までお願いいたします。
            </p>
            <p>お問い合わせ先メールアドレス：jajajason86@gmail.com</p>

            <p className="mt-8 text-sm text-gray-600">施行日：2024年12月10日</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
