import { saveChatHistory, loadChatHistory, updateChatHistory, clearChatHistory } from "./utils/chatUtils.js";
import { currentClickCheck } from "./utils/currentClickCheck.js";
import { setGlobalStateIntraId, setGlobalStatePageName } from "./globalState.js";
import { checkAccessToken } from "./utils/token.js";
import { otpView } from "./views/otpView.js";
import { mainView, gameModeSelectView, gamePlayView } from "./views/mainView.js";
import { normalGameNameInputView, normalGameResultView } from "./views/normalGameView.js";
import { tournamentGameNameInputView, tournamentGameResultView } from "./views/tournamentGameView.js";
import { userConfigView } from "./views/userConfigView.js";
import { Pingpong } from "./pingpong.js";
import { resetGlobalState, initGlobalState } from "./globalState.js";
import { keySetting, remoteKeySetting } from "./utils/keySetting.js";

export function makeChatWindow() {
  const chatLog = document.getElementById("chat-log");
  let chatMessages = loadChatHistory();

  chatMessages.forEach((message) => {
    const usernameElement = document.createElement("div");
    usernameElement.classList.add("username");
    usernameElement.textContent = message.username;

    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");
    messageElement.classList.add(message.username === globalState.intraID ? "self" : "other");

    const contentElement = document.createElement("div");
    contentElement.classList.add("message-content");
    contentElement.textContent = message.message;

    messageElement.appendChild(usernameElement);
    messageElement.appendChild(contentElement);
    chatLog.appendChild(messageElement);
  });
  chatLog.scrollTop = chatLog.scrollHeight;

  window.chatSocket = new WebSocket("wss://" + window.location.host + "/ws/chat/");

  window.chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    const chatLog = document.getElementById("chat-log");

    const usernameElement = document.createElement("div");
    usernameElement.classList.add("username");
    usernameElement.textContent = data.username;

    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");
    messageElement.classList.add(data.username === globalState.intraID ? "self" : "other");

    const contentElement = document.createElement("div");
    contentElement.classList.add("message-content");
    contentElement.textContent = data.message;

    messageElement.appendChild(usernameElement);
    messageElement.appendChild(contentElement);
    chatLog.appendChild(messageElement);
    updateChatHistory(data);
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  document.getElementById("chat-message-input").focus();
  document.getElementById("chat-message-input").onkeyup = function (e) {
    if (e.key === "Enter") {
      document.getElementById("chat-message-submit").click();
    }
  };

  document.getElementById("chat-message-submit").onclick = function (e) {
    if (!currentClickCheck()) {
      return;
    }
    const messageInputDom = document.getElementById("chat-message-input");
    const message = messageInputDom.value;
    if (message.length == 0) {
      return;
    }
    window.chatSocket.send(
      JSON.stringify({
        message: message,
        username: globalState.intraID,
      })
    );
    messageInputDom.value = "";
  };
}

export function makeLoginWindow() {
  setGlobalStatePageName("login");

  document.getElementById("login42").onclick = async (e) => {
    if (!currentClickCheck()) {
      return;
    }
    if (await checkAccessToken()) {
      history.replaceState({ save: globalState }, null, "/main");
      window.router.renderView(mainView);
      return;
    }

    window.router.bc.onmessage = (event) => {
      if (event.origin !== "https://pingpong.42.kr" || event.data.type !== "codeSaved") {
        return;
      }
      window.router.bc.onmessage = null;
      const code = event.data.code;
      if (code) {
        fetch(`authenticate/getTokenAndData/?code=${code}`, {
          method: "GET",
        })
          .then(async (response) => {
            if (response.ok) {
              document.getElementById("login42").onclick = null;
              let receivedData = await response.json();
              if (receivedData.otp == true) {
                setGlobalStatePageName("otpBefore");
                history.replaceState({ save: globalState }, null, "/otp");
                window.router.renderView(otpView);
              } else {
                localStorage.setItem("accessToken", receivedData.accessToken);
                localStorage.setItem("intraId", receivedData.intraId);
                setGlobalStateIntraId(receivedData.intraId);
                setGlobalStatePageName("main");
                history.replaceState({ save: globalState }, null, "/main");
                window.router.renderView(mainView);
              }
            } else {
              response.json().then((text) => {
                console.error("Error occurred:", response.status, text.error);
                alert("Error: " + text.error);
              });
            }
          })
          .catch((error) => {
            console.error("Error fetching token and data:", error);
          });
      } else {
        console.error("Authorization code not found in bc message.");
        return;
      }
    };

    const popUp = window.open("https://pingpong.42.kr/authenticate/login", "_blank", "width=600,height=700");
    popUp.focus();
  };
}

export function makeOTPWindow() {
  document.getElementById("otpSend").onclick = async (e) => {
    if (!currentClickCheck()) {
      return;
    }
    const currentTime = Date.now();
    if (currentTime - globalState.lastOtpSentTime < 60000) {
      alert(window.router.getTranslatedText(globalState.language, "tryAgianLater"));
      return;
    }
    try {
      const response = await fetch("authenticate/sendOtpCode/", {
        method: "GET",
      });
      if (response.ok) {
        setGlobalStatePageName("otpAfter");

        const otpSendButton = document.getElementById("otpSend");
        if (otpSendButton) {
          otpSendButton.remove();
        }

        globalState.lastOtpSentTime = currentTime;
        globalState.otpSentCheck = true;

        // 타이머와 입력창, 확인 버튼 생성
        const otpTimerElement = document.createElement("h1");
        otpTimerElement.textContent = "60";
        otpTimerElement.id = "otpTimer";
        otpTimerElement.style.textAlign = "center";
        otpTimerElement.classList.add("h3", "mb-3", "fw-bold");

        const otpInputContainer = document.createElement("div");
        otpInputContainer.classList.add("form-floating");

        const otpInput = document.createElement("input");
        otpInput.type = "text";
        otpInput.id = "otpInput";
        otpInput.placeholder = "Enter";
        otpInput.maxLength = 6;
        otpInput.oninput = function () {
          this.value = this.value.replace(/[^0-9]/g, "");
        };
        otpInputContainer.appendChild(otpInput);

        const otpCheckButton = document.createElement("button");
        otpCheckButton.type = "button";
        otpCheckButton.classList.add("btn", "btn-outline-dark");
        otpCheckButton.id = "otpCheck";
        otpCheckButton.textContent = "확인";

        // <main> 안에 요소 추가
        const mainContainer = document.querySelector("main.form-basic2.m-auto");
        mainContainer.appendChild(otpTimerElement);
        mainContainer.appendChild(otpInputContainer);
        mainContainer.appendChild(otpCheckButton);

        window.router.translateInstance.updateContent(globalState.pageName); // Ensure content is translated on page load

        // 타이머 시작
        let secondsRemaining = 60;
        const otpTimer = setInterval(() => {
          secondsRemaining -= 1;
          if (otpTimerElement) {
            otpTimerElement.textContent = secondsRemaining > 0 ? secondsRemaining : "--";
          }
          if (secondsRemaining <= 0) {
            clearInterval(otpTimer);
            otpTimerElement.textContent = "--";
          }
        }, 1000);

        otpInput.focus();
        otpInput.onkeyup = function (e) {
          if (e.key === "Enter") {
            otpCheckButton.click();
          }
        };

        otpCheckButton.onclick = async () => {
          if (!globalState.otpSentCheck) {
            alert(window.router.getTranslatedText(globalState.language, "getOTPCodeFirst"));
            return;
          }

          if (!currentClickCheck()) {
            return;
          }

          const otpValue = otpInput.value.trim();
          if (otpValue.length !== 6 || !/^\d+$/.test(otpValue)) {
            alert(window.router.getTranslatedText(globalState.language, "OTPCodeIsSixLetters"));
            return;
          }

          try {
            otpCheckButton.disabled = true;

            const response = await fetch(`authenticate/checkOtpCode/?OTP=${otpValue}`, {
              method: "GET",
            });

            if (response.ok) {
              const receivedData = await response.json();

              clearInterval(otpTimer);
              otpTimerElement.textContent = "--";
              globalState.lastOtpSentTime = 0;
              globalState.otpSentCheck = false;

              localStorage.setItem("accessToken", receivedData.accessToken);
              localStorage.setItem("intraId", receivedData.intraId);
              setGlobalStateIntraId(receivedData.intraId);
              setGlobalStatePageName("main");
              window.router.navigateTo("/main");
            } else {
              otpCheckButton.disabled = false;
              response.json().then((text) => {
                console.error("Error occurred:", response.status, text);

                if (response.status === 400) {
                  alert(window.router.getTranslatedText(globalState.language, "wrongOTPCode"));
                } else {
                  alert("Error: " + text.error);
                }
              });
            }
          } catch (error) {
            otpCheckButton.disabled = false;
            console.error("Error: ", error);
          }
        };
      } else {
        response.json().then((text) => {
          console.error("Error occurred:", response.status, text);
          alert("Error: " + text.error);
        });
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };
}

export function makeMainWindow(mainWindow) {
  mainWindow.innerHTML = "";
  mainWindow.className = "form-basic m-auto text-center";
  mainWindow.insertAdjacentHTML("afterbegin", gameModeSelectView.getHtml());

  document.getElementById("normal").onclick = () => {
    if (!currentClickCheck()) {
      return;
    }
    globalState.gameMode = "normal";
    globalState.gameModeStep = 1;
    setGlobalStatePageName("mainNormal");
    window.router.navigateTo("/main");
  };
  document.getElementById("tournament").onclick = () => {
    if (!currentClickCheck()) {
      return;
    }
    globalState.gameMode = "tournament";
    globalState.gameModeStep = 1;
    setGlobalStatePageName("mainTournament");
    window.router.navigateTo("/main");
  };
  document.getElementById("remotePlay").onclick = async () => {
    if (!currentClickCheck()) {
      return;
    }
    var loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"), {
      backdrop: "static",
      keyboard: false,
    });

    await checkAccessToken();
    const token = localStorage.getItem("accessToken");
    fetch("pingpong/remote/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then(async (response) => {
        if (response.ok) {
          const receivedMsg = await response.json();
          if (receivedMsg.game_id) {
            globalState.remote.gameId = receivedMsg.game_id;
            globalState.gameMode = "remote";
            globalState.gameModeStep = 1;
            setGlobalStatePageName("mainRemote");
            window.router.navigateTo("/main");
          } else {
            console.log(receivedMsg.message);
            loadingModal.show();
            window.eventSource = new EventSource("/pingpong/remoteEvents/");

            window.eventSource.onmessage = async function (event) {
              const data = JSON.parse(event.data);
              if (data.game_id) {
                window.eventSource.close();
                window.eventSource = null;
                globalState.remote.gameId = data.game_id;
                globalState.gameMode = "remote";
                globalState.gameModeStep = 1;
                await loadingModal.hide();
                setGlobalStatePageName("mainRemote");
                window.router.navigateTo("/main");
              }
            };
          }
        } else {
          response.json().then((text) => {
            console.error("Error occurred:", response.status, text.error);
            alert("Error: " + text.error);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching token and data:", error);
      });

    document.getElementById("cancle-remote").onclick = async () => {
      await checkAccessToken();
      const token = localStorage.getItem("accessToken");
      fetch("pingpong/remoteCancle/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
        .then((response) => {
          loadingModal.hide();
          if (!response.ok) {
            response.json().then((text) => {
              console.error("Error occurred:", response.status, text.error);
              alert("Error: " + text.error);
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching token and data:", error);
        });
    };
  };
  document.getElementById("userConfig").onclick = () => {
    if (!currentClickCheck()) {
      return;
    }
    globalState.gameMode = "config";
    setGlobalStatePageName("userConfig");
    window.router.navigateTo("/main");
  };
  document.getElementById("logout").onclick = async () => {
    if (!currentClickCheck()) {
      return;
    }
    await checkAccessToken();
    const token = localStorage.getItem("accessToken");
    fetch("authenticate/logout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => {
        if (response.ok) {
          if (
            window.chatSocket &&
            window.chatSocket instanceof WebSocket &&
            window.chatSocket.readyState === WebSocket.OPEN
          ) {
            try {
              window.chatSocket.close();
            } catch (error) {
              console.error("Error closing WebSocket:", error);
            }
          }
          localStorage.clear();
          initGlobalState();
          window.location.href = "https://pingpong.42.kr";
          return;
        } else {
          response.json().then((text) => {
            console.error("Error occurred:", response.status, tex.error);
            alert("Error: " + text.error);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching token and data:", error);
      });
  };
}

export async function makeNormalGameWindow(mainWindow) {
  if (globalState.gameModeStep == 1) {
    mainWindow.innerHTML = "";
    mainWindow.className = "form-basic m-auto text-center";
    mainWindow.insertAdjacentHTML("afterbegin", normalGameNameInputView.getHtml());

    document.getElementById("gameStart").onclick = () => {
      if (!currentClickCheck()) {
        return;
      }
      for (let i = 0; i <= 1; ++i) {
        const aliasInput = document.getElementById(`alias${i}`).value.trim();
        if (aliasInput.length > 20) {
          alert(window.router.getTranslatedText(globalState.language, "userNameTooLong"));
          return;
        }
      }
      for (let i = 0; i <= 1; ++i) {
        const aliasInput = document.getElementById(`alias${i}`).value.trim();
        if (aliasInput !== "") {
          globalState.normal[`player${i}`] = aliasInput;
        }
      }
      globalState.gameModeStep = 2;
      setGlobalStatePageName("normalGameMode");
      window.router.navigateTo("/main");
    };
  } else if (globalState.gameModeStep == 2) {
    mainWindow.innerHTML = "";
    mainWindow.className = "";
    mainWindow.insertAdjacentHTML("afterbegin", gamePlayView.getHtml());

    let gameContainer = document.getElementById("gameContainer");
    gameContainer.className = "form-pingpong";

    const playerLeftName = document.getElementById("playerLeftName");
    const playerRightName = document.getElementById("playerRightName");
    playerLeftName.innerText = globalState.normal.player0;
    playerRightName.innerText = globalState.normal.player1;

    const playerLeftScore = document.getElementById("playerLeftScore");
    const playerRightScore = document.getElementById("playerRightScore");
    const keyBindings = keySetting("KeyW", "KeyS", "KeyO", "KeyL");

    if (!(await checkAccessToken())) {
      alert(window.router.getTranslatedText(globalState.language, "invalidToken"));
      return;
    }
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("pingpong/normal/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const gameId = data.game_id;
      const game = new Pingpong(gameContainer);
      const countdownElement = document.getElementById("countdown");
      window.gameSocket = new WebSocket("wss://" + window.location.host + "/ws/pingpong/" + gameId + "/");
      window.gameSocket.onmessage = function (e) {
        const recvMessage = JSON.parse(e.data);
        if (recvMessage["message_type"] === "position") {
          game.render(recvMessage);
        } else if (recvMessage["message_type"] === "start") {
          let count = 3;
          countdownElement.textContent = count;
          countdownElement.style.display = "block";
          const countdownInterval = setInterval(() => {
            count--;
            countdownElement.textContent = count;
            if (count === 0) {
              clearInterval(countdownInterval);
              setTimeout(() => {
                countdownElement.style.display = "none";
              }, 1000);
            }
          }, 1000);
        } else if (recvMessage["message_type"] === "score") {
          let message;
          if (recvMessage["scorer"] == 0) {
            message =
              globalState.normal.player0 + " " + window.router.getTranslatedText(globalState.language, "score") + "!";
          } else {
            message =
              globalState.normal.player1 + " " + window.router.getTranslatedText(globalState.language, "score") + "!";
          }
          countdownElement.textContent = message;
          countdownElement.style.display = "block";
          playerLeftScore.textContent = recvMessage["score0"];
          globalState.normal.player0Score = recvMessage["score0"];
          playerRightScore.textContent = recvMessage["score1"];
          globalState.normal.player1Score = recvMessage["score1"];
          setTimeout(() => {
            countdownElement.style.display = "none";
          }, 3000);
        } else if (recvMessage["message_type"] === "game_over") {
          let message;
          if (recvMessage["winner"] == 0) {
            message =
              globalState.normal.player0 + " " + window.router.getTranslatedText(globalState.language, "win") + "!";
            globalState.normal.winner = globalState.normal.player0;
          } else {
            message =
              globalState.normal.player1 + " " + window.router.getTranslatedText(globalState.language, "win") + "!";
            globalState.normal.winner = globalState.normal.player1;
          }
          countdownElement.textContent = message;
          countdownElement.style.display = "block";
          keyBindings.unbind();
          setTimeout(function () {
            window.gameSocket.close();
            globalState.gameModeStep = 3;
            history.replaceState({ save: globalState }, null, "/main");
            window.router.renderView(mainView);
          }, 3000);
        }
      };
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  } else if (globalState.gameModeStep == 3) {
    mainWindow.innerHTML = "";
    mainWindow.className = "form-result m-auto text-center";
    mainWindow.insertAdjacentHTML("afterbegin", normalGameResultView.getHtml());
    setGlobalStatePageName("normalGameResult");
    const playerLeftName = document.getElementById("playerLeftName");
    const playerRightName = document.getElementById("playerRightName");
    playerLeftName.innerText = globalState.normal.player0;
    playerRightName.innerText = globalState.normal.player1;

    const playerLeftScore = document.getElementById("playerLeftScore");
    const playerRightScore = document.getElementById("playerRightScore");
    playerLeftScore.innerText = globalState.normal.player0Score;
    playerRightScore.innerText = globalState.normal.player1Score;

    const winnerName = document.getElementById("winnerName");
    winnerName.innerText = globalState.normal.winner;
    document.getElementById("return-to-main").onclick = () => {
      resetGlobalState();
      setGlobalStatePageName("main");
      window.router.navigateTo("/main");
    };
  }
}

export async function makeTournamentGameWindow(mainWindow) {
  if (globalState.gameModeStep == 1) {
    mainWindow.innerHTML = "";
    mainWindow.className = "form-basic m-auto text-center";
    mainWindow.insertAdjacentHTML("afterbegin", tournamentGameNameInputView.getHtml());

    document.getElementById("gameStart").onclick = () => {
      if (!currentClickCheck()) {
        return;
      }
      for (let i = 0; i <= 3; ++i) {
        const aliasInput = document.getElementById(`alias${i}`).value.trim();
        if (aliasInput.length > 20) {
          alert(window.router.getTranslatedText(globalState.language, "userNameTooLong"));
          return;
        }
      }
      for (let i = 0; i <= 3; ++i) {
        const aliasInput = document.getElementById(`alias${i}`).value.trim();
        if (aliasInput !== "") {
          globalState.tournament[`player${i}`] = aliasInput;
        }
      }
      globalState.gameModeStep = 2;
      setGlobalStatePageName("tournamentGameMode");
      window.router.navigateTo("/main");
    };
  }
  if (globalState.gameModeStep == 2 || globalState.gameModeStep == 3 || globalState.gameModeStep == 4) {
    mainWindow.innerHTML = "";
    mainWindow.className = "";
    mainWindow.insertAdjacentHTML("afterbegin", gamePlayView.getHtml());

    let gameContainer = document.getElementById("gameContainer");
    gameContainer.className = "form-pingpong";

    const playerLeftName = document.getElementById("playerLeftName");
    const playerRightName = document.getElementById("playerRightName");
    if (globalState.gameModeStep == 2) {
      playerLeftName.innerText = globalState.tournament.player0;
      playerRightName.innerText = globalState.tournament.player1;
    } else if (globalState.gameModeStep == 3) {
      playerLeftName.innerText = globalState.tournament.player2;
      playerRightName.innerText = globalState.tournament.player3;
    } else {
      playerLeftName.innerText = globalState.tournament.round1Winner;
      playerRightName.innerText = globalState.tournament.round2Winner;
    }

    let playerLeftScore = document.getElementById("playerLeftScore");
    let playerRightScore = document.getElementById("playerRightScore");
    const keyBindings = keySetting("KeyW", "KeyS", "KeyO", "KeyL");
    if (!(await checkAccessToken())) {
      alert(window.router.getTranslatedText(globalState.language, "invalidToken"));
      return;
    }
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("pingpong/normal/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const gameId = data.game_id;
      const game = new Pingpong(gameContainer);
      const countdownElement = document.getElementById("countdown");
      window.gameSocket = new WebSocket("wss://" + window.location.host + "/ws/pingpong/" + gameId + "/");
      window.gameSocket.onmessage = function (e) {
        const recvMessage = JSON.parse(e.data);
        if (recvMessage["message_type"] === "position") {
          game.render(recvMessage);
        } else if (recvMessage["message_type"] === "start") {
          let count = 3;
          countdownElement.textContent = count;
          countdownElement.style.display = "block";
          const countdownInterval = setInterval(() => {
            count--;
            countdownElement.textContent = count;
            if (count === 0) {
              clearInterval(countdownInterval);
              setTimeout(() => {
                countdownElement.style.display = "none";
              }, 1000);
            }
          }, 1000);
        } else if (recvMessage["message_type"] === "score") {
          let message;
          if (recvMessage["scorer"] == 0) {
            message =
              playerLeftName.innerText + " " + window.router.getTranslatedText(globalState.language, "score") + "!";
          } else {
            message =
              playerRightName.innerText + " " + window.router.getTranslatedText(globalState.language, "score") + "!";
          }
          countdownElement.textContent = message;
          countdownElement.style.display = "block";
          playerLeftScore.textContent = recvMessage["score0"];
          playerRightScore.textContent = recvMessage["score1"];

          if (globalState.gameModeStep == 2) {
            globalState.tournament.player0Score = recvMessage["score0"];
            globalState.tournament.player1Score = recvMessage["score1"];
          } else if (globalState.gameModeStep == 3) {
            globalState.tournament.player2Score = recvMessage["score0"];
            globalState.tournament.player3Score = recvMessage["score1"];
          } else {
            globalState.tournament.final0Score = recvMessage["score0"];
            globalState.tournament.final1Score = recvMessage["score1"];
          }

          setTimeout(() => {
            countdownElement.style.display = "none";
          }, 3000);
        } else if (recvMessage["message_type"] === "game_over") {
          let message;
          if (recvMessage["winner"] == 0) {
            message =
              playerLeftName.innerText + " " + window.router.getTranslatedText(globalState.language, "win") + "!";
          } else {
            message =
              playerRightName.innerText + " " + window.router.getTranslatedText(globalState.language, "win") + "!";
          }
          globalState.tournament[`round${globalState.gameModeStep - 1}Winner`] =
            recvMessage["winner"] == 0 ? playerLeftName.innerText : playerRightName.innerText;

          countdownElement.textContent = message;
          countdownElement.style.display = "flex";
          keyBindings.unbind();
          window.gameSocket.close();
          setTimeout(function () {
            if (globalState.gameModeStep == 2 || globalState.gameModeStep == 3) {
              countdownElement.insertAdjacentHTML(
                "beforeend",
                '<button id="nextGame" class="btn btn-primary">' +
                  window.router.getTranslatedText(globalState.language, "nextGame") +
                  "</button>"
              );
              document.getElementById("nextGame").onclick = () => {
                document.getElementById("nextGame").onclick = null;
                globalState.gameModeStep++;
                history.replaceState({ save: globalState }, null, "/main");
                window.router.renderView(mainView);
                return;
              };
            } else {
              globalState.gameModeStep++;
              history.replaceState({ save: globalState }, null, "/main");
              window.router.renderView(mainView);
            }
          }, 3000);
        }
      };
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  } else if (globalState.gameModeStep == 5) {
    mainWindow.innerHTML = "";
    mainWindow.className = "";
    mainWindow.insertAdjacentHTML("afterbegin", tournamentGameResultView.getHtml());
    setGlobalStatePageName("tournamentGameResult");
    //--------------------------------------------------------------------------------
    const round0LeftName = document.getElementById("round0LeftName");
    const round0RightName = document.getElementById("round0RightName");
    round0LeftName.innerText = globalState.tournament.player0;
    round0RightName.innerText = globalState.tournament.player1;

    const round0LeftScore = document.getElementById("round0LeftScore");
    const round0RightScore = document.getElementById("round0RightScore");
    round0LeftScore.innerText = globalState.tournament.player0Score;
    round0RightScore.innerText = globalState.tournament.player1Score;

    const round0WinnerName = document.getElementById("round0WinnerName");
    round0WinnerName.innerText = globalState.tournament.round1Winner;
    //--------------------------------------------------------------------------------
    const round1LeftName = document.getElementById("round1LeftName");
    const round1RightName = document.getElementById("round1RightName");
    round1LeftName.innerText = globalState.tournament.player2;
    round1RightName.innerText = globalState.tournament.player3;

    const round1LeftScore = document.getElementById("round1LeftScore");
    const round1RightScore = document.getElementById("round1RightScore");
    round1LeftScore.innerText = globalState.tournament.player2Score;
    round1RightScore.innerText = globalState.tournament.player3Score;

    const round1WinnerName = document.getElementById("round1WinnerName");
    round1WinnerName.innerText = globalState.tournament.round2Winner;
    //--------------------------------------------------------------------------------
    const round2LeftName = document.getElementById("round2LeftName");
    const round2RightName = document.getElementById("round2RightName");
    round2LeftName.innerText = globalState.tournament.round1Winner;
    round2RightName.innerText = globalState.tournament.round2Winner;

    const round2LeftScore = document.getElementById("round2LeftScore");
    const round2RightScore = document.getElementById("round2RightScore");
    round2LeftScore.innerText = globalState.tournament.final0Score;
    round2RightScore.innerText = globalState.tournament.final1Score;

    const round2WinnerName = document.getElementById("round2WinnerName");
    round2WinnerName.innerText = globalState.tournament.round3Winner;
    //--------------------------------------------------------------------------------
    document.getElementById("return-to-main").onclick = () => {
      resetGlobalState();
      setGlobalStatePageName("main");
      window.router.navigateTo("/main");
    };
  }
}

export async function makeRemoteGameWindow(mainWindow) {
  if (globalState.gameModeStep == 1) {
    mainWindow.innerHTML = "";
    mainWindow.className = "";
    mainWindow.insertAdjacentHTML("afterbegin", gamePlayView.getHtml());

    let gameContainer = document.getElementById("gameContainer");
    gameContainer.className = "form-pingpong";

    const playerLeftName = document.getElementById("playerLeftName");
    const playerRightName = document.getElementById("playerRightName");
    const playerLeftScore = document.getElementById("playerLeftScore");
    const playerRightScore = document.getElementById("playerRightScore");
    let keyBindings = null;
    const game = new Pingpong(gameContainer);
    const countdownElement = document.getElementById("countdown");

    if (!(await checkAccessToken())) {
      alert(window.router.getTranslatedText(globalState.language, "invalidToken"));
      return;
    }
    window.gameSocket = new WebSocket(
      "wss://" + window.location.host + "/ws/remotePingpong/" + globalState.remote.gameId + "/"
    );

    window.gameSocket.onmessage = async function (e) {
      const recvMessage = JSON.parse(e.data);
      if (recvMessage["message_type"] === "position") {
        game.render(recvMessage);
      } else if (recvMessage["message_type"] === "start") {
        let count = 3;
        countdownElement.textContent = count;
        countdownElement.style.display = "block";
        const countdownInterval = setInterval(() => {
          count--;
          countdownElement.textContent = count;
          if (count === 0) {
            clearInterval(countdownInterval);
            setTimeout(() => {
              countdownElement.style.display = "none";
            }, 1000);
          }
        }, 1000);
      } else if (recvMessage["message_type"] === "score") {
        let message;
        if (recvMessage["scorer"] == 0) {
          message =
            globalState.remote.player0 + " " + window.router.getTranslatedText(globalState.language, "score") + "!";
        } else {
          message =
            globalState.remote.player1 + " " + window.router.getTranslatedText(globalState.language, "score") + "!";
        }
        countdownElement.textContent = message;
        countdownElement.style.display = "block";
        playerLeftScore.textContent = recvMessage["score0"];
        globalState.remote.player0Score = recvMessage["score0"];
        playerRightScore.textContent = recvMessage["score1"];
        globalState.remote.player1Score = recvMessage["score1"];
        setTimeout(() => {
          countdownElement.style.display = "none";
        }, 3000);
      } else if (recvMessage["message_type"] === "game_over") {
        let message;
        if (recvMessage["winner"] == 0) {
          message =
            globalState.remote.player0 + " " + window.router.getTranslatedText(globalState.language, "win") + "!";
          globalState.remote.winner = globalState.remote.player0;
        } else {
          message =
            globalState.remote.player1 + " " + window.router.getTranslatedText(globalState.language, "win") + "!";
          globalState.remote.winner = globalState.remote.player1;
        }
        countdownElement.textContent = message;
        countdownElement.style.display = "block";
        keyBindings.unbind();
        setTimeout(function () {
          window.gameSocket.close();
          globalState.gameModeStep = 2;
          history.replaceState({ save: globalState }, null, "/main");
          window.router.renderView(mainView);
        }, 3000);
      } else if (recvMessage["message_type"] === "players_info") {
        playerLeftName.innerText = recvMessage["player1_name"];
        playerRightName.innerText = recvMessage["player2_name"];
        globalState.remote.player0 = recvMessage["player1_name"];
        globalState.remote.player1 = recvMessage["player2_name"];
        if (recvMessage["player1_name"] === globalState.intraID) {
          keyBindings = remoteKeySetting("KeyW", "KeyS", 0);
        } else {
          keyBindings = remoteKeySetting("KeyW", "KeyS", 1);
        }
      } else if (recvMessage["message_type"] === "opponent_disconnected") {
        if (recvMessage["disconnected_user"] != globalState.intraID) {
          window.gameSocket.close();
          setTimeout(function () {
            countdownElement.textContent = recvMessage["disconnected_user"] + " 연결끊김";
            countdownElement.style.display = "flex";
            keyBindings.unbind();
            countdownElement.insertAdjacentHTML(
              "beforeend",
              `<button id="returnToMain" class="btn btn-primary">돌아가기</button>`
            );
            document.getElementById("returnToMain").onclick = () => {
              document.getElementById("returnToMain").onclick = null;
              resetGlobalState();
              history.replaceState({ save: globalState }, null, "/main");
              window.router.renderView(mainView);
              return;
            };
          }, 3000);
        }
      }
    };
  } else if (globalState.gameModeStep == 2) {
    mainWindow.innerHTML = "";
    mainWindow.className = "form-result m-auto text-center";
    mainWindow.insertAdjacentHTML("afterbegin", normalGameResultView.getHtml());
    setGlobalStatePageName("normalGameResult");
    const playerLeftName = document.getElementById("playerLeftName");
    const playerRightName = document.getElementById("playerRightName");
    playerLeftName.innerText = globalState.remote.player0;
    playerRightName.innerText = globalState.remote.player1;

    const playerLeftScore = document.getElementById("playerLeftScore");
    const playerRightScore = document.getElementById("playerRightScore");
    playerLeftScore.innerText = globalState.remote.player0Score;
    playerRightScore.innerText = globalState.remote.player1Score;

    const winnerName = document.getElementById("winnerName");
    winnerName.innerText = globalState.remote.winner;
    document.getElementById("return-to-main").onclick = () => {
      resetGlobalState();
      setGlobalStatePageName("main");
      window.router.navigateTo("/main");
    };
  }
}

export async function makeConfingWindow(mainWindow) {
  mainWindow.innerHTML = "";
  mainWindow.className = "form-basic m-auto text-center";
  mainWindow.insertAdjacentHTML("afterbegin", userConfigView.getHtml());

  let receivedData;
  const otpToggle = document.getElementById("otpToggle");
  await checkAccessToken();
  const token = localStorage.getItem("accessToken");
  fetch("authenticate/getUserInfo/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then(async (response) => {
      if (response.ok) {
        receivedData = await response.json();
        otpToggle.checked = receivedData.use_otp;
      } else {
        response.json().then((text) => {
          console.error("Error occurred:", response.status, text.error);
          alert("Error: " + text.error);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching token and data:", error);
    });

  document.getElementById("saveButton").onclick = () => {
    if (!currentClickCheck()) {
      return;
    }

    if (!receivedData) {
      alert(window.router.getTranslatedText(globalState.language, "canNotGetUserSetting"));
      return;
    }

    if (receivedData.use_otp === otpToggle.checked) {
      globalState.gameMode = null;
      setGlobalStatePageName("main");
      window.router.navigateTo("/main");
      return;
    }

    fetch("authenticate/otpSet/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ use_otp: otpToggle.checked }),
    })
      .then(async (response) => {
        if (response.ok) {
          let receivedData = await response.json();
          alert(receivedData.message);
          document.getElementById("saveButton").onclick = null;
          globalState.gameMode = null;
          setGlobalStatePageName("main");
          window.router.navigateTo("/main");
        } else {
          return response.json().then((text) => {
            console.error("Error occurred:", response.status, text.error);
            alert("Error: " + text.error);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching token and data:", error);
      });
  };
}
