export const otpView = {
  getHtml() {
    return `
    <main class="form-basic2 m-auto">
      <h1 class="h3 mb-3 fw-bold" id="otpTitle">OTP 입력</h1>
      <div>
        <p class="fw-normal" id="otpFirstLine">1. '코드받기' 버튼을 누르면 인트라 이메일로 6자리 숫자 코드가 발송됩니다.</p>
        <p class="fw-normal" id="otpSecondLine">2. 전송받은 숫자 코드를 입력해주세요.</p>
        <p class="fw-normal" id="otpThirdLine">3. 코드를 전송받고 60초후에 다시 재전송이 가능합니다.</p>
      </div>
      <button type="button" class="btn btn-outline-dark" id="otpSend">코드 받기</button>
    </main>
    `;
  },
};
