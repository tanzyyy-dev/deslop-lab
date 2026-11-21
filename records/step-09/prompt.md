あなたは静的Webサイトの改善を担当します。

対象ディレクトリ: <リポジトリ>/steps/step-09
このディレクトリ内のファイルだけを編集してください。ほかのディレクトリ（steps/step-01〜08、records/ など）は絶対に変更しないでください。

これは架空のAIアイドル「天音ルミ」の公式サイトです。STEP3 では、人間のレビュアーから受けた指摘をもとに修正します。今回の修正は、次の3点です。それ以外の見た目・文章は変えないでください。

## 1. スマホ実機でキャッチコピーがきれいに改行されない
### レビュアーの指摘
スマホの実機では、キャッチコピー「夜更かししているあなたに、今夜も一曲。」が、PC のようにきれいに改行されていない。

### 原因（統括エージェントの調査）
見出しの改行は、CSS の `word-break: auto-phrase`（文節単位で改行する指定）に頼っていました。これは Chrome 119 以降だけが対応している機能で、iPhone の Safari（WebKit）や Firefox は対応していません。そのため、これらのブラウザでは文節に関係なく1文字単位で折り返されます。

### 修正
- `word-break: auto-phrase` に頼らず、どのブラウザでも文節で改行されるようにしてください。キャッチコピーは、3つの文節「夜更かししている」「あなたに、」「今夜も一曲。」をそれぞれ `<span class="phrase">` で囲み、`.phrase { display: inline-block; }` にします。文節の途中では改行されず、文節の間でだけ改行されます。
- 同じ方法を、スマホ幅で2行以上になる可能性がある次の見出しにも適用してください。
  - ファンレターのセクション見出し「ファンレター・おたより」→「ファンレター・」「おたより」
  - スケジュールの予定名「ラジオ番組「ルミの夜更かし電波」」→「ラジオ番組」「「ルミの夜更かし電波」」
- `word-break: auto-phrase` の指定は残してかまいません（対応しているブラウザでは、ほかの見出しにも効くため）。

## 2. ロゴと「ページの先頭へ」をクリックしても何も起きない
### レビュアーの指摘
ページ下部の「ページの先頭へ」と、左上のロゴをクリックしたときの動作を適正化してほしい。

### 原因（統括エージェントの調査）
どちらのリンクも `href="#top"` で、`id="top"` は `position: fixed` のヘッダーに付いています。固定配置の要素は常に画面内にあるため、ブラウザはスクロールする必要がないと判断します。その結果、クリックしても URL に `#top` が付くだけで、ページは動きません（Chrome で、ページ下部から「ページの先頭へ」を押しても scrollY が変わらないことを確認済み）。

### 修正
- ヘッダーの `id="top"` を削除してください。
- body の最初の要素として、スクロールの目印を置いてください: `<span id="top" tabindex="-1"></span>`（スキップリンクより前）。見た目に影響しないようにします。
- js/main.js に、ロゴと「ページの先頭へ」のクリック処理を追加してください。
  - ページの先頭へスクロールする。`prefers-reduced-motion: reduce` のときはアニメーションなし、それ以外はなめらかに
  - フォーカスを `#top` の目印に移す（`focus({ preventScroll: true })`）。キーボードの利用者が、次に Tab を押したときにページの先頭（スキップリンク）から操作を再開できるようにするため
  - URL に `#top` を残さない（`history.replaceState` でハッシュを消す）。ほかのセクションのハッシュが付いていた場合も消す
  - スマホ幅でメニューが開いているときにロゴを押した場合は、メニューも閉じる
  - JavaScript が動かない環境でも、リンクとして先頭に戻れること（`href="#top"` はそのまま残す。目印が先頭にあるので、JS なしでもスクロールする）
- ロゴの aria-label「トップへ戻る」は「天音ルミ 公式サイト トップへ」に変えてください（どこへ戻るのかを明確にするため）。

## 3. OGP を公開 URL に合わせる
公開 URL は https://tanzyyy-dev.github.io/deslop-lab/ に決まりました。このステップのサイトは https://tanzyyy-dev.github.io/deslop-lab/steps/step-09/ で公開されます。
- SNS のクローラーが確実に読めるよう、共有用の画像を JPEG（1200×630）で作ってください。リポジトリのルート（<リポジトリ>）で次のコマンドを実行します。
  ```
  python3 -c "from PIL import Image; im=Image.open('steps/step-09/images/hero-night.webp').convert('RGB'); w,h=im.size; t=630/1200; ch=int(w*t); top=max(0,(h-ch)//2); im.crop((0,top,w,top+ch)).resize((1200,630), Image.LANCZOS).save('steps/step-09/images/og-image.jpg', quality=85)"
  ```
- og:image を絶対 URL `https://tanzyyy-dev.github.io/deslop-lab/steps/step-09/images/og-image.jpg` にし、og:image:width=1200、og:image:height=630、og:image:alt を追加してください。
- og:url（`https://tanzyyy-dev.github.io/deslop-lab/steps/step-09/`）と、`<link rel="canonical">`（同じ URL）を追加してください。
- `<meta name="twitter:card" content="summary_large_image">` を追加してください。

## 完了条件
- HTML の構造が正しく、JavaScript のエラーがないこと。
- 最後に、変更点の一覧と、迷った点・意図どおりにできなかった点を報告してください。統括エージェントが、Chrome と WebKit（iPhone の Safari 相当）の両方で確認します。
