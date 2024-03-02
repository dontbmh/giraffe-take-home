import { Dialog, Typography, styled } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import MuiTableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import MuiTableRow from "@mui/material/TableRow";
import { upperCase } from "lodash";
import { useMemo } from "react";
import { FeaturesData } from "../modules/PolygonFeatures";
import { uniqOrderedArray } from "../utils";
import DraggablePaper from "./common/DraggablePaper";

const MAX_DISPLAY_PROPS = 10;

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
};

const FeaturesDataDialog = ({
  data: { name, features },
  open,
  onClose,
}: FeaturesDataDialogProps) => {
  const headers = useMemo(
    () =>
      uniqOrderedArray(
        features.flatMap(({ properties }) => Object.keys(properties))
      ).slice(0, MAX_DISPLAY_PROPS),
    [features]
  );

  return (
    <Dialog
      hideBackdrop
      PaperComponent={DraggablePaper}
      open={!!open}
      onClose={onClose}
    >
      <Typography className="p-4" variant="h6" component="div">
        Polygon: {name}
      </Typography>
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headers.map((e) => (
                <TableCell align="left" key={e}>
                  {upperCase(e)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map(({ id, properties }) => (
              <TableRow
                key={id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
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
