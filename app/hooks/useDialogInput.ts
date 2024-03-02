import { useCallback, useRef, useState } from "react";

const useDialogInput = <T>(defaultValue: T) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<(_: T) => void>();

  const resolveValue = useCallback((value: T) => {
    if (!ref.current) return;
    const resolve = ref.current;
    ref.current = undefined;
    resolve(value);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
    resolveValue(defaultValue);
  }, [defaultValue]);

  const onConfirm = useCallback(
    (value: T) => {
      setOpen(false);
      resolveValue(value ?? value);
    },
    [defaultValue]
  );

  const show = useCallback(
    () =>
      new Promise<T>((resolve) => {
        ref.current = resolve;
        setOpen(true);
      }),
    []
  );

  return { open, onClose, onConfirm, show };
};

export default useDialogInput;
