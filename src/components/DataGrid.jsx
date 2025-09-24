import * as React from 'react'; 
import { useState, useEffect } from "react";
import axios from "axios";
import config from "../config/config";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { useLocation } from "react-router-dom";
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import '../assets/DataGrid.css';

export default function DataGridDemo() {
  const location = useLocation();
  const datapath = location.state?.type;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // menu anchor
  const [selectedRow, setSelectedRow] = useState(null); // track which row clicked
  const [reload, setReload] = useState(0); // trigger reload

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
      if (!datapath) return;

      setLoading(true);
      axios.get(`${config.apiUrl}/${datapath}`)
        .then((res) => setData(res.data))
        .catch((err) => console.error("Error fetching data:", err))
        .finally(() => setLoading(false));
    }, [datapath, reload]);

  console.log("Fetched Data:", data);

  // Handle Menu
  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // Action handlers
  const handleEdit = () => {
    // Open dialog with selected row data
    setEditForm(selectedRow || {});
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`${config.apiUrl}/${datapath}/${editForm.id}`, editForm);
      setReload(r => r + 1);
    } catch (err) {
      console.error("Update failed", err);
    }
    setEditDialogOpen(false);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
  };

  const handleDelete = async () => {
    console.log("Delete clicked for row:", selectedRow);
    try {
      const response = await axios.delete(
        `${config.apiUrl}/${datapath}/${selectedRow.id}`
      );
      if (response.status === 200) {
        console.log("Data deleted successfully!");
        setReload(r => r + 1); // trigger reload
      }
    } catch (err) {
      console.warn("Selected Data not found", err);
    }
    handleMenuClose();
  };

  const handleExport = () => {
    console.log("Export clicked for row:", selectedRow);
    handleMenuClose();
  };

  // dynamic columns from data
  const dynamicColumns = Object.keys(data[0] || {})
    .filter(key => key !== 'id')
    .map((key) => ({
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      width: 180,
    }));

  // prepend action column
  const columns = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton className='action-button' onClick={(event) => handleMenuOpen(event, params.row)}>
            <MoreVertIcon />
          </IconButton>
        </>
      ),
    },
    ...dynamicColumns
  ];

  return (
    <Box sx={{ height: 600, width: '100%', position: 'relative' }}>
      {loading ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        </Box>
      ) : (
        <>
          <DataGrid
            className='custom-datagrid'
            disableColumnMenu
            rows={data}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
          />

          {/* Menu for Action column */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
            <MenuItem onClick={handleExport}>Export</MenuItem>
          </Menu>

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onClose={handleEditCancel} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Row</DialogTitle>
            <DialogContent>
              {Object.keys(editForm).filter(key => key !== 'id').map((key) => (
                <TextField
                  key={key}
                  margin="dense"
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  name={key}
                  value={editForm[key] || ''}
                  onChange={handleEditFormChange}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditCancel}>Cancel</Button>
              <Button onClick={handleEditSave} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}
