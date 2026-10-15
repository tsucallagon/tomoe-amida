巴戦 あみだくじ（無料・オフライン対応）

【ファイル】
- index.html：画面
- app.js：抽選・アニメーションの処理
- manifest.webmanifest：ホーム画面追加用の設定
- sw.js：オフライン用キャッシュ
- icon.svg / icon-192.png / icon-512.png：アプリアイコン

【無料で公開する方法：GitHub Pages】
1. https://github.com/ で無料アカウントを作る／ログインする。
2. 右上の「＋」→「New repository」を選ぶ。
3. Repository name に tomoe-amidakuji と入力。
4. Public を選び、Create repository を押す。
5. 「Add file」→「Upload files」を押す。
6. このZIPを解凍し、中にある5ファイルをアップロードする（ZIP自体ではなくファイルをアップロード）。
7. Commit changes を押す。
8. リポジトリの Settings → Pages を開く。
9. Build and deployment の Source を「Deploy from a branch」にする。
10. Branch を「main」、フォルダを「/(root)」にして Save。
11. 1〜数分待つ。Pages画面に表示される公開URLを開く。
   URLの形式は https://ユーザー名.github.io/tomoe-amidakuji/ です。
   ※ユーザー名は自分のGitHubユーザー名に置き換えます。

【Androidに追加】
1. AndroidのChromeで公開URLを開く。
2. 一度、ページが最後まで表示されるまで待つ（オフライン用ファイルの保存）。
3. Chrome右上の「︙」を押す。
4. 「アプリをインストール」または「ホーム画面に追加」を選ぶ。
5. ホーム画面に追加されたアイコンから起動する。

【オフライン確認】
1. オンライン状態でアプリを開き、抽選を1回実行する。
2. アプリを閉じる。
3. 機内モードにする。
4. ホーム画面のアイコンから開いて、抽選が動くか確認する。
初回アクセス前のオフライン利用はできません。最初にオンラインで読み込んでください。

【注意】
- GitHub Pagesの公開ページはURLを知っている人がアクセスできます。チーム名など公開したくない情報は入力しないでください。
- チーム名や抽選履歴はサーバーに保存しない設計です。入力中の名前はページを再読み込みすると初期値に戻ります。
- 抽選結果はあみだくじの横線で決まります。やり直すと新しいあみだくじを生成します。
- これはWebアプリ（PWA）で、APK形式のネイティブAndroidアプリではありません。
