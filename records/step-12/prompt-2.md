（再指示）steps/step-12 を17の画面サイズで撮影・計測しました。改名と見た目の調整は、意図どおりにできています。
- 横スクロールは、全サイズでありません。
- ヒーローでは、タブレットの縦・横とも、画像と文字が分かれました。顔と文字の列の間は、最も狭い 1200×800 でも約79px あります。
- 演出と試聴プレーヤーも、引き続き正しく動いています。

1点だけ直してください。対象は引き続き steps/step-12 だけです。

index.html の canonical、og:url、og:image が、STEP 3-1 のフォルダ（steps/step-09/）を指したままです。このフォルダは steps/step-12/ として公開されるので、3つとも steps/step-12/ を指すようにしてください。
- canonical と og:url: https://tanzyyy-dev.github.io/deslop-lab/steps/step-12/
- og:image: https://tanzyyy-dev.github.io/deslop-lab/steps/step-12/images/og-image.jpg（images/og-image.jpg は、このフォルダにすでにあります）

localStorage のキー "lumi-effects" は、画面に表示されないため、今回は残してかまいません。修正後、変更内容を報告してください。
