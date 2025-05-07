window.globalState = {
  intraID: null,
  lastOtpSentTime: 0,
  otpSentCheck: false,
  language: "ko",
  pageName: "login",
  gameMode: null,
  gameModeStep: 0,
  normal: {
    player0: null,
    player0Score: 0,
    player1: "guest1",
    player1Score: 0,
    winner: null,
  },
  tournament: {
    player0: null,
    player0Score: 0,
    player1: "guest1",
    player1Score: 0,
    round1Winner: null,

    player2: "guest2",
    player2Score: 0,
    player3: "guest3",
    player3Score: 0,
    round2Winner: null,

    final0Score: 0,
    final1Score: 0,
    round3Winner: null,
  },
  remote: {
    gameId: null,
    player0: null,
    player0Score: 0,
    player1: null,
    player1Score: 0,
    winner: null,
  },
};

export function resetGlobalState() {
  globalState.gameMode = null;
  globalState.gameModeStep = 0;

  globalState.normal.player0 = globalState.intraID;
  globalState.normal.player0Score = 0;
  globalState.normal.player1 = "guest1";
  globalState.normal.player1Score = 0;
  globalState.normal.winner = null;

  globalState.tournament.player0 = globalState.intraID;
  globalState.tournament.player0Score = 0;
  globalState.tournament.player1 = "guest1";
  globalState.tournament.player1Score = 0;
  globalState.tournament.round1Winner = null;

  globalState.tournament.player2 = "guest2";
  globalState.tournament.player2Score = 0;
  globalState.tournament.player3 = "guest3";
  globalState.tournament.player3Score = 0;
  globalState.tournament.round2Winner = null;

  globalState.tournament.final0Score = 0;
  globalState.tournament.final1Score = 0;
  globalState.tournament.round3Winner = null;

  globalState.remote.gameId = null;
  globalState.remote.player0 = null;
  globalState.remote.player0Score = 0;
  globalState.remote.player1 = null;
  globalState.remote.player1Score = 0;
  globalState.remote.winner = null;
}

export function initGlobalState() {
  globalState.intraID = null;
  globalState.lastOtpSentTime = 0;
  globalState.otpSentCheck = false;
  globalState.language = "ko";
  globalState.pageName = "login";
  resetGlobalState();
}

export function setGlobalStateIntraId(intraId) {
  globalState.intraID = intraId;
  globalState.normal.player0 = intraId;
  globalState.tournament.player0 = intraId;
}

export function setGlobalStatePageName(pageName) {
  globalState.pageName = pageName;
  sessionStorage.setItem("pageName", pageName);
}
