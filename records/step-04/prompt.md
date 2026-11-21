あなたは静的Webサイトの改善を担当します。

対象ディレクトリ: /Users/ttan/dev/deslop-lab/steps/step-04
このディレクトリ内のファイルだけを編集してください。ほかのディレクトリ（steps/step-01〜03 など）は絶対に変更しないでください。

これは架空のAIアイドル「天音ルミ」の公式サイトです。今回の改善テーマは「タイポグラフィ」です。色（グラデーションを含む）・レイアウト・画像・装飾・文章の内容は変えないでください。変更するのは書体、文字サイズ、ウェイト、行間、字間、改行の扱いと、下記で指示した見出し要素の削除だけです。

## 背景
現在はシステムフォント（ヒラギノ等）と Helvetica Neue / Arial だけで組まれています。字間を大きく広げた英字の小見出し（SCHEDULE、NEWS など）が、日本語の見出しと毎回重複しています。見出しと本文のサイズ差も小さく、どこが重要か分かりにくい状態です。
サイトのコンセプトは「夜更かしの周波数」です。深夜ラジオ番組を持ち、星を眺め、曲を自分で作るAIアイドルの、静かで親密な夜をイメージしています。書体はこのコンセプトから選びました。

## 書体（Google Fonts。いずれも SIL Open Font License）
- 見出し・名前: Zen Maru Gothic（ウェイト 500 / 700 / 900）。丸みのある書体で、アイドルの声のやわらかさを表す
- 本文: Zen Kaku Gothic New（400 / 500 / 700）
- 日付・時刻だけ: DotGothic16（400）。ラジオの表示窓のようなドット書体。日付と時刻以外には使わないこと

index.html の head で、次の順に読み込んでください（display=swap）。
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Zen+Maru+Gothic:wght@500;700;900&display=swap">
```
CSS の :root に変数を定義し、すべての font-family をこの3つの変数のどれかに置き換えてください。Webフォントが読み込めなくても読めるように、フォールバックも指定します。
```css
--font-display: "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Sans", sans-serif;
--font-body: "Zen Kaku Gothic New", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
--font-dot: "DotGothic16", "Osaka-Mono", monospace;
```
"Helvetica Neue" と Arial の指定は、すべて削除してください。

## サイズとウェイト（サイズの差をはっきりつける）
- 本文: 16px（1rem）、line-height 1.9、letter-spacing 0.03em、ウェイト 400
- 段落の1行の長さは、最大でも約36文字（max-width: 36em 程度）に抑える。表やリストは除く
- 名前の見出し（h1 の「天音ルミ」）: Zen Maru Gothic 900、font-size: clamp(3.5rem, 11vw, 7.5rem)、line-height 1.1、letter-spacing 0.02em
- 名前の下の「LUMI AMANE」: 本文書体 500、0.875rem、letter-spacing 0.2em（現在より狭める）
- キャッチコピー（.tagline）: Zen Maru Gothic 700、font-size: clamp(1.25rem, 2.6vw, 1.75rem)
- セクション見出し（h2）: Zen Maru Gothic 700、font-size: clamp(1.75rem, 4.5vw, 2.75rem)、line-height 1.3
- 小見出し（h3）: Zen Maru Gothic 700、1.125rem
- 補足・ラベル類: 0.8125rem 以上（それより小さい文字は作らない）
- ナビゲーション: 本文書体 500、0.875rem、letter-spacing 0.06em
- ボタン: 本文書体 700、1rem

## 日付・時刻
スケジュールの日付、ニュースの日付、ヒーローの「次のライブ」の日付、楽曲の発売日に、--font-dot を使ってください。日付と時刻の部分だけを <time> 要素で囲み、そこに書体を当てます（すでに <time> の箇所はそれを使う）。曜日の「（日）」も含めてかまいません。

## 英字の小見出しの削除
各セクションの英字の小見出し（class="section-en" の p 要素。SCHEDULE / NEWS / MUSIC / PROFILE / GOODS / CONTACT）を HTML から削除し、関連する CSS も削除してください。直後の日本語見出しと内容が重複しているためです。
ヒーローの「AIアイドル　LM-01」（.eyebrow）は残しますが、本文書体 500、0.875rem、letter-spacing 0.1em にしてください。

## 日本語の組版
- 見出し（h1, h2, h3, .tagline）には font-feature-settings: "palt"; text-wrap: balance; word-break: auto-phrase; を指定する
- 本文の段落には text-wrap: pretty; line-break: strict; を指定する
- 本文に "palt" は使わない（詰めすぎると読みにくくなるため）
- ニュースの「1st アルバム」を「1stアルバム」にする（ほかの表記と合わせる）

## 完了条件
- HTML の構造が正しいこと。font-family に変数以外の指定（"Helvetica Neue"、Arial、ヒラギノの直接指定など）が残っていないこと（変数の定義部分を除く）。
- 色・グラデーション・余白・レイアウトを変えていないこと。
- 最後に、変更点の一覧と、迷った点・意図どおりにできなかった点を報告してください。
