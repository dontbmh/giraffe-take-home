import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

const useMountedEffect = (effect: EffectCallback, deps: DependencyList) => {
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    return effect();
  }, deps);
};

export default useMountedEffect;
