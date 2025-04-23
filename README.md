# 🛠️ Mini Form Builder

A mini form builder built with **Next.js App Router**, **Tailwind CSS**, **shadcn/ui**, **PostgreSQL**, **Prisma**, and **Docker**. Users can dynamically create, preview, and save forms with custom fields.

---

## 🚀 Features

- ✨ Create forms with title and description
- 🔧 Add dynamic fields (Text, Textarea, Select, Checkbox, Radio)
- ✅ Form field validation using Zod + React Hook Form
- 📦 Persist forms and fields in PostgreSQL with Prisma
- 🎨 Responsive and accessible UI using Tailwind + shadcn/ui
- 🧪 Unit tested with Jest + Testing Library
- 🐳 Dockerized for easy local development

---

## 🧱 Tech Stack

| Tech         | Purpose                              |
|--------------|--------------------------------------|
| Next.js      | Framework (App Router + TypeScript)  |
| Tailwind CSS | Styling                              |
| shadcn/ui    | UI components                        |
| Prisma       | ORM for PostgreSQL                   |
| PostgreSQL   | Database                             |
| Docker       | Containerized DB setup               |
| React Hook Form + Zod | Form management + validation |
| Jest         | Testing                              |

---

## 📦 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/augani/form-builder.git
cd form-builder
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start PostgreSQL with Docker
```bash
docker-compose up -d
```

### 4. Set up your database
```bash
npx prisma migrate dev --name init
```

### 5. Run the development server
```bash
npm run dev
```

---

## 🧪 Running Tests

```bash
npm test
```

Tests are written using **Jest** and **@testing-library/react**.

---

## 🗂️ Folder Structure (Simplified)

```
.
├── app/                 # Next.js App Router
│   └── builder/         # Form builder page
├── components/
│   ├── form-builder/    # Custom builder components
│   └── ui/              # shadcn/ui components
├── lib/                 # Prisma client, schemas, utils
├── prisma/              # Prisma schema + migrations
├── __tests__/           # Unit tests
├── docker-compose.yml
└── README.md
```

---

## 📥 API & Persistence

All forms and fields are persisted in a PostgreSQL database using Prisma. You can extend this to support:
- Form submissions
- Role-based access
- Public vs private forms

---

## 📌 TODO (Optional Enhancements)

- [ ] Field reordering (drag & drop)
- [ ] Export/import form JSON
- [ ] Live preview while building
- [ ] Deploy on Vercel
- [ ] Add i18n support

---

## 📧 Contact

For questions, feel free to reach out at [augustusniiotu@icloud.com](mailto:augustusniiotu@icloud.com) or connect via [GitHub](https://github.com/augani).

---

## 📝 License

MIT — do whatever you want with it.