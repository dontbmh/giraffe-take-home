import { useEffect, useState } from "react";
import { getWindowDimensions } from "../utils";

const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(() => getWindowDimensions());

  useEffect(() => {
    const handleResize = () => setDimensions(getWindowDimensions());
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
};

export default useWindowDimensions;
