export function keySetting(p0Up, p0Down, p1Up, p1Down) {
  const playerLeftKeys = [p0Up, p0Down];
  const playerRightKeys = [p1Up, p1Down];
  let playerLeftKeyPressed = false;
  let playerRightKeyPressed = false;

  const keyDownHandler = function (event) {
    if (!window.gameSocket || window.gameSocket.readyState !== WebSocket.OPEN) {
      return;
    }
    let signal;
    if (playerLeftKeys.includes(event.code) && !playerLeftKeyPressed) {
      playerLeftKeyPressed = true;
      if (event.code === p0Up) {
        signal = "p0_up";
      } else {
        signal = "p0_down";
      }
    } else if (playerRightKeys.includes(event.code) && !playerRightKeyPressed) {
      playerRightKeyPressed = true;
      if (event.code === p1Up) {
        signal = "p1_up";
      } else {
        signal = "p1_down";
      }
    }
    if (!signal) {
      return;
    }
    window.gameSocket.send(
      JSON.stringify({
        type: "keydown",
        signal: signal,
      })
    );
  };

  const keyUpHandler = function (event) {
    if (!window.gameSocket || window.gameSocket.readyState !== WebSocket.OPEN) {
      return;
    }
    let signal;
    if (playerLeftKeys.includes(event.code) && playerLeftKeyPressed) {
      playerLeftKeyPressed = false;
      signal = "p0_stop";
    } else if (playerRightKeys.includes(event.code) && playerRightKeyPressed) {
      playerRightKeyPressed = false;
      signal = "p1_stop";
    }
    if (!signal) {
      return;
    }
    window.gameSocket.send(
      JSON.stringify({
        type: "keyup",
        signal: signal,
      })
    );
  };

  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  return {
    unbind: () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
    },
  };
}

export function remoteKeySetting(up, down, position) {
  const playerKeys = [up, down];
  let playerKeyPressed = false;
  const signals = position == 1 ? ["p1_up", "p1_down", "p1_stop"] : ["p0_up", "p0_down", "p0_stop"];

  const keyDownHandler = function (event) {
    if (!window.gameSocket || window.gameSocket.readyState !== WebSocket.OPEN) {
      return;
    }
    let signal;
    if (playerKeys.includes(event.code) && !playerKeyPressed) {
      playerKeyPressed = true;
      if (event.code === up) {
        signal = signals[0];
      } else {
        signal = signals[1];
      }
    }
    if (!signal) {
      return;
    }
    window.gameSocket.send(
      JSON.stringify({
        type: "keydown",
        signal: signal,
      })
    );
  };

  const keyUpHandler = function (event) {
    if (!window.gameSocket || window.gameSocket.readyState !== WebSocket.OPEN) {
      return;
    }
    let signal;
    if (playerKeys.includes(event.code) && playerKeyPressed) {
      playerKeyPressed = false;
      signal = signals[2];
    }
    if (!signal) {
      return;
    }
    window.gameSocket.send(
      JSON.stringify({
        type: "keyup",
        signal: signal,
      })
    );
  };

  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  return {
    unbind: () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
    },
  };
}
