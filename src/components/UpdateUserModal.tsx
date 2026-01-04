import React, { useState, useEffect } from "react";
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
  Grid,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { Edit as EditIcon } from "@mui/icons-material";
import { userService } from "../services/userService";
import type { AdminUser, UpdateUserRequest } from "../types";

interface UpdateUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  user: AdminUser | null;
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

export const UpdateUserModal: React.FC<UpdateUserModalProps> = ({
  open,
  onClose,
  userId,
  user,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    fullName: "",
    email: "",
    dob: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      // Format date for input (YYYY-MM-DD)
      const dobDate = user.dob ? user.dob.split("T")[0] : "";
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        dob: dobDate,
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user, open]);

  const handleClose = () => {
    setFormData({
      fullName: "",
      email: "",
      dob: "",
      phoneNumber: "",
    });
    setError("");
    setSuccess(false);
    onClose();
  };

  const validateForm = (): string | null => {
    // Full Name validation
    if (!formData.fullName || !/^[\p{L} .'-]+$/u.test(formData.fullName)) {
      return "Full name contains invalid characters";
    }

    // Email validation
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address";
    }

    // DOB validation
    if (!formData.dob) {
      return "Date of birth is required";
    }
    const dob = new Date(formData.dob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      if (age < 19) return "User must be at least 18 years old";
    } else if (age < 18) {
      return "User must be at least 18 years old";
    }

    // Phone validation
    if (!formData.phoneNumber || !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      return "Phone number must be 10 or 11 digits";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await userService.updateUser(userId, formData);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateUserRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate max date (18 years ago)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const maxDateString = maxDate.toISOString().split("T")[0];

  if (!user) return null;

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
          <EditIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Update User
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
            {user.username}
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
              User updated successfully!
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange("fullName")}
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={handleChange("dob")}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: maxDateString }}
                helperText="User must be at least 18 years old"
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange("phoneNumber")}
                helperText="10 or 11 digits"
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
            </Grid>
          </Grid>
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
            {loading ? "Updating..." : "Update User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

