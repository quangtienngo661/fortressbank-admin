import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Slide,
  Box,
  Typography,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { VpnKey as VpnKeyIcon } from "@mui/icons-material";
import { accountService } from "../services/accountService";

interface UpdatePinModalProps {
  open: boolean;
  onClose: () => void;
  accountId: string;
  accountNumber: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const UpdatePinModal: React.FC<UpdatePinModalProps> = ({
  open,
  onClose,
  accountId,
  accountNumber,
}) => {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setNewPin("");
    setConfirmPin("");
    setError("");
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (newPin !== confirmPin) {
      setError("New PIN and Confirm PIN do not match");
      return;
    }

    if (newPin.length !== 6) {
      setError("PIN must be exactly 6 digits");
      return;
    }

    if (!/^\d+$/.test(newPin)) {
      setError("PIN must contain only digits");
      return;
    }

    setLoading(true);

    try {
      await accountService.updatePin(accountId, { newPin });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: 2.5,
        }}
      >
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            p: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <VpnKeyIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Update PIN
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
            {accountNumber}
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(211, 47, 47, 0.2)",
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(46, 125, 50, 0.2)",
              }}
            >
              PIN updated successfully!
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="New PIN (6 digits)"
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            inputProps={{ maxLength: 6 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm New PIN"
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            inputProps={{ maxLength: 6 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              transition: "all 0.3s",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
              },
            }}
          >
            {loading ? "Updating..." : "Update PIN"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
