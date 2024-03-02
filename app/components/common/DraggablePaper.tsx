import useWindowDimensions from "@/app/hooks/useWindowDimensions";
import Paper, { PaperProps } from "@mui/material/Paper";
import clsx from "clsx";
import { Rnd } from "react-rnd";

const DraggablePaper = ({ className, ...rest }: PaperProps) => {
  const { width, height } = useWindowDimensions();

  return (
    <Rnd
      default={{
        x: width / 4,
        y: height / 4,
        width: width / 2,
        height: height / 2,
      }}
    >
      <Paper
        className={clsx(className, "m-0 max-w-full max-h-full w-full h-full")}
        {...rest}
      />
    </Rnd>
  );
};

export default DraggablePaper;
