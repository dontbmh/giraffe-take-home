import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import {
  Dialog,
  IconButton,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import MuiTableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import MuiTableRow from "@mui/material/TableRow";
import { upperCase } from "lodash";
import { useMemo, useState } from "react";
import { FeaturesData } from "../modules/PolygonFeatures";
import { uniqOrderedArray } from "../utils";
import DraggablePaper from "./common/DraggablePaper";

const MAX_DISPLAY_PROPS = 7;

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const TableRow = styled(MuiTableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

type FeaturesDataDialogProps = {
  data: FeaturesData;
  open?: boolean;
  onClose?: () => void;
  onLocate?: (id: string) => void;
};

const FeaturesDataDialog = ({
  data: { name, features },
  open,
  onClose,
  onLocate,
}: FeaturesDataDialogProps) => {
  const [filter, setFilter] = useState("");

  const headers = useMemo(
    () =>
      uniqOrderedArray(
        features.flatMap(({ properties }) => Object.keys(properties))
      ).slice(0, MAX_DISPLAY_PROPS),
    [features]
  );

  const data = useMemo(
    () =>
      !filter
        ? features
        : features.filter(({ properties }) =>
            Object.values(properties).some((e: string) =>
              e.toUpperCase().includes(filter)
            )
          ),
    [features, filter]
  );

  return (
    <Dialog
      hideBackdrop
      PaperComponent={DraggablePaper}
      open={!!open}
      onClose={onClose}
    >
      <div className="p-4 flex flex-row justify-between items-center">
        <Typography variant="h6" component="div">
          Polygon: {name}
        </Typography>
        <TextField
          label="Filter"
          variant="outlined"
          onChange={({ target }) => setFilter(target.value.toUpperCase())}
        />
      </div>
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">LOCATE</TableCell>
              {headers.map((e) => (
                <TableCell align="left" key={e}>
                  {upperCase(e)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(({ id, properties }) => (
              <TableRow
                key={id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="left">
                  <IconButton onClick={() => onLocate?.(`${id}`)}>
                    <CenterFocusWeakIcon />
                  </IconButton>
                </TableCell>
                {headers.map((key) => (
                  <TableCell align="left" key={key}>
                    {properties[key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Dialog>
  );
};

export default FeaturesDataDialog;
