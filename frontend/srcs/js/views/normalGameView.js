export const normalGameNameInputView = {
  getHtml() {
    return `
	<div class="playerNameInputBox">
      <div class="playerNameButtons">
        <h1 class="mb-3" style="color:black;">1 VS 1</h1>
        <form>
          <label class="mb-1" id="user1" for="alias1" style="color:black;">유저1 </label>
          <input type="text" class="btn btn-bd-primary w-100 py-2 mb-3" name="alias" id="alias0" required placeholder="${globalState.normal.player0}" onfocus="this.placeholder=''" onblur="this.placeholder='${globalState.normal.player0}'" autocomplete="off">
          <label class="mb-1" id="user2" for="alias2" style="color:black;">유저2 </label>
          <input type="text" class="btn btn-bd-primary w-100 py-2 mb-3" name="alias" id="alias1" required placeholder="${globalState.normal.player1}" onfocus="this.placeholder=''" onblur="this.placeholder='${globalState.normal.player1}'" autocomplete="off">
        </form>
        <div class="btn btn-dark w-100 py-2 mt-3 mb-3" id="gameStart">핑퐁 시작!</div>
      </div>
    </div>
		`;
  },
};

export const normalGameResultView = {
  getHtml() {
    return `
		<h1 class="mb-3" id="normalGameResultTitle">게임결과</h1>
		<div>
			<span id="playerLeftName"></span><pre class="mb-0"> </pre><span id="playerRightName"></span>
		</div>
		<div>
		  <span id="playerLeftScore">0</span><pre class="mb-0">:</pre><span id="playerRightScore">0</span>
		</div>
		<h1 class="m-3" id="normalGameResultWinner">승자</h1>
		<span id="winnerName"></span>
		<button id="return-to-main" type="button" class="btn btn-primary m-5">돌아가기</button>
		`;
  },
};
