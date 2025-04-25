# 🛠️ SnapForm

A modern, feature-rich form builder built with **Next.js App Router**, **Tailwind CSS**, **shadcn/ui**, **PostgreSQL**, **Prisma**, and **Docker**. Create beautiful, interactive forms with advanced customization options and analytics.

> 💡 **Fun Fact**: This entire project was built in just 15 hours! (7 hours on day one, 8 hours on day two) ⚡️
> 
> Built with ❤️ by [Augustus Otu](https://github.com/augani) who believes in creating powerful tools that are both beautiful and functional.

![SnapForm Screenshot](./screenshot.png)

---

## 🚀 Features

### Core Form Building
- ✨ Create forms with customizable titles and descriptions
- 🔧 Support for multiple field types:
  - Text (Single line)
  - Email
  - Number
  - Textarea (Multi-line)
  - Select (Dropdown)
  - Radio buttons
  - Checkboxes
  - Date picker
- ✅ Advanced form validation using Zod + React Hook Form
- 🔄 Field reordering with drag-and-drop functionality
- 📊 Form analytics and response tracking

![Live Preview](./public/snapform/live-preview.png)

### Styling & Customization
- 🎨 Theme customization:
  - Custom color schemes
  - Font family selection
  - Border radius control
  - Spacing options
- 🎭 Multiple form layouts:
  - Standard
  - Card
  - Stepper
  - Conversational
  - Compact
  - Grid
- ✨ Animation effects:
  - Fade
  - Slide
  - Zoom
  - Bounce
  - Flip
  - Scale
  - Rotate
- ⚡ Animation speed control (Slow, Medium, Fast)

![Customize Your Forms](./public/snapform/customize.png)

### Data Management
- 📦 PostgreSQL database with Prisma ORM
- 🔒 User authentication and authorization
- 📊 Response collection and management
- 📈 Form analytics and statistics
- 🔄 Form status management (Draft, Active, Inactive)

![Secure Data Management](./public/snapform/secure.png)

### User Experience
- 🌐 Internationalization support
- 📱 Fully responsive design
- ♿ Accessibility compliant
- 🎯 Progress bar option
- 🔀 Question shuffling capability
- 📧 Email collection option
- 🔒 One response per user limit

![Responsive Design](./public/snapform/responsive.png)

### Easy To Use
![Intuitive Interface](./public/snapform/easy-to-use.png)

### Analytics & Insights
![Form Analytics](./public/snapform/analytics.png)

---

## 🧱 Tech Stack

| Tech         | Purpose                              |
|--------------|--------------------------------------|
| Next.js 14   | Framework (App Router + TypeScript)  |
| Tailwind CSS | Utility-first CSS framework          |
| shadcn/ui    | Accessible UI components             |
| Prisma       | Type-safe ORM for PostgreSQL         |
| PostgreSQL   | Robust relational database           |
| Docker       | Containerized development            |
| React Hook Form + Zod | Form state management & validation |
| Jest         | Unit testing framework               |
| i18next      | Internationalization                |
| Husky        | Git hooks                            |

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL (handled by Docker)

### 1. Clone the repo
```bash
git clone https://github.com/augani/form-builder.git
cd form-builder
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory with:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/snapform"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Start PostgreSQL with Docker
```bash
docker-compose up -d
```

### 5. Set up your database, generate Prisma client and seed data
```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

### 6. Run the development server
```bash
npm run dev
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

Tests are written using **Jest** and **@testing-library/react**, focusing on:
- Component rendering
- Form validation (yet to be implemented because of time constraints)
- User interactions (yet to be implemented because of time constraints)
- API endpoints (yet to be implemented because of time constraints)
- Database operations (yet to be implemented because of time constraints)

---

## 🗂️ Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── forms/        # Form management
│   │   ├── themes/       # Theme customization
│   │   └── public-forms/ # Public form endpoints
│   └── [locale]/         # Internationalized routes
├── components/
│   ├── form-builder/     # Form building components
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and configurations
├── prisma/              # Database schema and migrations
├── types/               # TypeScript type definitions
├── __tests__/           # Test files
├── i18n/                # Internationalization files
└── messages/            # Translation files
```

---

## 📈 Future Enhancements

### High Priority
- [ ] Form template system
- [ ] Advanced form logic (conditional questions)
- [ ] File upload support
- [ ] Rich text editor for descriptions
- [ ] Form sharing and collaboration

### Medium Priority
- [ ] Form versioning
- [ ] Response export (CSV, Excel)
- [ ] Custom validation rules
- [ ] Form embedding options
- [ ] Webhook integrations

### Low Priority
- [ ] Form analytics dashboard
- [ ] A/B testing for forms
- [ ] Form scheduling
- [ ] Payment integration
- [ ] Custom field types

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

> 💭 **Developer's Note**: I'm always excited to see what amazing features the community can add to this project! Let's make form building even more delightful together! 🚀

---

## 📧 Contact

For questions, suggestions, or just to chat about form builders (or anything tech-related!), feel free to reach out at [augustusniiotu@icloud.com](mailto:augustusniiotu@icloud.com) or connect via [GitHub](https://github.com/augani).

> 💌 **P.S.**: I love hearing from fellow developers and form enthusiasts! Don't hesitate to drop a message - I promise to respond! 😊

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

> 🎉 **Thanks for checking out SnapForm!** I hope it helps you create amazing forms that your users will love! If you use it in your projects, I'd love to hear about it! 🚀