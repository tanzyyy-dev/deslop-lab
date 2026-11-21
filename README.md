# DeSlop Lab

AIが作ったWebサイトを、AIとの対話で一段ずつ改善していく。その過程を、実物・実際のプロンプト・修正理由とともにたどれるWebデザイン教材です。

題材は、架空のAIアイドル「宵越ミラ」の公式サイトです。キャラクターの設定も、最初のデザインも、AIが自由に決めました。

名前は、STEP1 で AI が付けた「天音ルミ」でした。既存の作品やクリエイターと重なるため、STEP 3-4 で人間のレビュアーの判断により改名しました。STEP1〜3-3 の成果物と記録は、当時の名前のまま残しています。

- **STEP1**: 最低限の要件だけを渡して、AI（Claude Haiku 5.5）に初期制作を任せた。改善実験であることは伝えていない
- **STEP2**: 統括エージェント（Claude Opus 5.5）が「AI Slop」を調査し、観点ごとに改善を指示した。実装は Claude Haiku 5.5 が担当した
- **STEP3**: 人間によるレビューと仕上げ。レビュアーの指摘、AIへの修正指示、結果も同じ形式で記録している

公開URL: https://tanzyyy-dev.github.io/deslop-lab/

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
| `docs/process/step2-summary.md` | STEP2 の最終評価、観察、残存課題 |
| `data/steps.js` | `records/` から生成したビューア用データ（手で編集しない） |
| `tools/` | データ生成、ローカルサーバー、スクリーンショット、動作確認、画像生成のスクリプト |

ステップ番号の対応:

| フォルダ | ステップ | 改善テーマ |
|---|---|---|
| `step-01` | STEP 1 | AIによる初期制作（出発点） |
| `step-02` | STEP 2-1 | 情報設計：ファンが確かめたいことを先に |
| `step-03` | STEP 2-2 | コピー：誰のサイトでもない言葉を、ルミの言葉に |
| `step-04` | STEP 2-3 | タイポグラフィ：書体に役割を持たせる |
| `step-05` | STEP 2-4 | 色と装飾：ネオンを消して、色に役割を |
| `step-06` | STEP 2-5 | レイアウト：同じ箱の反復をやめ、内容に合う形に |
| `step-07` | STEP 2-6 | 画像：同じキャラクター、同じ夜で揃える |
| `step-08` | STEP 2-7 | アクセシビリティと仕上げ |
| `step-09` | STEP 3-1 | 人間のレビュー①：実機での改行、先頭へ戻る動作、OGP |
| `step-10` | STEP 3-2 | 人間のレビュー②：楽曲の試聴プレーヤー |
| `step-11` | STEP 3-3 | 人間のレビュー③：意味のある動きで、華やかさと可愛らしさを |
| `step-12` | STEP 3-4 | 人間のレビュー④：改名と、全画面サイズの総点検 |

STEP2 の計画は `docs/process/step2-plan.md`、全体の振り返りと残存課題は `docs/process/step2-summary.md` にあります。

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
- 「前のステップと比較」で、直前のステップと並べて表示します（スクロール位置も連動します。`file://` で開いた場合は連動しません）
- 右側（スマホでは下側）のタブで、「概要」「プロンプト」「変更内容」「記録」を切り替えます。プロンプトは「コピー」ボタンでコピーできます。「記録」には、意図どおりにならなかった点と再指示、AIからの完了報告の原文があります
- URL の `#step-03` のようなハッシュで、特定のステップを直接開けます

## 開発用コマンド

```sh
npm install                 # Playwright と axe-core（スクリーンショット・動作確認・監査に使用）
npx playwright install chromium   # または PW_CHANNEL=chrome でインストール済みの Chrome を使用

npm run build               # records/ から data/steps.js を生成
npm run shots -- step-05    # 指定したステップのスクリーンショットを3画面幅で撮影（省略時は全ステップ）
npm run check               # ビューアの動作確認（スライダー、キーボード、タブ、コピー、比較表示、3画面幅、/deslop-lab/ 配下での読み込み）
node tools/audit.mjs step-12 # axe-core（WCAG 2.2 A/AA）によるアクセシビリティ監査
node tools/sweep.mjs step-12 # 実機に多い17の画面サイズで、横はみ出しとヒーローの重なりを計測
```

ステップを追加するときは、`steps/step-XX/` に成果物をコピーで保存し、`records/step-XX/meta.json` と実際のプロンプトを書いてから `npm run build` を実行します。過去のステップのフォルダは編集しません（変更していないことは `git log -- steps/step-XX` で確かめられます）。

画像の WebP 変換（`tools/optimize-images.py`）には Python の Pillow を使います。画像生成（`tools/gen-image.sh`）には、ChatGPT アカウントでログインした Codex CLI を使います（内蔵の画像生成機能。追加の API 課金は不要）。

## 使用した AI

| 役割 | モデル / ツール |
|---|---|
| 統括（調査・設計・指示・レビュー・記録） | Claude Opus 5.5 |
| 実装（STEP1 の初期制作、STEP2 の各改善） | Claude Haiku 5.5（サブエージェント） |
| 画像生成 | Codex CLI 0.163.0 内蔵の画像生成 |

## 記録の取り扱い

- 記録（`records/`）は、AIに渡したプロンプトとAIの報告を原文のまま保存しています
- 例外として、公開リポジトリにローカル環境の情報を載せないため、ローカルの絶対パスだけを次のプレースホルダーに置き換えています（STEP 3-1 でレビュアーの指示により実施。`records/step-09/meta.json` に記録）
  - `<リポジトリ>` … このリポジトリを置いたローカルのフォルダ
  - `<作業用一時フォルダ>` … 統括エージェントのセッション用の一時フォルダ（STEP1 の制作は、リポジトリの外のこのフォルダで行った）
- `npm run check` は、追跡中のファイルにローカルの絶対パスが含まれていないことも確認します

## ライセンス / License

- **ソースコード / Source code:** [MIT License](LICENSE) — ソフトウェア実装の改変・再利用・商用利用が可能です。
- **作品コンテンツ・素材 / Content and assets:** [利用条件 / Content and Asset Usage Terms](CONTENT_LICENSE.md) — キャラクター、画像、楽曲等はMITの対象外で、素材の無断利用は認めません。

出典を明記した作品紹介・レビュー用のスクリーンショット掲載、および教材のプロンプトの学習・再利用は認めています。詳しくは上記の利用条件を参照してください。

The software implementation is available under the MIT License. Characters, images, music, and other creative content are excluded from MIT. Attributed screenshots for project reviews or introductions and reuse of educational prompts are permitted as described in the Content and Asset Usage Terms.

## 権利について

- サイトに登場するキャラクター、人物・団体・地名・イベントはすべて架空のものです
- 画像はすべて Codex CLI で新たに生成したものです。STEP1 のステージ画像には、別のキャラクターに見える人物が写っていました。そのため STEP 2-1 で削除しました（記録は `records/step-02/`）
- フォントは Google Fonts の SIL Open Font License の書体を使っています
- 楽曲（`assets/*.mp3`、`steps/step-10/audio/`）は、レビュアー（リポジトリの管理者）が用意した音源です。各ステップのフォルダを独立させるため、STEP 3-2 のフォルダにはコピーを置いています
