import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EditableTable from './components/EditableTable.jsx';

function App() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Advanced Editable Data Table
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Inline editing, virtual scrolling, sorting, filtering, and pagination for large datasets.
        </Typography>
      </Box>
      <EditableTable />
    </Container>
  );
}

export default App;
