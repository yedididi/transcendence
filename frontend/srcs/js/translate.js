export class translate {
  constructor(lang) {
    this.initTranslation(lang);
    i18next.init(
      {
        lng: lang,
        debug: true,
        resources: {
          en: {
            translation: {
              languageSwitcher: "English",
              loginTitle: "Pong Game",
              login42: "42 Login",

              otpTitle: "OTP check",
              otpFirstLine: "1. Press the 'Get Code' button to send a 6-digit number code to your intra email.",
              otpSecondLine: "2. Please enter the number code you received.",
              otpThirdLine: "3. It can be retransmitted again 60 seconds after receiving the code.",
              otpSend: "Get Code",
              otpCheck: "Submit",
              otpInput: "Enter",

              "chat-message-input": "Please enter a message",
              "chat-message-submit": "Enter",
              normal: "1vs1 matching",
              tournament: "tournament",
              remotePlay: "remote play",
              userConfig: "Modify member information",
              logout: "logout",
              user1: "user1",
              user2: "user2",
              user3: "user3",
              user4: "user4",
              gameStart: "start pingpong",
              matchingStatement: "You're being matched...please wait...",
              "cancle-remote": "cancel match",

              tournamentTitle: "tournament",

              nextGame: "next Game",

              userConfigTitle: "user settings",
              otpSetting: "use OTP",
              saveButton: "save",

              normalGameResultTitle: "Game Result",
              normalGameResultWinner: "Winner",
              "return-to-main": "back to main",

              tournamentResult: "tournament result",
              roundOneTitle: "round 1",
              roundOneWinner: "round 1 winner",
              roundTwoTitle: "round 2",
              roundTwoWinner: "round 2 winner",
              finalRoundTitle: "final round result",
              finalRoundWinner: "final winner",
            },
          },
          ko: {
            translation: {
              languageSwitcher: "한국어",
              loginTitle: "퐁 게임",
              login42: "42 로그인",

              otpTitle: "OTP 체크",
              otpFirstLine: "1. '코드받기' 버튼을 누르면 인트라 이메일로 6자리 숫자 코드가 발송됩니다.",
              otpSecondLine: "2. 전송받은 숫자 코드를 입력해주세요.",
              otpThirdLine: "3. 코드를 전송받고 60초후에 다시 재전송이 가능합니다.",
              otpSend: "코드 받기",
              otpCheck: "확인",
              otpInput: "입력하세요",

              "chat-message-input": "메시지를 입력하세요",
              "chat-message-submit": "보내기",
              normal: "1대1 매칭",
              tournament: "토너먼트",
              remotePlay: "원격 매칭",
              userConfig: "회원정보 수정",
              logout: "로그아웃",
              user1: "유저1",
              user2: "유저2",
              user3: "유저3",
              user4: "유저4",
              gameStart: "핑퐁 시작",
              matchingStatement: "매칭 중입니다. 잠시만 기다려주세요...",
              "cancle-remote": "대기 취소",

              tournamentTitle: "토너먼트",

              userConfigTitle: "유저 설정",
              otpSetting: "otp 사용",
              saveButton: "저장",

              normalGameResultTitle: "게임 결과",
              normalGameResultWinner: "승자",
              "return-to-main": "돌아가기",

              tournamentResult: "토너먼트 결과",
              roundOneTitle: "1 라운드",
              roundOneWinner: "1 라운드 승자",
              roundTwoTitle: "2 라운드",
              roundTwoWinner: "2 라운드 승자",
              finalRoundTitle: "마지막 라운드 결과",
              finalRoundWinner: "최종 승자",
            },
          },
          fr: {
            translation: {
              languageSwitcher: "français",
              loginTitle: "Jeu de pong",
              login42: "42 Ouverture de session",

              otpTitle: "Vérification OTP",
              otpFirstLine:
                "1. Appuyez sur le bouton « Obtenir un code » pour envoyer un code à six chiffres à votre courriel intra.",
              otpSecondLine: "2. Veuillez entrer le code de numéro que vous avez reçu.",
              otpThirdLine: "3. Il peut être retransmis 60 secondes après avoir reçu le code.",
              otpSend: "Obtenir le code",
              otpCheck: "Soumettre",
              otpInput: "Entrez",

              "chat-message-input": "Veuillez entrer un message.",
              "chat-message-submit": "Entrez",
              normal: "1vs1 correspondance",
              tournament: "tournoi",
              remotePlay: "jeu à distance",
              userConfig: "Modifier les renseignements sur les membres",
              logout: "se déconnecter",
              user1: "utilisateur1",
              user2: "utilisateur2",
              user3: "utilisateur3",
              user4: "utilisateur4",
              gameStart: "démarrer le ping-pong",
              matchingStatement: "On vous compare...S'il vous plaît, attendez...",
              "cancle-remote": "annuler le match",

              tournamentTitle: "tournoi",

              nextGame: "Prochain match",

              userConfigTitle: "Paramètres de l' utilisateur",
              otpSetting: "utiliser le OTP",
              saveButton: "Sauvegarder",

              normalGameResultTitle: "Résultat du jeu",
              normalGameResultWinner: "Gagnant",
              "return-to-main": "Retour à la case départ",

              tournamentResult: "résultat du tournoi",
              roundOneTitle: "1er round",
              roundOneWinner: "Premier round gagnant",
              roundTwoTitle: "Deuxième round",
              roundTwoWinner: "2e round gagnant",
              finalRoundTitle: "Résultat final du round",
              finalRoundWinner: "vainqueur final",
            },
          },
        },
      },
      (err, t) => {
        if (err) {
          console.error("Error initializing i18next:", err);
        } else {
          this.updateContent(); // Ensure initial content rendering
        }
      }
    );
  }
  initTranslation(lang) {
    console.log("input lang is:" + lang);
    if (!(lang === "ko" || lang === "en" || lang === "fr")) lang = "ko";
  }

  updateContent(page) {
    if (page === "login") {
      document.getElementById("loginTitle").innerText = i18next.t("loginTitle");
      document.getElementById("login42").innerText = i18next.t("login42");
    } else if (page === "otpBefore") {
      document.getElementById("otpTitle").innerText = i18next.t("otpTitle");
      document.getElementById("otpFirstLine").innerText = i18next.t("otpFirstLine");
      document.getElementById("otpSecondLine").innerText = i18next.t("otpSecondLine");
      document.getElementById("otpThirdLine").innerText = i18next.t("otpThirdLine");
      document.getElementById("otpSend").innerText = i18next.t("otpSend");
    } else if (page === "otpAfter") {
      document.getElementById("otpTitle").innerText = i18next.t("otpTitle");
      document.getElementById("otpFirstLine").innerText = i18next.t("otpFirstLine");
      document.getElementById("otpSecondLine").innerText = i18next.t("otpSecondLine");
      document.getElementById("otpThirdLine").innerText = i18next.t("otpThirdLine");
      document.getElementById("otpCheck").innerText = i18next.t("otpCheck");
      document.getElementById("otpInput").placeholder = i18next.t("otpInput");
    } else if (page === "main") {
      document.getElementById("chat-message-input").placeholder = i18next.t("chat-message-input");
      document.getElementById("chat-message-submit").innerText = i18next.t("chat-message-submit");
      document.getElementById("normal").innerText = i18next.t("normal");
      document.getElementById("tournament").innerText = i18next.t("tournament");
      document.getElementById("remotePlay").innerText = i18next.t("remotePlay");
      document.getElementById("userConfig").innerText = i18next.t("userConfig");
      document.getElementById("logout").innerText = i18next.t("logout");
      document.getElementById("matchingStatement").innerText = i18next.t("matchingStatement");
      document.getElementById("cancle-remote").innerText = i18next.t("cancle-remote");
    } else if (page === "mainNormal") {
      document.getElementById("chat-message-input").placeholder = i18next.t("chat-message-input");
      document.getElementById("chat-message-submit").innerText = i18next.t("chat-message-submit");
      document.getElementById("user1").innerText = i18next.t("user1");
      document.getElementById("user2").innerText = i18next.t("user2");
      document.getElementById("gameStart").innerText = i18next.t("gameStart");
    } else if (page === "mainTournament") {
      document.getElementById("tournamentTitle").innerText = i18next.t("tournamentTitle");
      document.getElementById("chat-message-input").placeholder = i18next.t("chat-message-input");
      document.getElementById("chat-message-submit").innerText = i18next.t("chat-message-submit");
      document.getElementById("user1").innerText = i18next.t("user1");
      document.getElementById("user2").innerText = i18next.t("user2");
      document.getElementById("user3").innerText = i18next.t("user1");
      document.getElementById("user4").innerText = i18next.t("user2");
      document.getElementById("gameStart").innerText = i18next.t("gameStart");
    } else if (page === "normalGameMode") {
      document.getElementById("chat-message-input").placeholder = i18next.t("chat-message-input");
      document.getElementById("chat-message-submit").innerText = i18next.t("chat-message-submit");
    } else if (page === "tournamentGameMode") {
      document.getElementById("chat-message-input").placeholder = i18next.t("chat-message-input");
      document.getElementById("chat-message-submit").innerText = i18next.t("chat-message-submit");
    } else if (page === "userConfig") {
      document.getElementById("chat-message-input").placeholder = i18next.t("chat-message-input");
      document.getElementById("chat-message-submit").innerText = i18next.t("chat-message-submit");
      document.getElementById("userConfigTitle").innerText = i18next.t("userConfigTitle");
      document.getElementById("otpSetting").innerText = i18next.t("otpSetting");
      document.getElementById("saveButton").innerText = i18next.t("saveButton");
    } else if (page === "normalGameResult") {
      document.getElementById("chat-message-input").placeholder = i18next.t("chat-message-input");
      document.getElementById("chat-message-submit").innerText = i18next.t("chat-message-submit");
      document.getElementById("normalGameResultTitle").innerText = i18next.t("normalGameResultTitle");
      document.getElementById("normalGameResultWinner").innerText = i18next.t("normalGameResultWinner");
      document.getElementById("return-to-main").innerText = i18next.t("return-to-main");
    } else if (page === "tournamentGameResult") {
      document.getElementById("chat-message-input").placeholder = i18next.t("chat-message-input");
      document.getElementById("chat-message-submit").innerText = i18next.t("chat-message-submit");
      document.getElementById("tournamentResult").innerText = i18next.t("tournamentResult");
      document.getElementById("roundOneTitle").innerText = i18next.t("roundOneTitle");
      document.getElementById("roundOneWinner").innerText = i18next.t("roundOneWinner");
      document.getElementById("roundTwoTitle").innerText = i18next.t("roundTwoTitle");
      document.getElementById("roundTwoWinner").innerText = i18next.t("roundTwoWinner");
      document.getElementById("finalRoundTitle").innerText = i18next.t("finalRoundTitle");
      document.getElementById("finalRoundWinner").innerText = i18next.t("finalRoundWinner");
      document.getElementById("roundOneTitle").innerText = i18next.t("roundOneTitle");
      document.getElementById("return-to-main").innerText = i18next.t("return-to-main");
    }

    document.querySelectorAll("#languageSwitcher option").forEach((option) => {
      if (option.value === "ko") {
        option.textContent = i18next.t("languageSwitcher", { lng: "ko" });
      } else if (option.value === "en") {
        option.textContent = i18next.t("languageSwitcher", { lng: "en" });
      } else if (option.value === "fr") {
        option.textContent = i18next.t("languageSwitcher", { lng: "fr" });
      }
    });
  }
  changeLanguage(lang, page) {
    i18next.changeLanguage(lang, (err, t) => {
      if (err) {
        console.error("Error changing language:", err);
      } else {
        const languageSwitcher = document.getElementById("languageSwitcher");
        if (languageSwitcher) {
          languageSwitcher.value = i18next.language;
        }
        this.updateContent(page);
      }
    });
  }
}
