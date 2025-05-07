export function currentClickCheck() {
  const currentTime = Date.now();
  if (currentTime - window.lastClickTime < window.clickDelay) {
    return false;
  }
  window.lastClickTime = currentTime;
  return true;
}
