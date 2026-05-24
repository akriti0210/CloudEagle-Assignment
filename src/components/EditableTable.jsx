import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';

const COLUMN_CONFIG = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'salary', label: 'Salary', type: 'number' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
];

function createRow(index) {
  return {
    id: index + 1,
    name: `Employee ${index + 1}`,
    email: `employee${index + 1}@example.com`,
    salary: Math.floor(50000 + Math.random() * 90000),
    quantity: Math.floor(Math.random() * 250),
  };
}

function buildDataset(size) {
  return Array.from({ length: size }, (_, index) => createRow(index));
}

const ROW_HEIGHT = 56;
const PAGE_SIZE = 100;

function EditableTable() {
  const [tableData, setTableData] = useState(() => buildDataset(10000));
  const [filterValues, setFilterValues] = useState({ name: '', email: '', salary: '', quantity: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [page, setPage] = useState(0);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [savedHistory, setSavedHistory] = useState({});
  const [unsavedRows, setUnsavedRows] = useState({});
  const originalDataRef = useRef({});

  useEffect(() => {
    if (!originalDataRef.current.initial) {
      originalDataRef.current.initial = tableData.reduce((acc, row) => {
        acc[row.id] = { ...row };
        return acc;
      }, {});
    }
  }, [tableData]);

  useEffect(() => {
    const beforeUnload = (event) => {
      const hasUnsaved = Object.keys(unsavedRows).length > 0;
      if (hasUnsaved) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [unsavedRows]);

  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      return COLUMN_CONFIG.every(({ key, type }) => {
        const filterValue = filterValues[key].trim();
        if (!filterValue) return true;
        const cellValue = String(row[key]);
        if (type === 'number') {
          return cellValue.includes(filterValue);
        }
        return cellValue.toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [tableData, filterValues]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    const { key, direction } = sortConfig;
    sorted.sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      return direction === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
    return sorted;
  }, [filteredData, sortConfig]);

  const pageCount = Math.ceil(sortedData.length / PAGE_SIZE);
  const pageData = sortedData.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleFilterChange = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const startEdit = (row) => {
    setEditingRowId(row.id);
    setEditValues({ ...row });
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditValues({});
  };

  const saveEdit = (rowId) => {
    setTableData((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        setSavedHistory((history) => ({ ...history, [rowId]: { ...row } }));
        return { ...row, ...editValues };
      })
    );
    setUnsavedRows((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
    setEditingRowId(null);
    setEditValues({});
  };

  const undoRow = (rowId) => {
    setTableData((current) =>
      current.map((row) => {
        if (row.id !== rowId || !savedHistory[rowId]) return row;
        return { ...savedHistory[rowId] };
      })
    );
    setSavedHistory((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const onFieldChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: key === 'salary' || key === 'quantity' ? Number(value) : value }));
    if (editingRowId) {
      setUnsavedRows((prev) => ({ ...prev, [editingRowId]: true }));
    }
  };

  const Row = ({ index, style }) => {
    const row = pageData[index];
    if (!row) return null;
    const isEditing = editingRowId === row.id;
    return (
      <TableRow style={style} key={row.id} hover>
        <TableCell>{row.id}</TableCell>
        {COLUMN_CONFIG.map(({ key, type, label }) => (
          <TableCell key={key} sx={{ minWidth: 150 }}>
            {isEditing ? (
              <TextField
                size="small"
                fullWidth
                type={type === 'number' ? 'number' : 'text'}
                value={editValues[key] ?? ''}
                onChange={(event) => onFieldChange(key, event.target.value)}
              />
            ) : (
              row[key]
            )}
          </TableCell>
        ))}
        <TableCell align="right">
          {isEditing ? (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={() => saveEdit(row.id)}>
                Save
              </Button>
              <Button size="small" variant="outlined" startIcon={<CancelIcon />} onClick={cancelEdit}>
                Cancel
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => startEdit(row)}>
                Edit
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<UndoIcon />}
                disabled={!savedHistory[row.id]}
                onClick={() => undoRow(row.id)}
              >
                Undo
              </Button>
            </Stack>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Table Controls</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {COLUMN_CONFIG.map(({ key, label }) => (
              <TextField
                key={key}
                label={`Filter ${label}`}
                value={filterValues[key]}
                size="small"
                onChange={(event) => handleFilterChange(key, event.target.value)}
              />
            ))}
            <Button variant="outlined" onClick={() => setFilterValues({ name: '', email: '', salary: '', quantity: '' })}>
              Clear Filters
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                {COLUMN_CONFIG.map(({ key, label }) => (
                  <TableCell key={key} sortDirection={sortConfig.key === key ? sortConfig.direction : false}>
                    <Button
                      onClick={() => toggleSort(key)}
                      endIcon={sortConfig.key === key ? sortConfig.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon /> : null}
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      {label}
                    </Button>
                  </TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>

        <Box sx={{ height: 560, overflow: 'auto' }}>
          <List
            height={560}
            itemCount={pageData.length}
            itemSize={ROW_HEIGHT}
            width="100%"
          >
            {({ index, style }) => {
              const row = pageData[index];
              if (!row) return null;
              const isEditing = editingRowId === row.id;
              return (
                <div style={style} key={row.id}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', px: 2, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                  >
                    <Box sx={{ width: 80 }}>{row.id}</Box>
                    {COLUMN_CONFIG.map(({ key, type }) => (
                      <Box key={key} sx={{ minWidth: 150, flex: '1 0 150px', px: 1 }}>
                        {isEditing ? (
                          <TextField
                            size="small"
                            fullWidth
                            type={type === 'number' ? 'number' : 'text'}
                            value={editValues[key] ?? ''}
                            onChange={(event) => onFieldChange(key, event.target.value)}
                          />
                        ) : (
                          row[key]
                        )}
                      </Box>
                    ))}
                    <Box sx={{ ml: 'auto' }}>
                      {isEditing ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={() => saveEdit(row.id)}>
                            Save
                          </Button>
                          <Button size="small" variant="outlined" startIcon={<CancelIcon />} onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => startEdit(row)}>
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<UndoIcon />}
                            disabled={!savedHistory[row.id]}
                            onClick={() => undoRow(row.id)}
                          >
                            Undo
                          </Button>
                        </Stack>
                      )}
                    </Box>
                  </Box>
                </div>
              );
            }}
          </List>
        </Box>
      </Paper>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Typography>
          Showing {pageData.length} of {sortedData.length} rows. Page {page + 1} of {pageCount}.
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button disabled={page === 0} onClick={() => setPage((prev) => Math.max(prev - 1, 0))}>
            Previous
          </Button>
          <Button disabled={page >= pageCount - 1} onClick={() => setPage((prev) => Math.min(prev + 1, pageCount - 1))}>
            Next
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default EditableTable;
