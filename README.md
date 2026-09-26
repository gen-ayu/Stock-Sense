# Stock-Sense 📦

Stock-Sense is an intuitive, modern Inventory and Warehouse Management System designed to streamline stock operations, deliveries, receipts, and internal transfers with real-time tracking and traceability.

---

## 🚀 Overview

Stock-Sense provides end-to-end visibility across warehouse operations:
- **Receipts Management**: Manage incoming shipments, vendor deliveries, and stock intake.
- **Delivery Orders**: Handle customer dispatches, order fulfillment, and automated stock validation.
- **Move History**: Complete audit trail and tracking of all stock movements between locations (In/Out events).
- **Stock & Inventory**: Real-time on-hand vs. free-to-use stock levels with unit costs and automated reordering triggers.
- **Multi-Warehouse & Locations**: Hierarchical warehouse management with custom zones, racks, and rooms.

---

## 📋 Key Features & Architecture

### 1. Operations & Workflows
- **Receipts (`WH/IN/xxxx`)**:
  - Lifecycle: `Draft` ➔ `Ready` ➔ `Done`
  - Receive items from vendors, validate quantities, and print delivery receipts.
- **Delivery Orders (`WH/OUT/xxxx`)**:
  - Lifecycle: `Draft` ➔ `Waiting` ➔ `Ready` ➔ `Done`
  - Automated stock reservation and out-of-stock alerts.
- **Sequential Auto-Increment Numbering**:
  - Format: `<Warehouse>/<Operation>/<ID>` (e.g. `WH/IN/0001`, `WH/OUT/0001`)

### 2. Dual Views
- **List View**: Comprehensive tabular view with search, filter, and sorting by reference, partner/contact, and schedule date.
- **Kanban View**: Visual board to track orders by their operational status.

### 3. Move History
- Detailed ledger recording stock moves between source and destination locations.
- Color-coded visual cues:
  - 🟢 **Green**: Inbound stock moves
  - 🔴 **Red**: Outbound stock moves

### 4. User Access & Security
- Secure authentication system with role-based validation.
- Robust sign-up validation rules (unique Login ID, valid email, strong password enforcement).

---

## 🎨 Design & Specifications

- **Wireframes & Flows**: [`StockSense - 8 hours.excalidraw`](./StockSense%20-%208%20hours.excalidraw) (view or edit at [Excalidraw](https://excalidraw.com))
- **Specification Document**: [`StockSense.pdf`](./StockSense.pdf)

---

## 🛠️ Getting Started

*(Project implementation in progress)*
