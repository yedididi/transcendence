export const tournamentGameNameInputView = {
  getHtml() {
    return `
	<div class="playerNameInputBox">
    	<div class="playerNameButtonsTournament">
			<h1 class="mb-3" id="tournamentTitle" style="color:black;">토너먼트</h1>
			<form>
			<label class="mb-1" id="user1" style="color:black;">유저1</label>
			<input type="text" class="btn btn-bd-primary w-100 py-2 mb-3" name="alias" id="alias0" required placeholder="${globalState.tournament.player0}" onfocus="this.placeholder=''" onblur="this.placeholder='${globalState.tournament.player0}'" autocomplete="off">
			<label class="mb-1" id="user2" style="color:black;">유저2</label>
			<input type="text" class="btn btn-bd-primary w-100 py-2 mb-3" name="alias" id="alias1" required placeholder="${globalState.tournament.player1}" onfocus="this.placeholder=''" onblur="this.placeholder='${globalState.tournament.player1}'" autocomplete="off">
			<label class="mb-1" id="user3" style="color:black;">유저3</label>
			<input type="text" class="btn btn-bd-primary w-100 py-2 mb-3" name="alias" id="alias2" required placeholder="${globalState.tournament.player2}" onfocus="this.placeholder=''" onblur="this.placeholder='${globalState.tournament.player2}'" autocomplete="off">
			<label class="mb-1" id="user4" style="color:black;">유저4</label>
			<input type="text" class="btn btn-bd-primary w-100 py-2 mb-3" name="alias" id="alias3" required placeholder="${globalState.tournament.player3}" onfocus="this.placeholder=''" onblur="this.placeholder='${globalState.tournament.player3}'" autocomplete="off">
			</form>
			<div class="btn btn-dark w-100 py-2 mt-3 mb-3" id="gameStart">핑퐁 시작!</div>
		</div>
    </div>
		`;
  },
};

export const tournamentGameResultView = {
  getHtml() {
    return `
	<div class="container">
		<div class="row justify-content-center">
			<div class="col-auto">
            	<h1 class="mb-3" id="tournamentResult">토너먼트 결과</h1>
       		</div>
   		</div>
		<div class="row" style="border-bottom: 2px solid white;">
			<div class="col" style="border-right: 2px solid white;">
				<div class="form-result m-auto text-center">
					<h1 class="mb-3" id="roundOneTitle">-- 1 라운드 --</h1>
					<div>
						<span id="round0LeftName"></span><pre class="mb-0"> </pre><span id="round0RightName"></span>
					</div>
					<div>
						<span id="round0LeftScore">0</span><pre class="mb-0">:</pre><span id="round0RightScore">0</span>
					</div>
					<h1 class="m-3" id="roundOneWinner">1 라운드 승자</h1>
					<span id="round0WinnerName" class="mb-3"></span>
				</div>
			</div>
			<div class="col">
				<div class="form-result m-auto text-center">
					<h1 class="mb-3" id="roundTwoTitle">-- 2 라운드 --</h1>
					<div>
						<span id="round1LeftName"></span><pre class="mb-0"> </pre><span id="round1RightName"></span>
					</div>
					<div>
						<span id="round1LeftScore">0</span><pre class="mb-0">:</pre><span id="round1RightScore">0</span>
					</div>
					<h1 class="m-3" id="roundTwoWinner">2 라운드 승자</h1>
					<span id="round1WinnerName" class="mb-3"></span>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col">
				<div class="form-result m-auto text-center">
					<h1 class="mb-3" id="finalRoundTitle">-- 마지막 라운드 결과 --</h1>
					<div>
						<span id="round2LeftName"></span><pre class="mb-0"> </pre><span id="round2RightName"></span>
					</div>
					<div>
						<span id="round2LeftScore">0</span><pre class="mb-0">:</pre><span id="round2RightScore">0</span>
					</div>
					<h1 class="m-3" id="finalRoundWinner">최후 승자</h1>
					<span id="round2WinnerName"></span>
				</div>
			</div>
		</div>
		<div class="row justify-content-center">
			<div class="col-auto">
            	<button id="return-to-main" type="button" class="btn btn-primary m-2">돌아가기</button>
        	</div>
    	</div>
	</div>
	`;
  },
};
