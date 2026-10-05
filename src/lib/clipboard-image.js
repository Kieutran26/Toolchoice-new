/**
 * @param {{clipboardData?: DataTransfer, preventDefault: () => void, stopPropagation: () => void}} event
 * @param {(file: File) => unknown} onImage
 */
export function pasteImage(event, onImage, disabled = false) {
  const clipboard = event.clipboardData;
  const item = Array.from(clipboard?.items || []).find(value => value.kind === 'file' && value.type.startsWith('image/'));
  const file = item?.getAsFile() || Array.from(clipboard?.files || []).find(value => value.type.startsWith('image/'));
  if (!file) return;
  event.preventDefault();
  event.stopPropagation();
  if (!disabled) onImage(file);
}
