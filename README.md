# DeSlop Lab

AIが作ったWebサイトを、AIとの対話で一段ずつ改善していく。その過程を、実物・実際のプロンプト・修正理由とともにたどれるWebデザイン教材です。

題材は、架空のAIアイドル「天音ルミ」の公式サイトです。キャラクターの設定も、最初のデザインも、AIが自由に決めました。

- **STEP1**: 最低限の要件だけを渡して、AI（Claude Haiku 5.5）に初期制作を任せた。改善実験であることは伝えていない
- **STEP2**: 統括エージェント（Claude Opus 5.5）が「AI Slop」を調査し、観点ごとに改善を指示した。実装は Claude Haiku 5.5 が担当した
- **STEP3**: 人間によるレビューと仕上げ（予定）

教材のページでは、スライダーで各ステップの実物を切り替えて表示できます。あわせて、改善テーマ、修正理由、AIに渡した実際のプロンプト（コピー可）、変更内容、意図どおりにならなかった点の記録を読めます。

## フォルダ構成

| パス | 内容 |
|---|---|
| `index.html`, `assets/` | 教材のビューア（素の HTML/CSS/JS、ビルド不要） |
| `steps/step-XX/` | 各ステップで実際に作られたサイト。ステップごとに独立したコピーなので、後のステップの修正が過去のステップに影響しない |
| `records/step-XX/` | 各ステップの記録。`meta.json`（テーマ・理由・変更・結果・再指示）、`prompt.md`（AIに渡した実際のプロンプト）、`agent-report.md`（実装エージェントの完了報告の原文） |
| `screenshots/step-XX/` | 各ステップのページ全体のスクリーンショット（スマホ 390px／タブレット 820px／PC 1366px） |
| `docs/research/ai-slop.md` | AI Slop の調査メモ、参照元、判定チェックリスト |
| `docs/process/step2-plan.md` | STEP2 の改善計画とデザイン方針 |
| `data/steps.js` | `records/` から生成したビューア用データ（手で編集しない） |
| `tools/` | データ生成、ローカルサーバー、スクリーンショット、動作確認、画像生成のスクリプト |

ステップ番号の対応: `step-01` = STEP1、`step-02`〜 = STEP 2-1〜。

画像素材は、各ステップの `steps/step-XX/images/` に置いています。生成に使ったプロンプトは、同じフォルダの `*.prompt.md` にあります。

## 動作確認の手順

必要なもの: Node.js 18 以上。

```sh
git clone https://github.com/tanzyyy-dev/deslop-lab.git
cd deslop-lab
npm run serve
# → http://localhost:4173/deslop-lab/ を開く
```

`npm run serve` は依存パッケージなしで動く静的サーバーです。GitHub Pages のプロジェクトサイトと同じく、`/deslop-lab/` 配下で配信します。`index.html` をブラウザで直接開いても動作します（`file://`）。

### 教材の操作
- スライダーをドラッグするか、目盛りのステップ名を押して切り替えます。キーボードではスライダー上で ← → / Home / End、ページ上で ← → を使います
- 「スマホ／タブレット／PC」で、プレビューの画面幅を切り替えます。「単独で開く」で、そのステップのサイトを新しいタブで開けます
- 右側（スマホでは下側）のタブで、「概要」「プロンプト」「変更内容」「記録」を切り替えます。プロンプトは「コピー」ボタンでコピーできます
- URL の `#step-03` のようなハッシュで、特定のステップを直接開けます

## 開発用コマンド

```sh
npm install                 # Playwright（スクリーンショットと動作確認に使用）
npx playwright install chromium   # または PW_CHANNEL=chrome でインストール済みの Chrome を使用

npm run build               # records/ から data/steps.js を生成
npm run shots -- step-05    # 指定したステップのスクリーンショットを3画面幅で撮影（省略時は全ステップ）
npm run check               # ビューアの動作確認（スライダー、キーボード、タブ、コピー、3画面幅、/deslop-lab/ 配下での読み込み）
```

画像生成（`tools/gen-image.sh`）には、ChatGPT アカウントでログインした Codex CLI を使います（内蔵の画像生成機能。追加の API 課金は不要）。

## 使用した AI

| 役割 | モデル / ツール |
|---|---|
| 統括（調査・設計・指示・レビュー・記録） | Claude Opus 5.5 |
| 実装（STEP1 の初期制作、STEP2 の各改善） | Claude Haiku 5.5（サブエージェント） |
| 画像生成 | Codex CLI 0.163.0 内蔵の画像生成 |

## 権利について

- 天音ルミと、サイトに登場する人物・団体・地名・イベントはすべて架空のものです
- 画像はすべて Codex CLI で新たに生成したものです。STEP1 のステージ画像には、別のキャラクターに見える人物が写っていました。そのため STEP 2-1 で削除しました（記録は `records/step-02/`）
- フォントは Google Fonts の SIL Open Font License の書体を使っています
