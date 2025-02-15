# CaseyEquipmentApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# Casey Equipment App (Standalone Angular)

## 🚀 Project Overview
This project is built using **Angular Standalone Components** (without `app.module.ts`) and uses `app.routes.ts` for routing.

## 📂 Folder Structure
casey-equipment-app/
│── src/
│   │── app/
│   │   │── app.component.ts  <– Standalone root component
│   │   │── app.component.html  <– Contains 
│   │   │── app.routes.ts  <– Defines application routes
│   │   │── components/
│   │   │   │── auth/
│   │   │   │   │── auth.component.ts  <– Standalone Login component
│   │   │   │── admin-dashboard/
│   │   │   │   │── admin-dashboard.component.ts  <– Standalone Admin Dashboard
│   │── main.ts  <– Bootstraps the app without AppModule

## 📜 Key Files and Their Purpose

### `app.component.ts`
Minimal root component, uses `<router-outlet>`.

### `app.routes.ts`
Defines Angular routes instead of using an NgModule.

### `main.ts`
Bootstraps the app with `bootstrapApplication()`.

## 🚀 How to Run the App
```sh
ng serve --restart

📌 **Why?**  
- This **tells Copilot** about our project structure and purpose.  
- Future developers can **quickly understand** our setup.  

---

## **✅ Step 2: Add Comments in `app.routes.ts`**
Now, let's **document the routing setup** inside `app.routes.ts` to help **Copilot and developers**.

### **1️⃣ Open `src/app/app.routes.ts` and Modify It**
```typescript
// 🚀 Defines application routes using standalone components
import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' }, // Default route to login page
  { path: 'auth', component: AuthComponent }, // Login route
  { path: 'admin', component: AdminDashboardComponent }, // Admin dashboard
];