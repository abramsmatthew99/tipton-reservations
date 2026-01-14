import { Box, IconButton, Modal, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { ReactNode } from "react";

type BasicModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  descriptionId?: string;
  children?: ReactNode;
};

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "min(720px, 94vw)",
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

const BasicModal = ({
  open,
  onClose,
  title = "Details",
  descriptionId = "basic-modal-description",
  children,
}: BasicModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    aria-labelledby="basic-modal-title"
    aria-describedby={descriptionId}
  >
    <Box sx={modalStyle} role="dialog">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 2,
        }}
      >
        <Typography id="basic-modal-title" variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <IconButton aria-label="Close modal" onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {children ?? (
        <Typography id={descriptionId} variant="body1">
          Hello from the modal.
        </Typography>
      )}
    </Box>
  </Modal>
);

export default BasicModal;
