# 作業手順

## 作業開始

作業を行う際、以下の手順に沿って進めて下さい。

① 作業をする issue を確認し、issue の番号を記憶する。

② ターミナルから作業ディレクトリに移動し、以下のコマンドからリモートレポジトリの変更点と同期する。

```bash
git pull origin main
```

③ 現在のブランチを確認する。

```bash
git branch
```

case1 現在のブランチが main の場合
これから作業するブランチが無い場合は新しくブランチを作成する。

```bash
git checkout -b issue/番号
```

作業するブランチがある場合はそのブランチに移動する。

```bash
git checkout issue/番号
```

case2 現在のブランチが issue/番号の場合
issue の番号がこれから作業する issue の番号と同じ場合、そのブランチで作業する。違う場合、これから作業するブランチに移動し、手順 ② をやり直す。

## 作業終了

① ターミナルから変更点を確認する。

```bash
git status
```

変更を行ったファイル名が赤文字で表示される。

② add を行う。

```bash
git add .
```

add を行った後に再び`git status`を行うと赤文字が緑の文字に変更する。

③ Linter Formatter を起動する。

```bash
npm run lint
```

④ commit を行う。

```bash
git commit -m "コメント"
```

ダブルクオーテーション内のコメントは任意だが、どのような作業をしたのか分かるような簡潔なコメントを記述して欲しい。

⑤ リモートブランチに push する。

```bash
git push origin issue/番号
```

このコマンドを実行するとリモートレポジトリに新しいリモートブランチが作成される。

⑥ プルリクを作成する。
github のリモートレポジトリに行き、Pull requests タブをクリックする。
**New**ボタンを押し、作業の更新を行ったリモートブランチを選択したのち、**Create pull request**ボタンを押す。
プルリクのコメントには作業内容を記載する。
**Create pull request**ボタンを押した後、**Reviewers**に yukihito を選択し、**Development**に作業 issue を選択する。
