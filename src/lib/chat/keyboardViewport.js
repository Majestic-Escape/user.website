// The height a phone chat screen can really use — the visual viewport, minus
// what Chrome for Android over-reports while the keyboard is up.
//
// This site uses viewport-fit=cover, so Chrome on Android draws under the
// navigation bar and reports the bar as env(safe-area-inset-bottom) (18–24px).
// With the keyboard up it drops that inset to 0 but still counts the bar in
// visualViewport.height, so a screen sized to the visual viewport reaches that
// far behind the keyboard — the bottom of the message box disappeared under
// it. Measured on a Pixel emulator (keyboard top 469px, viewport 494px) and on
// a real phone (18px).
//
// The inset is read while the keyboard is down, and only what the keyboard
// made disappear is taken off. iOS keeps its inset while typing and its
// viewport is right, and phones not drawn under the bar report no inset:
// nothing changes for either.

function insetProbe() {
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom)";
  document.body.appendChild(probe);
  return probe;
}

export function createKeyboardViewport() {
  let probe = null;
  let restingInset = 0;
  const readInset = () => {
    if (!probe) probe = insetProbe();
    return parseFloat(getComputedStyle(probe).paddingBottom) || 0;
  };
  return {
    // `keyboardOpen` as the caller detects it (the viewport shrank by a keyboard)
    height(keyboardOpen) {
      const vv = window.visualViewport;
      const height = vv ? vv.height : window.innerHeight;
      const inset = readInset();
      if (!keyboardOpen) restingInset = inset;
      return keyboardOpen ? height - Math.max(0, restingInset - inset) : height;
    },
    dispose() {
      probe?.remove();
      probe = null;
    },
  };
}
