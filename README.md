
# 3alam Semsem Store Management System (Backend)

This is the backend API for the 3alam Semsem Store Management System. It is built with Node.js, Express, and Sequelize, providing a robust RESTful API for managing products, sales, repairs, expenses, and more.

## Features

- Full REST API for all store modules
- JWT authentication for admin users
- Product, category, sales, repair, and expense management
- Monthly statistics endpoints for dashboard analytics
- Secure, modular, and scalable codebase

## Tech Stack

- **Node.js**
- **Express.js**
- **Sequelize** (PostgreSQL/MySQL/SQLite)
- **JWT** (Authentication)
- **dotenv** (Environment config)

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- PostgreSQL/MySQL/SQLite database

### Installation

1. **Install dependencies:**
	```bash
	npm install
	```
2. **Configure environment:**
	- Copy `.env.example` to `.env` and set your database and JWT secrets.
3. **Run migrations (if needed):**
	```bash
	npx sequelize-cli db:migrate
	```
4. **Start the server:**
	```bash
	npm run dev
	```

## API Modules

- **Admin**: Authentication and user management
- **Category**: Product categories
- **Product**: Store products
- **Sale**: Sales operations
- **SaleItem**: Items within each sale
- **Repair**: Device repairs
- **Expense**: Store expenses

## Project Structure

```
src/
├── modules/
│   ├── admin/
│   ├── category/
│   ├── product/
│   ├── sale/
│   ├── saleItem/
│   ├── repair/
│   └── expense/
├── middlewares/
├── utils/
└── index.js
```

## Contribution

Contributions are welcome! Please open a Pull Request or Issue for discussion.

## License

This project is licensed under the MIT License.
