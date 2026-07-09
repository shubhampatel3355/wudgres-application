# WUDGRES MOBILE APPLICATION – BLUEPRINT

Version: 1.0  
Platform: iOS + Android  
Backend: Supabase  
Monetization: None (Free App)  
Purpose: Product Catalogue & Brand Showcase  
Design Reference: MUST MATCH PROVIDED SCREENSHOTS EXACTLY  

---

## 1. OBJECTIVE

The Wudgres mobile application is a premium product catalogue app designed to visually showcase doors, frames, plywood, and series collections.

This app is NOT an e-commerce app.  
There are NO prices, NO cart, NO checkout, NO payments.

Primary goals:
- Present Wudgres products in a premium, visual-first format
- Act as a digital showroom for dealers, architects, and customers
- Maintain brand consistency with Wudgres website and marketing assets

---

## 2. CORE PRINCIPLES

- Pixel-perfect UI matching the provided screenshots
- Clean navigation with minimal interaction friction
- Fast loading, image-first experience
- Same UX across iOS and Android
- Read-only data for users
- Admin-controlled content via Supabase

---

## 3. PLATFORM & TECH STACK

### iOS
- SwiftUI
- MVVM architecture
- Async/Await
- Dark mode support
- Haptic feedback on primary taps

### Android
- Kotlin
- Jetpack Compose
- MVVM architecture
- Material 3
- Dark mode support
- Haptic feedback

### Backend
- Supabase Auth
- Supabase Database
- Supabase Storage (for images)

---

## 4. AUTHENTICATION

### Login Screen
- Phone number OR email
- Password
- Forgot password
- Register

Rules:
- Login required to access app
- No social logins
- Simple Supabase Auth implementation

---

## 5. APP SCREENS

### Login Screen
- Wood texture background
- White rounded card
- Title: Welcome Back
- Inputs: Phone Number, Password
- Buttons: Let’s Go, Register
- Link: Forgot Password

### Home Screen
- Greeting: Hello, {UserName}
- Products (horizontal): Doors, Eng. Wood Frames, Plywood
- Browse by Series
- Bottom Navigation: Home, Products, Gallery, Profile

### All Products Screen
- Grid layout (2 columns)
- Image + name
- Opens series listing

### Series / Product Screen
- Series filter (horizontal)
- Product grid
- No price, no CTA

### Profile / Info Screen
- Logo
- Brand info
- Logout

---

## 6. DATABASE STRUCTURE

### categories
id, name, image_url, order_index, created_at

### series
id, category_id, series_name, thumbnail_url, order_index, created_at

### products
id, series_id, product_name, image_url, description, order_index, created_at

---

## 7. SECURITY

- RLS enabled
- Users: read-only
- Admin: full access

---

## 8. DESIGN RULES

- Use brand fonts
- Match spacing and colors exactly
- Gold icons
- Dark mode supported
- No redesign allowed

---

## 9. PERFORMANCE

- Lazy loading
- Image caching
- Pagination
- Skeleton loaders

---

## 10. OUT OF SCOPE

- Cart
- Payments
- Checkout
- Pricing
- Reviews
- User uploads

---

END OF BLUEPRINT
