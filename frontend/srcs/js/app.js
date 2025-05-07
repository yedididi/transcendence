import { Router } from "./router.js";
import { checkAccessToken } from "./utils/token.js";

async function initialRouting() {
  const router = new Router();
  try {
    const hasValidToken = await checkAccessToken();

    if (!hasValidToken) {
      if (location.pathname === "/afterLogin") {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          alert(window.router.getTranslatedText(globalState.language, "wrongApproach"));
        } else {
          const bc = new BroadcastChannel("myChannel");
          bc.postMessage({ type: "codeSaved", code: code }, "https://pingpong.42.kr");
        }
        window.close();
        return;
      } else {
        history.replaceState({ save: globalState }, null, "/login");
        router.navigateToCurrentPath();
      }
    } else {
      globalState.intraID = localStorage.getItem("intraId");
      globalState.normal.player0 = localStorage.getItem("intraId");
      globalState.tournament.player0 = localStorage.getItem("intraId");
      if (window.location.pathname === "/") {
        setGlobalStatePageName("main");
        router.navigateTo("/main");
      } else {
        router.navigateToCurrentPath();
      }
    }
  } catch (error) {
    console.error("Error checking access token:", error);
  }
}

window.addEventListener("DOMContentLoaded", initialRouting);
