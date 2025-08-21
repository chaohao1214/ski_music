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
  Stack,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useEffect } from "react";
import {
  changeUerRolesBulk,
  fetchAllUsers,
} from "../features/admin/usersSlice";
import { formatRole, ROLE_OPTIONS } from "../pages/roles";
import { useState } from "react";
import { useMemo } from "react";
import BackButton from "./BackButton";

const AdminUserManagement = () => {
  const dispatch = useDispatch();
  const { list: users, status, error } = useSelector((state) => state.admin);
  const currentUser = useSelector((state) => state.auth?.user);

  const [localSelections, setLocalSelections] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers())
      .unwrap()
      .then((fetched) => {
        const initialMap = {};
        (fetched || []).forEach((userItem) => {
          initialMap[userItem.id] = userItem.role;
        });
        setLocalSelections(initialMap);
      });
  }, [dispatch]);

  const pendingChanges = useMemo(() => {
    const changes = [];
    for (const userItem of users) {
      const selectedRole = localSelections[userItem.id];
      if (selectedRole && selectedRole !== userItem.role) {
        changes.push({ userId: userItem.id, role: selectedRole });
      }
    }
    return changes;
  }, [users, localSelections]);

  const hasChanges = pendingChanges.length > 0;

  const handleSelectChange = (userId, nextRole) => {
    setLocalSelections((previous) => ({ ...previous, [userId]: nextRole }));
  };

  const handleSaveAndApply = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      await dispatch(changeUerRolesBulk(pendingChanges)).unwrap();

      const refreshed = await dispatch(fetchAllUsers()).unwrap();
      const resetMap = {};
      (refreshed || []).forEach((userItem) => {
        resetMap[userItem.id] = userItem.role;
      });
      setLocalSelections(resetMap);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <BackButton to="/remote" label="Back" />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Manage Users</Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {hasChanges && (
            <Chip
              color="warning"
              size="small"
              label={`${pendingChanges.length} unsaved`}
            />
          )}
          <Button
            variant="contained"
            onClick={handleSaveAndApply}
            disabled={!hasChanges || isSaving || status === "loading"}
          >
            {isSaving ? <CircularProgress size={18} /> : "Save & Apply"}
          </Button>
        </Stack>
      </Stack>

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
              <TableCell width={280}>Change Role (local)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((userItem) => {
              const isSelf = currentUser?.id === userItem.id;
              const preventSelfDemote = isSelf && userItem.role === "admin";
              const currentSelectedRole =
                localSelections[userItem.id] ?? userItem.role;

              return (
                <TableRow key={userItem.id}>
                  <TableCell>{userItem.username}</TableCell>

                  <TableCell>{formatRole(userItem.role)}</TableCell>

                  <TableCell>
                    <Select
                      size="small"
                      value={currentSelectedRole}
                      onChange={(event) =>
                        handleSelectChange(userItem.id, event.target.value)
                      }
                      disabled={
                        status === "loading" || isSaving || preventSelfDemote
                      }
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
                <TableCell colSpan={3}>
                  <Stack direction="row" gap={1} alignItems="center">
                    <CircularProgress size={18} />
                    <Typography variant="body2">Loading...</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminUserManagement;
