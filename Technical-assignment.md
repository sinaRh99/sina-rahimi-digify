### Assignment: Paginated Data Display with SSR and Infinite Scroll

#### Overview:
Create a Next.js application using TypeScript that fetches country data from the [REST Countries API](https://restcountries.com/v3.1/all) and displays it with pagination for desktop and infinite scroll for mobile. 

#### Requirements:
1. **Data Fetching:**
   - Fetch data from the REST Countries API: https://restcountries.com/v3.1/all.
   - Ensure each country has a flag image and some basic information (name, population, area, and region).
   - The data should be fetched server-side for the first page (SSR) and client-side for subsequent pages.
   - On page refresh, the application should read the page number from the URL and render that specific page using SSR.

2. **Pagination:**
   - **Desktop View:** Implement traditional pagination where the user can navigate between pages.
     - When there are many pages, show a condensed pagination format (e.g., "1, 2, 3, ..., 10" instead of showing all page numbers).
     - Avoid using external pagination packages.
     - When the user refreshes the page, they should return to the page they were last on.

3. **Infinite Scroll:**
   - **Mobile View:** Implement infinite scroll, dynamically loading more data as the user scrolls down.
   - No external infinite scroll libraries should be used.

4. **Select Tag for Items Per Page:**
   - Implement a `<select>` dropdown to allow users to change the number of items displayed per page (e.g., 10, 15, 20 items per page).
   - The selection should persist between page refreshes.

5. **State Management:**
   - Handle the application's state (current page, data per page, current items) using a state management solution (e.g., React's Context API, Zustand, or any state management tool you're comfortable with).
   - Ensure state is properly updated when changing views or reloading the page.

6. **Next.js Configuration:**
   - Use proper Next.js project configuration (e.g., custom `_app.js`, `_document.js`, API routes, and `getServerSideProps`).
   - Ensure SEO and meta tags are well-handled for SSR and CSR (client-side rendering).

7. **Performance:**
   - Optimize performance (minimize re-renders, unnecessary fetches).
   - Use code-splitting and lazy-loading where appropriate.

8. **Styling:**
   - Responsive design with pagination visible on larger screens and infinite scroll on smaller devices.
   - Feel free to use CSS Modules, TailwindCSS, or any preferred styling approach.

9. **Bonus:**
   - Implement a simple search bar that filters the data client-side.
   - Handle loading and error states gracefully.

### Key API Information:
- Each country object in the API response includes various details. For the assignment, focus on:
  - **Name**: `name.common`
  - **Population**: `population`
  - **Area**: `area`
  - **Region**: `region`
  - **Flag Image**: `flags.png` (use this URL for the Next.js `Image` component)

### Example TypeScript Interfaces:
```typescript
// Country.ts
export interface Country {
  name: {
    common: string;
  };
  population: number;
  area: number;
  region: string;
  flags: {
    png: string; // Use PNG for the flags
  };
}

// Props for component
export interface CountryListProps {
  countries: Country[];
  currentPage: number;
  itemsPerPage: number;
}
```

### Submission Instructions

1. **Project Structure:**
   - The candidate should organize their project files in a repository named after themselves.

2. **GitHub Repository:**
   - Candidates should create a GitHub repository to host their project code.
   - Include a README file with clear instructions on how to run the project.
3. **Email Submission:**
   - Candidates should email the link to their GitHub repository for review.


### Deliverables:
- Code should be well-commented and structured.
- The application should be responsive and work across modern browsers.
- Explain the reasoning behind key architectural decisions (in a README or comments).
- A GitHub repository containing the project code, named after the candidate
