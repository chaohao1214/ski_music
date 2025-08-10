import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
} from "@mui/material";
import { useEffect } from "react";
import { changeUerRole, fetchAllUsers } from "../features/admin/usersSlice";
import { ROLE_OPTIONS } from "../pages/roles";

const AdminUserManagement = () => {
  const dispatch = useDispatch();
  const { list: users, status, error } = useSelector((state) => state.admin);
  const currentUser = useSelector((state) => state.auth?.user);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Manager Users
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 1 }}>
          {String(error)}
        </Typography>
      )}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell width={280}>Change Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const isSelf = currentUser?.id === user.id;
              const disableSelfDemote = isSelf && user.role === "admin";
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={user.role}
                      onChange={(event) =>
                        dispatch(
                          changeUerRole({
                            userId: user.id,
                            role: event.target.value,
                          })
                        )
                      }
                      disabled={status === "loading" || disableSelfDemote}
                      sx={{ minWidth: 220 }}
                    >
                      {ROLE_OPTIONS.map((roleOption) => (
                        <MenuItem
                          key={roleOption.value}
                          value={roleOption.value}
                        >
                          {roleOption.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
            {status === "loading" && (
              <TableRow>
                <TableCell colSpan={3}>Loading...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminUserManagement;
