import { onBeforeUnmount } from "vue";

interface KeyCombo {
  key: string;
  fn: () => void;
}

export function useKeyUp(keyCombos: KeyCombo[]) {
  const onKeyUp = (event: any) => {
    const kc = keyCombos.find((kc) => kc.key === event.key);

    if (kc) {
      kc.fn();
    }
  };

  window.addEventListener("keyup", onKeyUp);
  onBeforeUnmount(() => {
    window.removeEventListener("keyup", onKeyUp);
  });
}

export default useKeyUp;
