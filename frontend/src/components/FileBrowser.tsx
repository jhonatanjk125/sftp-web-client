import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import CheckIcon from "@mui/icons-material/Check";
import FolderIcon from "@mui/icons-material/Folder";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material";
import React from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  deletePaths,
  getDownloadUrl,
  listMeta,
  mkdir,
  renamePath,
  uploadFiles
} from "../api";
import type { FileInfo } from "../types";
import { basename, isRoot, joinPaths, parentDir } from "../utils/path";
import BreadcrumbsBar from "./BreadcrumbsBar";
import type { PalettePresetName } from "../palette";
import { PALETTE_OPTIONS, palettes } from "../palette";

type Props = {
  onLogout: () => void;
  onToggleTheme: () => void;
  onChangePreset: (p: PalettePresetName) => void;
  mode: "light" | "dark";
  preset: PalettePresetName;
};

type SortKey = "name" | "size" | "modified" | "type";

function humanSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(val >= 10 ? 0 : 1)} ${units[i]}`;
}

export default function FileBrowser({
  onLogout,
  onToggleTheme,
  onChangePreset,
  mode,
  preset
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [path, setPath] = React.useState<string>(".");
  const [items, setItems] = React.useState<FileInfo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [paletteAnchor, setPaletteAnchor] =
    React.useState<null | HTMLElement>(null);

  const [mkdirOpen, setMkdirOpen] = React.useState(false);
  const [mkdirName, setMkdirName] = React.useState("");
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [renameName, setRenameName] = React.useState("");
  const [moveOpen, setMoveOpen] = React.useState(false);
  const [moveTarget, setMoveTarget] = React.useState(".");

  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [dragActive, setDragActive] = React.useState(false);
  const dragCounter = React.useRef(0);

  const selectedArray = React.useMemo(
    () => Array.from(selected),
    [selected]
  );

  const sortedItems = React.useMemo(() => {
    const dirFirst = [...items].sort((a, b) => {
      if (a.is_dir && !b.is_dir) return -1;
      if (!a.is_dir && b.is_dir) return 1;
      return 0;
    });
    const cmp = (a: FileInfo, b: FileInfo): number => {
      let v = 0;
      switch (sortKey) {
        case "name":
          v = a.name.localeCompare(b.name);
          break;
        case "size":
          v = (a.size ?? 0) - (b.size ?? 0);
          break;
        case "modified":
          v =
            new Date(a.modified).getTime() -
            new Date(b.modified).getTime();
          break;
        case "type":
          v = Number(a.is_dir) - Number(b.is_dir);
          break;
      }
      return sortDir === "asc" ? v : -v;
    };
    return dirFirst.sort(cmp);
  }, [items, sortKey, sortDir]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const data = await listMeta(path);
      setItems(data);
      setSelected(new Set());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void refresh();
  }, [path]);

  function handleToggleAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      const all = new Set(
        items.map((it) => joinPaths(path, it.name))
      );
      setSelected(all);
    } else {
      setSelected(new Set());
    }
  }

  function handleToggleOne(p: string) {
    const next = new Set(selected);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setSelected(next);
  }

  function goUp() {
    if (!isRoot(path)) setPath(parentDir(path));
  }

  function openDir(name: string) {
    setPath(joinPaths(path, name));
  }

  function beginRename() {
    if (selected.size !== 1) return;
    const p = selectedArray[0];
    setRenameName(basename(p));
    setRenameOpen(true);
  }

  async function doRename() {
    const oldPath = selectedArray[0];
    if (!oldPath) return;
    const newPath = joinPaths(parentDir(oldPath), renameName);
    try {
      await renamePath(oldPath, newPath);
      setRenameOpen(false);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function doMkdir() {
    try {
      const full = joinPaths(path, mkdirName);
      await mkdir(full);
      setMkdirOpen(false);
      setMkdirName("");
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function doMoveBatch() {
    try {
      for (const p of selectedArray) {
        const newP = joinPaths(moveTarget, basename(p));
        await renamePath(p, newP);
      }
      setMoveOpen(false);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function doDeleteBatch() {
    if (selected.size === 0) return;
    const ok = window.confirm(
      `Delete ${selected.size} selected item(s)? This is ` +
        `recursive for directories.`
    );
    if (!ok) return;
    try {
      const result = await deletePaths(selectedArray);
      if (result.failed.length > 0) {
        setError(
          `Failed: ${result.failed
            .map((f) => `${f.path} (${f.error})`)
            .join(", ")}`
        );
      }
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function downloadUrlInIframe(url: string) {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {
        /* noop */
      }
    }, 20000);
  }

  function doDownloadSelected() {
    if (selected.size === 0) return;
    for (const p of selectedArray) {
      const url = getDownloadUrl(p);
      downloadUrlInIframe(url);
    }
  }

  async function handleFilesAdded(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      await uploadFiles(path, Array.from(files));
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current += 1;
    setDragActive(true);
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setDragActive(false);
      dragCounter.current = 0;
    }
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    dragCounter.current = 0;
    void handleFilesAdded(e.dataTransfer.files);
  }

  const allChecked =
    items.length > 0 &&
    items.every((it) => selected.has(joinPaths(path, it.name)));
  const indeterminate = selected.size > 0 && !allChecked;

  const brand = palettes[preset].gradients.brand;

  const btnSx = { width: { xs: "100%", sm: "auto" } };

  // Mobile card item renderer
  function MobileFileCard(it: FileInfo) {
    const full = joinPaths(path, it.name);
    const checked = selected.has(full);
    return (
      <Paper
        key={full}
        variant="outlined"
        sx={{
          p: 1.25,
          mb: 1,
          borderRadius: 2,
          borderColor: checked
            ? (t) => alpha(t.palette.primary.main, 0.5)
            : undefined,
          backgroundColor: checked
            ? (t) => alpha(t.palette.primary.main, 0.06)
            : undefined
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          onClick={() => (it.is_dir ? openDir(it.name) : undefined)}
          sx={{ cursor: it.is_dir ? "pointer" : "default" }}
        >
          <Checkbox
            checked={checked}
            onClick={(e) => e.stopPropagation()}
            onChange={() => handleToggleOne(full)}
            sx={{ mr: 0.5 }}
          />
          {it.is_dir ? (
            <FolderIcon color="primary" />
          ) : (
            <InsertDriveFileIcon />
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              noWrap
              title={it.name}
              sx={{ fontWeight: 600 }}
            >
              {it.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7 }}
              noWrap
              title={new Date(it.modified).toLocaleString()}
            >
              {it.is_dir ? "Directory" : humanSize(it.size)} •{" "}
              {new Date(it.modified).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <AppBar position="sticky" elevation={0}>
        <Toolbar
          sx={{
            borderBottom: (t) =>
              `1px solid ${alpha(
                "#000",
                t.palette.mode === "dark" ? 0.26 : 0.08
              )}`,
            backdropFilter: "blur(12px)"
          }}
        >
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 900,
              background: brand,
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: 0.6,
              animation: "gradientShift 8s ease-in-out infinite alternate"
            }}
          >
            SFTP Web Client
          </Typography>

          <Tooltip
            arrow
            title={
              mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <IconButton onClick={onToggleTheme} sx={{ mr: 0.5 }}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip arrow title="Color palette">
          <IconButton
              onClick={(e) => setPaletteAnchor(e.currentTarget)}
              sx={{ mr: 0.5 }}
            >
              <ColorLensIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={paletteAnchor}
            open={Boolean(paletteAnchor)}
            onClose={() => setPaletteAnchor(null)}
          >
            {PALETTE_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.name}
                onClick={() => {
                  onChangePreset(opt.name);
                  setPaletteAnchor(null);
                }}
              >
                <ListItemIcon>
                  {preset === opt.name ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <span style={{ width: 24 }} />
                  )}
                </ListItemIcon>
                <ListItemText>{opt.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>

          <Tooltip title="More">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onLogout();
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        p={2}
        pt={1.5}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        sx={{ position: "relative" }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          justifyContent="space-between"
          mb={2}
        >
          <BreadcrumbsBar path={path} onNavigate={(p) => setPath(p)} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            useFlexGap
            flexWrap={{ sm: "wrap" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              hidden
              onChange={(e) => handleFilesAdded(e.target.files)}
            />

            <Button
              startIcon={<UploadFileIcon />}
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              sx={btnSx}
            >
              Upload
            </Button>
            <Button
              startIcon={<CreateNewFolderIcon />}
              onClick={() => setMkdirOpen(true)}
              color="secondary"
              variant="contained"
              sx={btnSx}
            >
              New Folder
            </Button>
            <Button
              startIcon={<DriveFileRenameOutlineIcon />}
              disabled={selected.size !== 1}
              onClick={beginRename}
              variant="outlined"
              sx={btnSx}
            >
              Rename
            </Button>
            <Button
              startIcon={<DriveFileMoveIcon />}
              disabled={selected.size === 0}
              onClick={() => {
                setMoveTarget(path);
                setMoveOpen(true);
              }}
              variant="outlined"
              sx={btnSx}
            >
              Move To...
            </Button>
            <Button
              startIcon={<CloudDownloadIcon />}
              disabled={selected.size === 0}
              onClick={doDownloadSelected}
              variant="outlined"
              sx={btnSx}
            >
              Download
            </Button>

            {isXs ? (
              <Button
                startIcon={<RefreshIcon />}
                onClick={() => refresh()}
                variant="outlined"
                sx={btnSx}
              >
                Refresh
              </Button>
            ) : (
              <IconButton onClick={() => refresh()}>
                <RefreshIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>

        {uploading && (
          <Box mb={1}>
            <LinearProgress />
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Uploading...
            </Typography>
          </Box>
        )}

        {loading && <LinearProgress />}

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ my: 1 }}
          >
            {error}
          </Alert>
        )}

        {/* Mobile: card view */}
        {isXs ? (
          <Box>
            {!isRoot(path) && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.25,
                  mb: 1,
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: (t) => alpha("#000", 0.04)
                  }
                }}
                onClick={goUp}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 40 }} />
                  <FolderIcon fontSize="small" />
                  <Typography variant="body2">..</Typography>
                </Stack>
              </Paper>
            )}
            {sortedItems.map((it) => MobileFileCard(it))}
            {sortedItems.length === 0 && (
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
                <Stack spacing={1} alignItems="center" sx={{ opacity: 0.7 }}>
                  <DriveFolderUploadIcon />
                  <Typography variant="body2">
                    This folder is empty. Upload files or create a folder.
                  </Typography>
                </Stack>
              </Paper>
            )}
          </Box>
        ) : (
          // Desktop/tablet: table view with horizontal scroll if needed
          <TableContainer
            component={Paper}
            sx={{
              mt: 1,
              overflowX: "auto",
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch",
              borderRadius: 2
            }}
          >
            <Table size="small" stickyHeader sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={indeterminate}
                      checked={allChecked}
                      onChange={handleToggleAll}
                    />
                  </TableCell>
                  <TableCell
                    sx={{ cursor: "pointer", minWidth: 220 }}
                    onClick={() => {
                      setSortKey("name");
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      cursor: "pointer",
                      width: 120,
                      whiteSpace: "nowrap"
                    }}
                    onClick={() => {
                      setSortKey("size");
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    }}
                  >
                    Size
                  </TableCell>
                  <TableCell
                    sx={{
                      cursor: "pointer",
                      width: 220,
                      minWidth: 200,
                      whiteSpace: "nowrap"
                    }}
                    onClick={() => {
                      setSortKey("modified");
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    }}
                  >
                    Modified
                  </TableCell>
                  <TableCell
                    sx={{ cursor: "pointer", width: 120, minWidth: 100 }}
                    onClick={() => {
                      setSortKey("type");
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    }}
                  >
                    Type
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {!isRoot(path) && (
                  <TableRow
                    hover
                    onDoubleClick={goUp}
                    sx={{ userSelect: "none", cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox" />
                    <TableCell colSpan={4}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <FolderIcon fontSize="small" />
                        <Typography variant="body2">..</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}

                {sortedItems.map((it) => {
                  const full = joinPaths(path, it.name);
                  const checked = selected.has(full);
                  return (
                    <TableRow
                      key={full}
                      hover
                      sx={{
                        userSelect: "none",
                        cursor: it.is_dir ? "pointer" : "default",
                        transition: "background-color .15s ease",
                        ...(checked && {
                          backgroundColor: (t) =>
                            alpha(t.palette.primary.main, 0.1)
                        }),
                        "&:hover": {
                          backgroundColor: (t) => alpha("#000", 0.05)
                        }
                      }}
                      onDoubleClick={() =>
                        it.is_dir ? openDir(it.name) : null
                      }
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={checked}
                          onChange={() => handleToggleOne(full)}
                        />
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          onClick={() =>
                            it.is_dir ? openDir(it.name) : null
                          }
                        >
                          {it.is_dir ? (
                            <FolderIcon color="primary" />
                          ) : (
                            <InsertDriveFileIcon />
                          )}
                          <Typography variant="body2">
                            {it.name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        {it.is_dir ? "-" : humanSize(it.size)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {new Date(it.modified).toLocaleString()}
                      </TableCell>

                      <TableCell>
                        {it.is_dir ? "Directory" : "File"}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {sortedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Stack
                        py={4}
                        spacing={1}
                        alignItems="center"
                        sx={{ opacity: 0.7 }}
                      >
                        <DriveFolderUploadIcon />
                        <Typography variant="body2">
                          This folder is empty. Upload files or create a
                          folder.
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {dragActive && (
          <Box
            sx={{
              position: "absolute",
              inset: 8,
              borderRadius: 14,
              border: (t) =>
                `2px dashed ${alpha(t.palette.primary.main, 0.6)}`,
              background: (t) =>
                `linear-gradient(135deg, ${alpha(
                  t.palette.primary.main,
                  0.16
                )}, ${alpha(t.palette.secondary.main, 0.12)})`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: (t) =>
                alpha("#000", t.palette.mode === "dark" ? 0.1 : 0.6),
              pointerEvents: "none",
              zIndex: 10
            }}
          >
            <Stack spacing={1} alignItems="center">
              <UploadFileIcon />
              <Typography variant="body2">
                Drop files to upload to {path}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>

      <Dialog open={mkdirOpen} onClose={() => setMkdirOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Folder name"
            value={mkdirName}
            onChange={(e) => setMkdirName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMkdirOpen(false)}>Cancel</Button>
          <Button
            onClick={doMkdir}
            disabled={!mkdirName.trim()}
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}>
        <DialogTitle>Rename</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="New name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button
            onClick={doRename}
            disabled={!renameName.trim()}
            variant="contained"
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={moveOpen} onClose={() => setMoveOpen(false)}>
        <DialogTitle>Move To</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Destination directory"
            value={moveTarget}
            onChange={(e) => setMoveTarget(e.target.value)}
            helperText="Provide a destination path (e.g., ./target or /dir)"
          />
          <Divider sx={{ my: 2 }} />
          <Alert severity="info">
            Move uses rename on the server for each selected item. If a
            destination already exists, the server may reject it.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveOpen(false)}>Cancel</Button>
          <Button
            onClick={doMoveBatch}
            disabled={!moveTarget.trim() || selected.size === 0}
            variant="contained"
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}