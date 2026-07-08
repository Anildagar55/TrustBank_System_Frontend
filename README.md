# TrustBank (Frontend)

React + Tailwind frontend for the Spring Boot "Idea" bank-management backend. Clean, minimal,
corporate banking UI — white surfaces, navy blue branding, standard top nav — in the spirit of
apps like HDFC / ICICI net banking.

## Design identity
- Concept: familiar, professional net-banking layout. No gimmicks — plain cards, standard buttons,
  pill status badges, clean forms.
- Font: Inter (UI) + IBM Plex Mono (amounts, account numbers).
- Palette: navy blue #0F4C81, white surfaces, light gray background #F3F5F8, green for success,
  red for alerts.

## Connecting to the backend
1. Run the Spring Boot backend — default `http://localhost:8080` (MySQL `banksystem` DB must be up).
2. Enable CORS on the backend so `http://localhost:5173` can call it:
   ```java
   @Bean
   public WebMvcConfigurer corsConfigurer() {
       return new WebMvcConfigurer() {
           @Override
           public void addCorsMappings(CorsRegistry registry) {
               registry.addMapping("/**")
                       .allowedOrigins("http://localhost:5173")
                       .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE");
           }
       };
   }
   ```
3. Frontend API base URL is in `.env` → `VITE_API_BASE_URL=http://localhost:8080`.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Screen → endpoint map
| Screen | Endpoints |
|---|---|
| Register (step 1/2) | `POST /user`, `POST /bank` |
| Sign In (ID lookup / directory) | `GET /user/{id}`, `GET /user` |
| Dashboard / Accounts | `GET /user/{id}`, `PUT /bank/{customerId}`, `DELETE /bank/{customerId}` |
| Transactions | `POST /transactions/deposit\|withdraw\|transfer`, `GET /transactions/Number/{accountNumber}`, `POST /transactions/filter` |
| Loans | `GET /api/loans/calculator`, `POST /api/loans/apply/{userId}`, `GET /api/loans/user/{userId}`, `POST /api/loans/emi/pay` |
| Admin panel | `GET /api/loans/admin/pending\|all\|status/{status}`, `PUT /api/loans/approve\|reject`, `GET /user`, `GET /bank` |

## Notes
- Backend has no auth layer — "Sign In" is a customer-ID lookup, session kept in `localStorage`
  client-side only.
- `customerId`/`accountNumber` are generated server-side; frontend only sends `userid`, `banktype`, `amount`.
- Admin panel has no role-check on the backend — add real auth before production use.
- Same functionality and API layer as the other two theme variants (ledger/vault, terminal) — only
  the visual design differs.
