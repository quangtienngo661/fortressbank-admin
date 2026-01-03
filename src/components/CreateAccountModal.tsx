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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { accountService } from "../services/accountService";

interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [userId, setUserId] = useState("");
  const [accountNumberType, setAccountNumberType] = useState<"PHONE_NUMBER" | "AUTO_GENERATE">("AUTO_GENERATE");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open) {
      setUserId("");
      setAccountNumberType("AUTO_GENERATE");
      setPhoneNumber("");
      setPin("");
      setError("");
      setSuccess(false);
    }
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // If empty, allow it
    if (value === "") {
      setPhoneNumber("");
      return;
    }
    
    // If doesn't start with +84, auto-add it
    if (!value.startsWith("+84")) {
      value = "+84" + value.replace(/\D/g, "");
    }
    
    // Remove all non-digits except the + at start
    const digits = value.substring(3).replace(/\D/g, "");
    
    // Limit to 10 digits after +84
    if (digits.length <= 10) {
      setPhoneNumber("+84" + digits);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits, max 6
    if (/^\d{0,6}$/.test(value)) {
      setPin(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!userId.trim()) {
      setError("User ID is required");
      return;
    }

    if (accountNumberType === "PHONE_NUMBER") {
      if (!phoneNumber || !/^\+84\d{9,10}$/.test(phoneNumber)) {
        setError("Phone number must be in format +84xxxxxxxxx (9-10 digits after +84)");
        return;
      }
    }

    if (pin && pin.length !== 6) {
      setError("PIN must be exactly 6 digits");
      return;
    }

    setLoading(true);

    try {
      await accountService.createAccount({
        userId: userId.trim(),
        accountNumberType,
        phoneNumber: accountNumberType === "PHONE_NUMBER" ? phoneNumber : undefined,
        pin: pin || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account");
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
          <PersonAddIcon />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Create New Account
        </Typography>
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
              Account created successfully!
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={loading || success}
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

          <FormControl
            fullWidth
            margin="normal"
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
          >
            <InputLabel>Account Number Type</InputLabel>
            <Select
              value={accountNumberType}
              label="Account Number Type"
              onChange={(e) => setAccountNumberType(e.target.value as "PHONE_NUMBER" | "AUTO_GENERATE")}
              disabled={loading || success}
            >
              <MenuItem value="AUTO_GENERATE">Auto Generate</MenuItem>
              <MenuItem value="PHONE_NUMBER">Phone Number</MenuItem>
            </Select>
          </FormControl>

          {accountNumberType === "PHONE_NUMBER" && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Phone Number"
              placeholder="+84xxxxxxxxx"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              disabled={loading || success}
              helperText="Format: +84 followed by 9-10 digits"
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
          )}

          <TextField
            margin="normal"
            fullWidth
            label="PIN (Optional, 6 digits)"
            type="password"
            value={pin}
            onChange={handlePinChange}
            disabled={loading || success}
            inputProps={{ maxLength: 6 }}
            helperText="Leave empty to skip PIN setup"
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
            disabled={loading || success}
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
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
