# Advanced Editable Data Table

A React app featuring a high-performance editable data table with inline editing, virtual scrolling, sorting, filtering, and pagination.

## Setup

1. Install dependencies:
   npm install

2. Run development server:
   bash
   npm run dev

## Approach

- React with Vite for fast development.
- Material UI for accessible components and clean styling.
- `react-window` to efficiently render large datasets.
- Inline row editing with save, cancel, and undo actions.
- Filtering, sorting, and pagination to help explore data.

## Known limitations

- Undo history is limited to the currently edited row.
- Filtering and sorting operate on client-side state only.
- Export-to-CSV is not implemented in this version.
