あなたは静的Webサイトの改善を担当します。

対象ディレクトリ: /Users/ttan/dev/deslop-lab/steps/step-07
このディレクトリ内のファイルだけを編集してください。ほかのディレクトリ（steps/step-01〜06、records/ など）は絶対に変更しないでください（records/ からは読み取りだけ行います）。

これは架空のAIアイドル「天音ルミ」の公式サイトです。今回の改善テーマは「画像」です。色、書体、文章、レイアウトの構成は変えないでください。

## 背景
- ヒーロー画像（images/hero.png）は、STEP1 で作られたネオンの都市の画像です。その後、サイトは「夜更かしの周波数」（深夜ラジオ、星空、静かな部屋の灯り）というコンセプトで、色も書体も静かな方向へ整えてきました。そのため、画面の半分以上を占めるこの画像だけが、強く浮いています。
- 楽曲のジャケットとグッズの画像は、空の仮の面のままです。
- 画像はすべて約2MBの PNG で、表示サイズに対して大きすぎます。

統括エージェントが、Codex CLI の画像生成で、同じキャラクター（STEP1 のプロフィール画像を参照画像として添付）・同じ世界観の画像8枚を生成しました。原本と生成プロンプトは次の場所にあります（読み取り専用）。
/Users/ttan/dev/deslop-lab/records/step-07/generated/
- hero.png（1672×941。深夜、窓辺のデスクでラジオのマイクに話しかけるルミ。画像の左3分の1は暗い壁）
- jacket-lumina.png（プラネタリウムの床に寝転び、星座を見上げるルミ）
- jacket-midnight-signal.png（深夜、ヘッドホンをしてマイクに寄りかかるルミ。手前にラジオのダイヤル）
- jacket-lumen-drop.png（ラムネ色の夕焼けの空の下、ラムネの瓶を掲げるルミ）
- goods-acrylic.png / goods-penlight.png / goods-tee.png / goods-card.png（グッズの商品写真）

## 作業
1. 画像の変換
   次のコマンドで、原本を WebP に変換し、steps/step-07/images/ に保存してください（リポジトリのルート /Users/ttan/dev/deslop-lab で実行）。
   ```
   python3 tools/optimize-images.py <原本.png> <出力.webp> <最大幅> 80
   ```
   - hero.png → images/hero-night.webp（最大幅 1600）
   - jacket-*.png → images/jacket-lumina.webp / jacket-midnight-signal.webp / jacket-lumen-drop.webp（最大幅 800）
   - goods-*.png → images/goods-acrylic.webp / goods-penlight.webp / goods-tee.webp / goods-card.webp（最大幅 600）
   - STEP1 のプロフィール画像 steps/step-07/images/profile.png → images/profile.webp（最大幅 900）。この画像は内容を変えず、形式とサイズだけ変える
   各 WebP の隣に、原本の生成記録をコピーしてください（例: records/step-07/generated/hero.prompt.md → images/hero-night.prompt.md）。profile.prompt.md はすでにあるので、そのまま残します。
   変換後、使わなくなった steps/step-07/images/hero.png、hero.prompt.md、profile.png を削除してください（STEP1〜2-5 の各フォルダには元の画像が残っています）。

2. HTML への組み込み
   - ヒーロー: img の src を images/hero-night.webp にします。ルミは画像の右半分にいるので、object-position を調整し、PC幅でもスマホ幅（4:3 の切り抜き）でも顔が切れないようにしてください。PC幅の左側の暗い幕は、新しい画像の左側がもともと暗いため、弱めてかまいません。ただし、文字の読みやすさは保ってください。
   - 楽曲: 各作品の仮の面（div.jacket と中の番号）を img 要素に置き換えます。番号（01〜03）は削除します。
   - グッズ: 各商品の仮の面（div.goods-img）を img 要素に置き換えます。
   - プロフィール: src を images/profile.webp にします。
   - すべての img に width と height（WebP の実寸）を指定してください（レイアウトのずれを防ぐため）。表示位置が画面の下の方の画像には loading="lazy" と decoding="async" を付けます。ヒーロー画像には付けず、fetchpriority="high" を付けます。
   - 代替テキスト（alt）は、画像が伝える内容を日本語で具体的に書いてください。
     - ヒーロー: 「深夜、窓辺のデスクでラジオのマイクに話しかける天音ルミ」
     - ジャケット: 「アルバム『LUMINA』のジャケット。プラネタリウムの床に寝転び、星座を見上げるルミ」のように、作品名と絵の内容を書く
     - グッズ: 商品名と見た目（例: 「ルミ公式ペンライト。淡いラムネ色に光る細身のペンライト」）
     - プロフィール: 「天音ルミの肖像。銀色がかった薄紫の長い髪に、ラムネ色の差し色」
   - 不要になった .jacket / .goods-img の背景・枠・番号のスタイルは削除し、img が正方形で表示されるようにしてください（aspect-ratio: 1; object-fit: cover; 角丸 2px）。
   - onerror="this.classList.add('is-missing')" は、すべての img に付けたままにしてかまいません。

## 完了条件
- すべての画像が表示されること（パスの誤りがないこと）。HTML の構造が正しいこと。
- steps/step-07/images/ に PNG が残っていないこと。images フォルダの合計サイズを報告すること。
- 最後に、変更点の一覧と、迷った点・意図どおりにできなかった点を報告してください。
