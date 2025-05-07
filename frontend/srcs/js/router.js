import { loginView } from "./views/loginView.js";
import { otpView } from "./views/otpView.js";
import { mainView } from "./views/mainView.js";
import { checkAccessToken } from "./utils/token.js";
import { translate } from "./translate.js";
import {
  makeChatWindow,
  makeLoginWindow,
  makeOTPWindow,
  makeMainWindow,
  makeNormalGameWindow,
  makeTournamentGameWindow,
  makeRemoteGameWindow,
  makeConfingWindow,
} from "./render.js";

export class Router {
  constructor() {
    this.routes = [
      { path: "/main", view: mainView },
      { path: "/login", view: loginView },
    ];

    this.bc = new BroadcastChannel("myChannel");
    this.navigateToCurrentPath = this.navigateToCurrentPath.bind(this);
    this.renderView = this.renderView.bind(this);
    this.translateInstance = new translate(globalState.language);

    window.router = this;
    window.chatSocket = null;
    window.gameSocket = null;
    window.eventSource = null;
    window.lastClickTime = Date.now();
    window.clickDelay = 500;

    window.addEventListener("popstate", async (e) => {
      if (!localStorage.getItem("accessToken")) {
        window.location.href = "/";
        return;
      }
      Object.assign(globalState, e.state.save);
      if (
        window.gameSocket &&
        window.gameSocket instanceof WebSocket &&
        window.gameSocket.readyState === WebSocket.OPEN
      ) {
        try {
          window.gameSocket.close();
        } catch (error) {
          console.error("Error closing WebSocket:", error);
        }
      }
      if (
        window.eventSource &&
        window.eventSource instanceof EventSource &&
        window.eventSource.readyState === EventSource.OPEN
      ) {
        window.eventSource.close();
        try {
          await checkAccessToken();
          const token = localStorage.getItem("accessToken");
          fetch("pingpong/remoteCancle/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }).catch((error) => {
            console.error("Error fetching token and data:", error);
          });
        } catch (error) {
          console.error("Error closing eventSource:", error);
        }
      }
      this.navigateToCurrentPath();
    });

    window.addEventListener("beforeunload", () => {
      history.replaceState({ save: globalState }, null, window.location.pathname);
    });

    window.addEventListener("load", (e) => {
      const state = window.history.state;
      if (state && state.save) {
        Object.assign(globalState, state.save);
      }
      globalState.language = sessionStorage.getItem("language");
      if (globalState.language == NULL)
        globalState.language = "ko";
      const languageSwitcher = document.getElementById("languageSwitcher");
      if (languageSwitcher) {
        languageSwitcher.value = globalState.language;
      }
    });

    document.body.addEventListener("click", (e) => {
      if (e.target.matches("[data-link")) {
        const currentTime = Date.now();
        if (currentTime - document.lastClickTime < globalState.clickDelay) {
          return;
        }
        globalState.lastClickTime = currentTime;
      }
    });
  }

  getTranslatedText(language, originalText) {
    if (originalText === "score") {
      if (language === "en") return "score";
      else if (language === "ko") return "득점";
      else if (language === "fr") return "marque";
    } else if (originalText === "win") {
      if (language === "en") return "win";
      else if (language === "ko") return "승리";
      else if (language === "fr") return "victoire";
    } else if (originalText === "nextGame") {
      if (language === "en") return "next game";
      else if (language === "ko") return "다음 게임";
      else if (language === "fr") return "Prochain match";
    } else if (originalText === "tryAgianLater") {
      if (language === "en") return "Try Agian Later";
      else if (language === "ko") return "잠시 후 다시 시도해주세요";
      else if (language === "fr") return "Veuillez réessayer dans un instant.";
    } else if (originalText === "getOTPCodeFirst") {
      if (language === "en") return "Get OTP code first";
      else if (language === "ko") return "먼저 OTP 코드를 받으세요";
      else if (language === "fr") return "Vous devez d'abord recevoir le code OTP.";
    } else if (originalText === "OTPCodeIsSixLetters") {
      if (language === "en") return "OTP Code Is Six Letters";
      else if (language === "ko") return "OTP 코드는 6자리 숫자입니다";
      else if (language === "fr") return "Le code OTP est composé de 6 chiffres.";
    } else if (originalText === "wrongOTPCode") {
      if (language === "en") return "Wrong OTP code";
      else if (language === "ko") return "잘못된 OTP 코드입니다. 다시 입력해주세요.";
      else if (language === "fr") return "Code OTP non valable. Entrez à nouveau.";
    } else if (originalText === "userNameTooLong") {
      if (language === "en") return "user name is too long";
      else if (language === "ko") return "유저 이름이 너무 깁니다";
      else if (language === "fr") return "Nom d'utilisateur trop long";
    } else if (originalText === "canNotGetUserSetting") {
      if (language === "en") return "cannot get user setting";
      else if (language === "ko") return "유저 설정 불러오기 에러";
      else if (language === "fr") return "Erreur lors du chargement de la configuration de l' utilisateur";
    } else if (originalText === "invalidToken") {
      if (language === "en") return "Invalid access token";
      else if (language === "ko") return "유효하지 않은 엑세스 토큰입니다";
      else if (language === "fr") return "Le jeton d'accès n'est pas valide";
    }
  }

  navigateToCurrentPath() {
    let match = this.findMatch();
    if (!match) {
      const viewContainer = document.getElementById("content");
      viewContainer.innerHTML = "";
      viewContainer.insertAdjacentHTML(
        "afterbegin",
        `<class="h3 fw-bold" style="text-align:center;">404 NOT FOUND</h1>`
      );
      return;
    }
    this.renderView(match.route.view);
  }

  navigateTo(url) {
    if (location.pathname !== "/otp") {
      history.pushState({ save: globalState }, null, url);
    } else {
      history.replaceState({ save: globalState }, null, url);
    }
    this.navigateToCurrentPath();
  }

  findMatch() {
    return this.routes
      .map((route) => ({
        route: route,
        isMatch: location.pathname === route.path,
      }))
      .find((potentialMatch) => potentialMatch.isMatch);
  }

  async renderView(view) {
    const viewContainer = document.getElementById("content");
    if (view != mainView) {
      viewContainer.innerHTML = "";
      viewContainer.insertAdjacentHTML("afterbegin", view.getHtml());
    } else if (view == mainView && !document.getElementById("chatWindow")) {
      viewContainer.innerHTML = "";
      viewContainer.insertAdjacentHTML("afterbegin", view.getHtml());
      makeChatWindow();
    }

    if (view == loginView) {
      makeLoginWindow();
    } else if (view == otpView) {
      makeOTPWindow();
    } else if (view == mainView) {
      let mainWindow = document.getElementById("mainWindow");
      if (globalState.gameMode === null) {
        makeMainWindow(mainWindow);
      } else if (globalState.gameMode == "normal") {
        makeNormalGameWindow(mainWindow);
      } else if (globalState.gameMode == "tournament") {
        makeTournamentGameWindow(mainWindow);
      } else if (globalState.gameMode == "remote") {
        makeRemoteGameWindow(mainWindow);
      } else if (globalState.gameMode == "config") {
        makeConfingWindow(mainWindow);
      }
    }

    const sessionLanguage = sessionStorage.getItem("language");
    if (sessionLanguage) {
      globalState.language = sessionLanguage;
    }
    window.router.translateInstance.changeLanguage(globalState.language, globalState.pageName);
    const languageSwitcher = document.getElementById("languageSwitcher");
    if (languageSwitcher) {
      languageSwitcher.addEventListener("change", function () {
        globalState.language = this.value;
        sessionStorage.setItem("language", this.value);
        window.router.translateInstance.changeLanguage(globalState.language, globalState.pageName); // Change language dynamically
      });
    } else {
      console.error("languageSwitcher element not found");
    }
  }
}
