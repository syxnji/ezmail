# EZMail - メール要約ウェブサービス

EZMailは、メールの内容を要約し、適切なアクションを提案するウェブサービスです。Next.jsを使用して構築されています。

## サービス概要

ユーザーがメール全文をテキストエリアにペーストして送信すると、AIが要約と可能なアクションを表示します。

## 主な機能

### 1. メール入力画面
- テキストエリアにメール全文をペースト
- 送信ボタンでフォームを送信

### 2. 要約結果画面
- メールの要約を表示
- 新しいメールを要約するためのリセットボタン

### 3. アクション提案
タブで切り替え可能な3つのアクション：
- **返信の作成**: 適切な返信文を自動生成
- **位置情報へのルート検索**: メール内の住所への経路を検索
- **カレンダーへの追加**: イベント情報をカレンダーに追加

各アクションには実行ボタンが表示されます。

## 実装進捗

### 基本機能
- [x] メール入力フォームの作成
- [x] メール要約APIの実装
- [x] 要約結果の表示画面
- [x] リセット機能

### UI/UX
- [x] レスポンシブデザイン
- [x] ローディング状態の表示
- [x] エラーハンドリング
- [x] 入力バリデーション

### アクション機能
- [ ] タブ切り替えコンポーネント
- [ ] 返信文生成機能
- [ ] 位置情報・ルート検索機能
- [ ] カレンダー追加機能

### API連携
- [x] メール要約AI API連携
- [ ] 返信文生成API連携
- [ ] 地図API連携（Google Maps等）
- [ ] カレンダーAPI連携

### セキュリティ・パフォーマンス
- [ ] 入力データの暗号化
- [ ] レート制限の実装
- [ ] キャッシュ機能
- [ ] ログ機能

### テスト・デプロイ
- [ ] ユニットテストの作成
- [ ] 統合テストの作成
- [ ] 本番環境デプロイ設定
- [ ] CI/CDパイプライン構築

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
