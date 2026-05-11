# 숫자 놀이터

5살 아이가 iPad에서 1부터 10까지 숫자를 익힐 수 있도록 만든 React 숫자게임입니다.

## 기능

- 숫자 찾기: 음성을 듣고 맞는 숫자 카드를 선택합니다.
- 몇 개일까: 그림 개수를 세고 숫자를 고릅니다.
- 차례차례: 1부터 순서대로 숫자를 누릅니다.
- 카드 기억하기: 같은 숫자 카드 짝을 찾아 제거합니다.
- 꾸미기 상점: 코인으로 옷, 모자, 소품, 방 배경을 사고 장착합니다.
- 오늘의 선물: 하루 한 번 코인을 받을 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

## 배포

이 저장소를 GitHub에 올린 뒤 Settings > Pages에서 Source를 `GitHub Actions`로 설정하세요.
`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드하고 GitHub Pages에 배포합니다.
