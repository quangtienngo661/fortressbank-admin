import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Fade,
  Chip,
  Stack,
  type SelectChangeEvent,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Lock as LockIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { dashboardService } from "../services/dashboardService";
import type { DashboardStatisticsResponse, PeriodType } from "../types";

// Color palette
const COLORS = {
  primary: "#1976d2",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: "#0288d1",
  purple: "#9c27b0",
  teal: "#00897b",
  orange: "#f57c00",
  pink: "#c2185b",
};

const CHART_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.error, COLORS.purple];

// Format currency to USD
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format number with comma separators
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

// Format percentage
const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, subtitle, trend }) => {
  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
          border: `1px solid ${color}60`,
        },
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={color} sx={{ mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Chip
                icon={trend.isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${trend.value}%`}
                size="small"
                color={trend.isPositive ? "success" : "error"}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const DashboardStatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<DashboardStatisticsResponse | null>(null);
  const [period, setPeriod] = useState<PeriodType>("TODAY");

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getStatistics({ period });
      console.log("Dashboard API Response:", data);
      setStatistics(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
      console.error("Error fetching statistics:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handlePeriodChange = (event: SelectChangeEvent<PeriodType>) => {
    setPeriod(event.target.value as PeriodType);
  };

  const handleRefresh = () => {
    fetchStatistics();
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!statistics) {
    return null;
  }

  // Prepare data for transaction status chart
  const statusData = [
    { name: "Successful", value: statistics.successfulTransactions, color: COLORS.success },
    { name: "Failed", value: statistics.failedTransactions, color: COLORS.error },
    { name: "Pending", value: statistics.pendingTransactions, color: COLORS.warning },
  ];

  // Prepare data for transaction type chart
  const typeData = [
    { name: "Internal Transfers", value: statistics.internalTransfers },
    { name: "External Transfers", value: statistics.externalTransfers },
    { name: "Deposits", value: statistics.deposits },
    { name: "Withdrawals", value: statistics.withdrawals },
    { name: "Bill Payments", value: statistics.billPayments },
  ].filter(item => item.value > 0);

  // Prepare data for account status chart
  const accountData = [
    { name: "Active", value: statistics.accountStats.activeAccounts, color: COLORS.success },
    { name: "Locked", value: statistics.accountStats.lockedAccounts, color: COLORS.warning },
    { name: "Closed", value: statistics.accountStats.closedAccounts, color: COLORS.error },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={500}>
        <Box>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                📊 Dashboard Statistics
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {statistics.periodLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(statistics.startDate).toLocaleDateString("en-US")} - {new Date(statistics.endDate).toLocaleDateString("en-US")}
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel>Period</InputLabel>
                <Select value={period} onChange={handlePeriodChange} label="Period">
                  <MenuItem value="TODAY">Today</MenuItem>
                  <MenuItem value="THIS_WEEK">This Week</MenuItem>
                  <MenuItem value="THIS_MONTH">This Month</MenuItem>
                  <MenuItem value="THIS_YEAR">This Year</MenuItem>
                </Select>
              </FormControl>
              <IconButton onClick={handleRefresh} color="primary" size="large">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Transaction Metrics */}
          <Box display="flex" gap={3} mb={4} flexWrap="wrap">
            <Box flex="1" minWidth={250}>
              <MetricCard
                title="Total Transactions"
                value={formatNumber(statistics.totalTransactions)}
                icon={<ReceiptIcon sx={{ color: "white", fontSize: 32 }} />}
                color={COLORS.primary}
                subtitle="All transactions"
              />
            </Box>
            <Box flex="1" minWidth={250}>
              <MetricCard
                title="Successful"
                value={formatNumber(statistics.successfulTransactions)}
                icon={<CheckCircleIcon sx={{ color: "white", fontSize: 32 }} />}
                color={COLORS.success}
                subtitle={formatPercentage(statistics.successfulTransactions, statistics.totalTransactions)}
              />
            </Box>
            <Box flex="1" minWidth={250}>
              <MetricCard
                title="Failed"
                value={formatNumber(statistics.failedTransactions)}
                icon={<ErrorIcon sx={{ color: "white", fontSize: 32 }} />}
                color={COLORS.error}
                subtitle={formatPercentage(statistics.failedTransactions, statistics.totalTransactions)}
              />
            </Box>
            <Box flex="1" minWidth={250}>
              <MetricCard
                title="Pending"
                value={formatNumber(statistics.pendingTransactions)}
                icon={<HourglassEmptyIcon sx={{ color: "white", fontSize: 32 }} />}
                color={COLORS.warning}
                subtitle={formatPercentage(statistics.pendingTransactions, statistics.totalTransactions)}
              />
            </Box>
          </Box>

          {/* Financial Metrics */}
          <Box display="flex" gap={3} mb={4} flexWrap="wrap">
            <Box flex="1" minWidth={300}>
              <MetricCard
                title="Total Volume"
                value={formatCurrency(statistics.totalVolume)}
                icon={<AccountBalanceIcon sx={{ color: "white", fontSize: 32 }} />}
                color={COLORS.teal}
                subtitle="Total transaction value"
              />
            </Box>
            <Box flex="1" minWidth={300}>
              <MetricCard
                title="Total Fees"
                value={formatCurrency(statistics.totalFees)}
                icon={<ReceiptIcon sx={{ color: "white", fontSize: 32 }} />}
                color={COLORS.orange}
                subtitle="Transaction fees earned"
              />
            </Box>
            <Box flex="1" minWidth={300}>
              <MetricCard
                title="Average Transaction"
                value={formatCurrency(statistics.averageTransactionAmount)}
                icon={<TrendingUpIcon sx={{ color: "white", fontSize: 32 }} />}
                color={COLORS.purple}
                subtitle="Average per transaction"
              />
            </Box>
          </Box>

          {/* Charts */}
          <Box display="flex" gap={3} mb={4} flexWrap="wrap">
            {/* Transaction Status Chart */}
            <Box flex="1" minWidth={500}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Transaction Status
                </Typography>
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>

            {/* Transaction Type Chart */}
            <Box flex="1" minWidth={500}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Transaction Types
                </Typography>
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]}>
                        {typeData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Account Statistics */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom mb={3}>
              Account Statistics
            </Typography>
            <Box display="flex" gap={3} flexWrap="wrap">
              <Box flex="1" minWidth={200}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      backgroundColor: `${COLORS.info}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      mb: 2,
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 40, color: COLORS.info }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={COLORS.info}>
                    {formatNumber(statistics.accountStats.totalAccounts)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Accounts
                  </Typography>
                </Box>
              </Box>
              <Box flex="1" minWidth={200}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      backgroundColor: `${COLORS.success}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      mb: 2,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 40, color: COLORS.success }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={COLORS.success}>
                    {formatNumber(statistics.accountStats.activeAccounts)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active ({formatPercentage(statistics.accountStats.activeAccounts, statistics.accountStats.totalAccounts)})
                  </Typography>
                </Box>
              </Box>
              <Box flex="1" minWidth={200}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      backgroundColor: `${COLORS.warning}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      mb: 2,
                    }}
                  >
                    <LockIcon sx={{ fontSize: 40, color: COLORS.warning }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={COLORS.warning}>
                    {formatNumber(statistics.accountStats.lockedAccounts)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Locked ({formatPercentage(statistics.accountStats.lockedAccounts, statistics.accountStats.totalAccounts)})
                  </Typography>
                </Box>
              </Box>
              <Box flex="1" minWidth={200}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      backgroundColor: `${COLORS.error}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      mb: 2,
                    }}
                  >
                    <BlockIcon sx={{ fontSize: 40, color: COLORS.error }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={COLORS.error}>
                    {formatNumber(statistics.accountStats.closedAccounts)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Closed ({formatPercentage(statistics.accountStats.closedAccounts, statistics.accountStats.totalAccounts)})
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Account Donut Chart */}
            <Box height={300} mt={4}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accountData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                    dataKey="value"
                  >
                    {accountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};
