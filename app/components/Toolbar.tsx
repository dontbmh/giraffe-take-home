import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import PolylineOutlined from "@mui/icons-material/PolylineOutlined";

import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";

export type ToolId = "action-draw" | "action-delete";

type ToolbarProps = {
  invisibility?: ToolId[];
  onToolClick?: (id: ToolId) => void;
};

const Toolbar = ({ invisibility = [], onToolClick }: ToolbarProps) => (
  <Box className="bg-gray-900 p-2 rounded-md">
    <ButtonGroup className="gap-x-2">
      {!invisibility.includes("action-draw") && (
        <IconButton
          className="rounded-sm"
          size="large"
          onClick={() => onToolClick?.("action-draw")}
        >
          <PolylineOutlined />
        </IconButton>
      )}
      {!invisibility.includes("action-delete") && (
        <IconButton
          className="rounded-sm"
          size="large"
          onClick={() => onToolClick?.("action-delete")}
        >
          <DeleteOutlined />
        </IconButton>
      )}
    </ButtonGroup>
  </Box>
);

export default Toolbar;
