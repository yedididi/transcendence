export const mainView = {
  getHtml() {
    return `
    <div class="row h-100" style="flex-wrap: nowrap;">
      <div class="form-basic-chat m-3 text-center" id="chatWindow">
          <div id="chat-log" class="chat-log d-flex flex-column" ></div>
          <div class="input-group mb-3">
              <input id="chat-message-input" type="text" class="form-control" placeholder="메시지를 입력하세요" aria-label="메시지를 입력하세요" aria-describedby="button-send">
              <button id="chat-message-submit" type="button" class="btn btn-outline-light">보내기</button>
          </div>
      </div>
      <div id="mainWindow"></div>
    </div>
    `;
  },
};

export const gameModeSelectView = {
  getHtml() {
    return `
	  <div class="gameModeSelectBox">
      <div class="gameModeButtons">
        <div class="d-flex" style="height: 150px; gap: 3px; margin-bottom: 30px;">
          <button class="btn btn-light w-100 h-100 py-2" id="normal">1대1 매칭</button>  
          <button class="btn btn-light w-100 h-100 py-2" id="tournament">토너먼트</button>
          <button class="btn btn-light w-100 h-100 py-2" id="remotePlay">원격 매칭</button>
        </div>
        <button class="btn btn-light w-100 py-2 mb-3" id="userConfig">회원정보 수정</button>
        <button class="btn btn-light w-100 py-2 mb-3" id="logout">로그아웃</button>
      </div>
    </div>

    <div class="modal fade" id="loadingModal" tabindex="-1" aria-labelledby="loadingModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-body">
            <div class="d-flex justify-content-center">
              <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <p class="text-center mt-3" id="matchingStatement">매칭 중입니다. 잠시만 기다려주세요...</p>
            <button id="cancle-remote" type="button" class="btn btn-primary">대기 취소</button>
          </div>
        </div>
      </div>
    </div>
	  `;
  },
};

export const gamePlayView = {
  getHtml() {
    return `
		<div id="scoreOverlay">
		  <div>
			<span id="playerLeftName"></span><pre class="mb-0"> </pre><span id="playerRightName"></span>
		  </div>
		  <div>
			<span id="playerLeftScore">0</span><pre class="mb-0">:</pre><span id="playerRightScore">0</span>
		  </div>
		</div>
		<div id="gameContainer">
		  <div id="countdown" class="countdown-overlay">3</div> 
		</div> 
		`;
  },
};
