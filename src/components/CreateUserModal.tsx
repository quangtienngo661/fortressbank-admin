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
  FormControlLabel,
  Checkbox,
  Grid,
  InputAdornment,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { userService } from "../services/userService";
import type { CreateUserRequest } from "../types";

interface CreateUserModalProps {
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

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    dob: "",
    citizenId: "",
    phoneNumber: "+84",
    accountNumberType: "AUTO_GENERATE",
    pin: "",
    createCard: true,
    roles: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      dob: "",
      citizenId: "",
      phoneNumber: "+84",
      accountNumberType: "AUTO_GENERATE",
      pin: "",
      createCard: true,
      roles: [],
    });
    setError("");
    setSuccess(false);
    onClose();
  };

  const validateForm = (): string | null => {
    // Username validation
    if (!formData.username || formData.username.length < 6 || formData.username.length > 20) {
      return "Username must be between 6 and 20 characters";
    }
    if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      return "Username must contain only letters and numbers";
    }

    // Email validation
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password || formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/.test(formData.password)) {
      return "Password must contain uppercase, lowercase, number, and special character";
    }

    // Full Name validation
    if (!formData.fullName || !/^[\p{L} .'-]+$/u.test(formData.fullName)) {
      return "Full name contains invalid characters";
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

    // Citizen ID validation
    if (!formData.citizenId || !/^\d{9}|\d{12}$/.test(formData.citizenId)) {
      return "Citizen ID must be 9 or 12 digits";
    }

    // Phone validation - expecting format without +84 prefix (will be added in display)
    const phoneDigits = formData.phoneNumber.replace(/^\+84/, '');
    if (!phoneDigits || !/^[0-9]{9,10}$/.test(phoneDigits)) {
      return "Phone number must be 9 or 10 digits (after +84)";
    }

    // PIN validation
    if (!formData.pin || !/^\d{6}$/.test(formData.pin)) {
      return "PIN must be exactly 6 digits";
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
      await userService.createUser(formData);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateUserRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: any } }
  ) => {
    let value = e.target.value;
    
    // Special handling for phone number to ensure +84 prefix
    if (field === 'phoneNumber') {
      // Remove any non-digit characters except +
      value = value.replace(/[^\d+]/g, '');
      // Ensure +84 prefix
      if (!value.startsWith('+84')) {
        value = '+84' + value.replace(/^\+?84?/, '');
      }
      // Limit to +84 + 10 digits
      if (value.length > 13) {
        value = value.substring(0, 13);
      }
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof CreateUserRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  // Calculate max date (18 years ago)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create New User
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
            Create user with account and optional card
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
              User created successfully!
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleChange("username")}
                inputProps={{ minLength: 6, maxLength: 20 }}
                helperText="6-20 characters, alphanumeric only"
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange("password")}
                helperText="Min 8 chars, must include uppercase, lowercase, number, and special char"
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Citizen ID"
                value={formData.citizenId}
                onChange={handleChange("citizenId")}
                helperText="9 or 12 digits"
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
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber || '+84'}
                onChange={handleChange("phoneNumber")}
                placeholder="+84xxxxxxxxx"
                helperText="Format: +84 + 9-10 digits"
                inputProps={{
                  inputMode: 'tel',
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" sx={{ mt: 2 }}>
                <InputLabel>Account Number Type</InputLabel>
                <Select
                  value={formData.accountNumberType}
                  label="Account Number Type"
                  onChange={(e) =>
                    handleChange("accountNumberType")({
                      target: { value: e.target.value },
                    })
                  }
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="AUTO_GENERATE">Auto Generate</MenuItem>
                  <MenuItem value="PHONE_NUMBER">Phone Number</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="PIN"
                type="password"
                value={formData.pin}
                onChange={handleChange("pin")}
                inputProps={{ maxLength: 6, pattern: "[0-9]*" }}
                helperText="Exactly 6 digits"
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.createCard}
                    onChange={handleCheckboxChange("createCard")}
                  />
                }
                label="Create Card"
                sx={{ mt: 1 }}
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
            {loading ? "Creating..." : "Create User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

