export const userConfigView = {
  getHtml() {
    return `
	<h2 class="mb-3" id="userConfigTitle">유저 설정</h2>
	<div>
		<div>
			<span class="m-3" id="otpSetting">OTP 사용</span><input id="otpToggle" type="checkbox"> 
		</div>
	</div>
	<button id="saveButton" class="btn btn-primary m-3">저장</button>
	`;
  },
};
