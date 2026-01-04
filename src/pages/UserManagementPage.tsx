import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  TextField,
  InputAdornment,
  Fade,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { userService } from "../services/userService";
import { CreateUserModal } from "../components/CreateUserModal";
import { UpdateUserModal } from "../components/UpdateUserModal";
import type { AdminUser } from "../types";

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Modal states
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [updateUserModalOpen, setUpdateUserModalOpen] = useState(false);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await userService.searchUsers({
        keyword: searchKeyword,
        page,
        size: rowsPerPage,
      });
      setUsers(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search - reset page when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Fetch users when page, rowsPerPage, or searchKeyword changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchKeyword]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: AdminUser) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    setViewDetailsDialogOpen(true);
    handleMenuClose();
  };

  const handleUpdateUser = () => {
    setUpdateUserModalOpen(true);
    handleMenuClose();
  };

  const handleLockUser = async () => {
    if (!selectedUser) return;

    try {
      await userService.lockUser(selectedUser.id);
      handleMenuClose();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to lock user");
    }
  };

  const handleUnlockUser = async () => {
    if (!selectedUser) return;

    try {
      await userService.unlockUser(selectedUser.id);
      handleMenuClose();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unlock user");
    }
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? "success" : "error";
  };

  const getStatusLabel = (enabled: boolean) => {
    return enabled ? "Active" : "Locked";
  };

  return (
    <Fade in timeout={800}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            User Management
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 250,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setCreateUserModalOpen(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.2,
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
              Create User
            </Button>
          </Box>
        </Box>

        {error && (
          <Fade in>
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(211, 47, 47, 0.2)",
              }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <TableContainer
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Full Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Created At</TableCell>
                <TableCell align="right" sx={{ color: "white", fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <Grow
                    in
                    key={user.id}
                    timeout={300 + index * 100}
                  >
                    <TableRow
                      sx={{
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          transform: "scale(1.01)",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.fullName || "N/A"}</TableCell>
                      <TableCell>{user.phoneNumber || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(user.enabled)}
                          color={getStatusColor(user.enabled)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, user)}
                          sx={{
                            transition: "all 0.3s",
                            "&:hover": {
                              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                              transform: "rotate(90deg)",
                            },
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </Grow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            borderTop: "1px solid rgba(224, 224, 224, 1)",
            mt: 2,
          }}
        />

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewDetails}>
            <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
            View Details
          </MenuItem>
          <MenuItem onClick={handleUpdateUser}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Update User
          </MenuItem>
          {selectedUser?.enabled ? (
            <MenuItem onClick={handleLockUser}>
              <LockIcon sx={{ mr: 1 }} fontSize="small" />
              Lock User
            </MenuItem>
          ) : (
            <MenuItem onClick={handleUnlockUser}>
              <LockOpenIcon sx={{ mr: 1 }} fontSize="small" />
              Unlock User
            </MenuItem>
          )}
        </Menu>

        {/* View Details Dialog */}
        <Dialog
          open={viewDetailsDialogOpen}
          onClose={() => setViewDetailsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
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
            }}
          >
            User Details
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedUser && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Username</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedUser.username}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedUser.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedUser.fullName || "N/A"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Citizen ID</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedUser.citizenId || "N/A"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedUser.phoneNumber || "N/A"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip
                    label={getStatusLabel(selectedUser.enabled)}
                    color={getStatusColor(selectedUser.enabled)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setViewDetailsDialogOpen(false)}
              sx={{
                borderRadius: 2,
                px: 3,
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create User Modal */}
        <CreateUserModal
          open={createUserModalOpen}
          onClose={() => setCreateUserModalOpen(false)}
          onSuccess={fetchUsers}
        />

        {/* Update User Modal */}
        {selectedUser && (
          <UpdateUserModal
            open={updateUserModalOpen}
            onClose={() => setUpdateUserModalOpen(false)}
            userId={selectedUser.id}
            user={selectedUser}
            onSuccess={fetchUsers}
          />
        )}
      </Paper>
    </Fade>
  );
};

