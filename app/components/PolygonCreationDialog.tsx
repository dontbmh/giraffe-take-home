"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

type PolygonCreationDialogProps = {
  open?: boolean;
  onClose?: () => void;
  onConfirm?: (name: string) => void;
};

const PolygonCreationDialog = ({
  open,
  onClose,
  onConfirm,
}: PolygonCreationDialogProps) => (
  <Dialog
    open={!!open}
    onClose={onClose}
    PaperProps={{
      component: "form",
      onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const { name } = Object.fromEntries(data.entries());
        onConfirm?.(name.toString());
      },
    }}
  >
    <DialogTitle>Complete Drawing</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Please specify a name for the polygon area
      </DialogContentText>
      <TextField
        autoFocus
        required
        margin="dense"
        id="name"
        name="name"
        label="Polygon Name"
        type="text"
        fullWidth
        variant="standard"
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button type="submit">Apply</Button>
    </DialogActions>
  </Dialog>
);

export default PolygonCreationDialog;
