import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  InputAdornment,
  Slide,
  Box,
  Typography,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { AccountBalance as AccountBalanceIcon } from "@mui/icons-material";
import { accountService } from "../services/accountService";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prefilledAccountNumber?: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const DepositModal: React.FC<DepositModalProps> = ({
  open,
  onClose,
  onSuccess,
  prefilledAccountNumber = "",
}) => {
  const [accountNumber, setAccountNumber] = useState(prefilledAccountNumber);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open) {
      if (prefilledAccountNumber) {
        setAccountNumber(prefilledAccountNumber);
      }
      setAmount("");
      setDescription("");
      setError("");
      setSuccess(false);
    }
  }, [open, prefilledAccountNumber]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    setLoading(true);

    try {
      await accountService.deposit({
        accountNumber,
        amount: amountNum,
        description,
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to deposit");
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
          <AccountBalanceIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Deposit Money
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
            Add funds to account
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
              Deposit successful!
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            disabled={!!prefilledAccountNumber}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover:not(.Mui-disabled)": {
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
            label="Amount"
            type="text"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow digits and one decimal point with up to 2 decimal places
              if (/^\d*\.?\d{0,2}$/.test(value)) {
                setAmount(value);
              }
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
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
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description for this deposit"
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
            {loading ? "Processing..." : "Deposit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
