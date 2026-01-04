import React, { useState, useEffect } from "react";
import {
  Container,
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
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AppBar,
  Toolbar,
  Fade,
  Grow,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  AccountBalance as AccountBalanceIcon,
  VpnKey as VpnKeyIcon,
  ExitToApp as ExitToAppIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { accountService } from "../services/accountService";
import { useAuth } from "../context/AuthContext";
import { UpdatePinModal } from "../components/UpdatePinModal";
import { DepositModal } from "../components/DepositModal";
import { UserManagementPage } from "./UserManagementPage";
import type { Account, AccountStatus } from "../types";

export const DashboardPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Navigation state
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("accounts");
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // Modal states
  const [updatePinModalOpen, setUpdatePinModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  
  // Update status dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<AccountStatus>("ACTIVE");
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await accountService.getAllAccounts({
        page,
        size: rowsPerPage,
        sortBy: "createdAt",
        sortDirection: "desc",
      });
      setAccounts(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, rowsPerPage]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, account: Account) => {
    setAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateStatus = () => {
    if (selectedAccount) {
      setNewStatus(selectedAccount.accountStatus);
      setStatusDialogOpen(true);
      handleMenuClose();
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedAccount) return;
    
    try {
      await accountService.updateAccount(selectedAccount.accountId, { status: newStatus });
      setStatusDialogOpen(false);
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleLockAccount = async () => {
    if (!selectedAccount) return;
    
    try {
      await accountService.lockAccount(selectedAccount.accountId);
      handleMenuClose();
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to lock account");
    }
  };

  const handleUnlockAccount = async () => {
    if (!selectedAccount) return;
    
    try {
      await accountService.unlockAccount(selectedAccount.accountId);
      handleMenuClose();
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unlock account");
    }
  };

  const handleUpdatePin = () => {
    setUpdatePinModalOpen(true);
    handleMenuClose();
  };

  const handleDeposit = () => {
    setDepositModalOpen(true);
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusColor = (status: AccountStatus) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "LOCKED":
        return "error";
      case "CLOSED":
        return "default";
      default:
        return "default";
    }
  };

  const drawerWidth = 260;

  const menuItems = [
    { id: "accounts", label: "Account Management", icon: <AccountBalanceIcon /> },
    { id: "users", label: "Users", icon: <PeopleIcon /> },
    // { id: "transactions", label: "Transactions", icon: <AssignmentIcon /> },
    // { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", width: "100vw" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(!drawerOpen)}
            edge="start"
            sx={{
              mr: 2,
              transition: "all 0.3s",
              "&:hover": {
                transform: "rotate(90deg)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mr: 2,
              background: "rgba(255, 255, 255, 0.2)",
              padding: 1,
              borderRadius: 2,
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Fortress Bank Admin
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "rgba(255, 255, 255, 0.15)",
              padding: "8px 16px",
              borderRadius: 2,
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user?.username}
            </Typography>
            <Button
              color="inherit"
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.2)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRight: "none",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={currentPage === item.id}
                  onClick={() => setCurrentPage(item.id)}
                  sx={{
                    py: 1.5,
                    mx: 1,
                    mb: 1,
                    borderRadius: 2,
                    transition: "all 0.3s",
                    "&.Mui-selected": {
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.25)",
                      },
                    },
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.1)",
                      transform: "translateX(5px)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: currentPage === item.id ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          transition: "margin 0.3s",
          marginLeft: drawerOpen ? 0 : `-${drawerWidth}px`,
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {currentPage === "accounts" ? (
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
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
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
                  Account Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AccountBalanceIcon />}
                  onClick={() => setDepositModalOpen(true)}
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
                  Deposit
                </Button>
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
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Account Number</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Full Name</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Balance</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Created At</TableCell>
                      <TableCell align="right" sx={{ color: "white", fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No accounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account, index) => (
                    <Grow
                      in
                      key={account.accountId}
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
                        <TableCell sx={{ fontWeight: 500 }}>{account.accountNumber}</TableCell>
                        <TableCell>{account.fullName || "N/A"}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#667eea" }}>
                          ${account.balance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={account.accountStatus}
                            color={getStatusColor(account.accountStatus)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              borderRadius: 2,
                              px: 1,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(account.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, account)}
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
              </Paper>
            </Fade>
          ) : currentPage === "users" ? (
            <UserManagementPage />
          ) : (
            <Fade in timeout={800}>
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  minHeight: "calc(100vh - 200px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 2,
                    }}
                  >
                    {menuItems.find(item => item.id === currentPage)?.label}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Coming Soon
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          )}
        </Container>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleUpdateStatus}>Update Status</MenuItem>
        {selectedAccount?.accountStatus === "LOCKED" ? (
          <MenuItem onClick={handleUnlockAccount}>
            <LockOpenIcon sx={{ mr: 1 }} fontSize="small" />
            Unlock Account
          </MenuItem>
        ) : (
          <MenuItem onClick={handleLockAccount}>
            <LockIcon sx={{ mr: 1 }} fontSize="small" />
            Lock Account
          </MenuItem>
        )}
        <MenuItem onClick={handleUpdatePin}>
          <VpnKeyIcon sx={{ mr: 1 }} fontSize="small" />
          Update PIN
        </MenuItem>
        <MenuItem onClick={handleDeposit}>
          <AccountBalanceIcon sx={{ mr: 1 }} fontSize="small" />
          Deposit
        </MenuItem>
      </Menu>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Account Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value as AccountStatus)}
            >
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="LOCKED">LOCKED</MenuItem>
              <MenuItem value="CLOSED">CLOSED</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update PIN Modal */}
      {selectedAccount && (
        <UpdatePinModal
          open={updatePinModalOpen}
          onClose={() => setUpdatePinModalOpen(false)}
          accountId={selectedAccount.accountId}
          accountNumber={selectedAccount.accountNumber}
        />
      )}

      {/* Deposit Modal */}
      <DepositModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSuccess={fetchAccounts}
        prefilledAccountNumber={selectedAccount?.accountNumber}
      />
    </Box>
  );
};
