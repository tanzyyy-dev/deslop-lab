# AI Slop 調査メモ（Webデザイン）

- 調査日: 2026-11-21
- 調査担当: Claude Opus 5.5（統括エージェント）。Web検索（WebSearch）とページ取得（web-fetch サブエージェント）を使用
- 位置づけ: STEP2 で改善観点を抽出するための下調べ。結論はチェックリスト（後半）にまとめる

> 注意: 「AI Slop」に権威ある定義はない。以下の多くは実務家のブログやツールのドキュメントで、研究論文ではない。本プロジェクトでは
> **「誰かが選んだ表現ではなく、誰も選ばなかった既定値（デフォルト）が残っている状態」** を AI Slop の作業定義とする。
> 特定の色・装飾を一律に禁止するのではなく、サイトの目的と文脈に照らして「選ばれたものか、流れで出てきたものか」で判断する。

## 1. 参照元と要点

### 1-1. Anthropic「Prompting for frontend aesthetics」（Claude Cookbook, 2025-10-21, Prithvi Rajasekaran）
https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics

- モデルは明示的に促されない限り「安全な選択」に落ち着く（"defaults to safe choices unless explicitly encouraged otherwise"）。
- 典型例: Inter / Roboto / Arial / システムフォント、白背景に紫グラデーション（"Clichéd color schemes (particularly purple gradients on white backgrounds)"）、予測可能なレイアウト。
- 対策: タイポグラフィ・色・モーション・背景を個別に指示する。ウェイトやサイズは大胆にコントラストをつける（"Size jumps of 3x+, not 1.5x"）。支配色＋鋭いアクセント（"Dominant colors with sharp accents outperform timid, evenly-distributed palettes."）。モーションはページ読み込み時の一度の演出に集中させる。

### 1-2. Anthropic「Improving frontend design through Skills」（Claude Blog, 2025-11-12）
https://claude.com/blog/improving-frontend-design-through-skills

- 原因を「分布の収束（distributional convergence）」と説明。"Safe design choices–those that work universally and offend no one–dominate web training data."
- 結果として AI 製の UI は "immediately recognizable—and dismissible" になる。
- 対策: テーマ（世界観）を先に決め、それを実装可能なコードに落とし込む。

### 1-3. pixelslop「AI Slop Pattern Catalog」（npm pixelslop@0.3.8）
https://cdn.jsdelivr.net/npm/pixelslop@0.3.8/dist/skill/resources/ai-slop-patterns.md

- 26 の視覚パターンを重大度つきで列挙。主なもの: グラデーション文字、グラスモーフィズムの多用、暗背景＋発光アクセント、紫→青グラデーション、巨大な数値（hero metric）、同一カードの繰り返し、カードの入れ子、角丸8–20px＋影の一律適用、全要素の中央揃え、見出しごとのアイコン、すべてのボタンがプライマリ、余白の値が均一、画像ホバーで一律 scale(1.05)、`transition-all`、「Get Started」「Learn More」の反復。
- 判定の核心: "Did a human make this choice, or did the AI fall back to a default?" / "Defaults are slop. Choices are design."
- 誤検知への注意も明記（ダークモードや汎用フォントが正当な場面はある）。

### 1-4. Built In「The New Skeuomorphism: How AI Makes Bad Design Look Good Enough」（Tanya Donska, 2026-06-11）
https://builtin.com/articles/ai-design-slop-era

- 「技術的には正しい」が誰の視点もないデザインが、レビューを素通りしてしまう問題。"It looks like everything, approximately."
- 具体的な対象ユーザーと視点（point of view）を持つことを主張。

### 1-5. Capital & Compute「How to Fix AI Slop in Web Design, Tell by Tell」（2026-09-25）
https://capitalandcompute.net/blog/fix-ai-slop-design/

- 第一波の兆候: 汎用フォント、紫/藍→青グラデ（見出し文字にも）、中央ヒーロー＋ピル型バッジ＋2ボタン＋3カード、rounded-2xl＋薄い影、ガラス風ぼかし、全要素で同じフェードアップ、カウントアップする数字、中身のないコピー、捏造された数値。
- 第二波（既定値を禁止すると次の既定値に移るだけ）: クリーム＋テラコッタの「上品な編集風」、黒＋蛍光色、英大文字の小見出し、01/02/03 の番号、全リンクに矢印。
- "Swapping one font or one colour does not work on its own" — 一箇所の差し替えでは解決しない。方向性（4–6色の役割つきパレット、1–2書体、レイアウトの構想）を先に決める。
- 引用されている原則: "a tell is evidence of a default nobody chose, never proof that a model made the page."

### 1-6. Kosta Canatselis「Spot the Slop」（HEY World, 2026-07-23）
https://world.hey.com/kostac/spot-the-slop-a-ui-designer-s-guide-to-fixing-ai-defaults-4c448c9c

- "Slop is design with no author." / "It's competent. It just doesn't come from anywhere."
- 見落とされがちな点: 空状態・読み込み・エラー状態の欠落、全部を一度に見せる（段階的開示がない）、余白・角丸・カード高さの均一さ、中身のない見出しコピー。
- 対策: 書体を先に変える、色を意味（役割）で使う、コピーを「本人の声」で書き直す、均一さを意図的に崩す。

### 1-7. Alan West「Why Every AI-Built Website Looks the Same (Blame Tailwind's Indigo-500)」（DEV Community, 2026）
https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p

- 「平均的なランディングページ」: Inter、白背景、角丸0.5rem、薄い影、3列アイコングリッド、ヒーローのグラデ文字、紫のCTA。
- "The AI isn't designing. It's averaging." / "It just needs constraints." — 具体的な制約（色コード、書体名、レイアウト）を与える。

### 1-8. アクセシビリティ（品質の土台として参照）
- W3C WCAG 2.2 — 1.4.3 コントラスト（最低限）: 通常文字 4.5:1、大きな文字 3:1  https://www.w3.org/TR/WCAG22/#contrast-minimum
- W3C WCAG 2.2 — 2.3.3 Animation from Interactions / `prefers-reduced-motion`  https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- W3C WCAG 2.2 — 2.4.7 フォーカスの可視化  https://www.w3.org/TR/WCAG22/#focus-visible
- W3C WCAG 2.2 — 2.5.8 ターゲットサイズ（最低限 24×24 CSS px）  https://www.w3.org/TR/WCAG22/#target-size-minimum

### 1-9. アイドル/アーティスト公式サイトの文脈
- Web幹事「アーティストサイトのデザイン」 https://web-kanji.com/posts/artist-site-design — 公式サイトは SNS で流れてしまう情報を集約する拠点。プロフィール中心の基本型、ファンクラブ・物販と一体化した複合型などがある。
- Web担当者Forum（2017） https://webtan.impress.co.jp/u/2017/10/24/27222 — 映像や写真を主役にし、他の要素を抑える事例。
- アイドル特化の情報設計の資料は見つからなかった。以下は統括エージェントの判断:
  - ファンが繰り返し訪れて確かめたいのは「次のライブ/配信はいつか」「新曲」「最新のお知らせ」。訴求コピーより**日付つきの具体的な情報**が中心になる。
  - ピンク、きらめき、丸みのある書体などは、アイドルというジャンルでは**正当に選ばれうる表現**。SaaS 向けの「紫グラデ禁止」をそのまま当てはめない。問題は、それが「このキャラクター固有の世界観」から選ばれているかどうか。

## 2. 共通して挙がる兆候（出典の重なり）

| 兆候 | 主な出典 |
|---|---|
| 汎用フォント（Inter/Roboto/システム既定）、書体に意図がない | 1-1, 1-2, 1-3, 1-5, 1-6, 1-7 |
| 紫/藍→青（ピンク）のグラデーション、グラデーション文字 | 1-1, 1-3, 1-5, 1-6, 1-7 |
| 同一カードの反復・入れ子、角丸＋薄い影の一律適用 | 1-3, 1-5, 1-6, 1-7 |
| 中央ヒーロー＋2ボタン＋3つのアイコンカード という定型構成 | 1-3, 1-4, 1-5, 1-7 |
| すべてに同じフェードアップ/バウンス、ホバーで一律拡大 | 1-1, 1-3, 1-5, 1-6 |
| 中身のない・誰の声でもないコピー、捏造された数値 | 1-4, 1-5, 1-6 |
| 空状態/エラー/フォーカスなど「状態」の欠落 | 1-4, 1-6 |
| 余白・角丸の値が均一でリズムがない | 1-3, 1-6 |
| 絵文字アイコン、見出しごとのアイコン | 1-3（＋検索結果に多数） |

## 3. DeSlop Lab での判定チェックリスト

STEP1 の成果物はこのリストに照らして評価し、該当したものを STEP2 の改善観点にまとめる。各項目は「既定値のまま残っていないか」を問う。

- **C1 コンセプト**: キャラクター固有の世界観があり、デザイン判断がそこから導かれているか。名前を差し替えれば別のアイドルのサイトとして通用してしまわないか。
- **C2 情報設計**: ファンが求める情報（次の予定、新曲、お知らせ）が優先されているか。定型セクションの羅列になっていないか。
- **C3 コピー**: 本人/運営の具体的な声か。抽象的な美辞麗句、意味のない英語、捏造された実績数値がないか。
- **C4 タイポグラフィ**: 書体・ウェイト・サイズに意図とコントラストがあるか。日本語の組版（行間・字間・改行）が整っているか。
- **C5 色**: 役割を持った限られたパレットか。グラデーションや発光が「どこにでも」使われていないか。コントラストは WCAG を満たすか。
- **C6 レイアウトとリズム**: 同一カードの反復・中央揃えの連続を避け、余白に強弱があるか。
- **C7 装飾とモーション**: 絵文字・きらめき・ホバー拡大・フェードインが一律に付いていないか。`prefers-reduced-motion` に配慮しているか。
- **C8 画像**: キャラクターの外見が一貫しているか。画像が情報として働いているか（飾りの置き場になっていないか）。
- **C9 インタラクションとアクセシビリティ**: キーボード操作、フォーカス表示、タッチターゲット、代替テキスト、状態表示。
- **C10 仕上げ**: 細部（日付表記、リンク先、フッター、メタ情報、favicon、ダミーリンク）の詰め。
