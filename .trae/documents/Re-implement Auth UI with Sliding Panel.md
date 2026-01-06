I will re-implement the login/sign-up UI using a single `AuthPage.tsx` component with a sliding panel animation as requested.

### Step 1: Create `src/pages/AuthPage.tsx`

&#x20;

* Implement the entire auth UI in **one file**: `AuthPage.tsx`.
* Use React state:
  * `const [isSignUp, setIsSignUp] = useState(false)`
  * This state replaces `.container.active` from the original JS.
* Implement animations using **Tailwind only**:
  * `translateX`
  * `opacity`
  * `z-index`
  * `transition-all`
  * `duration-700`
  * `ease-in-out`

Layout Rules (Strict)

* Main container:
  * Fixed size **768px × 480px**
  * `relative`
  * `overflow-hidden`
  * Centered on screen
* `SignInForm` and `SignUpForm`:
  * `absolute`
  * Overlap in the same container
  * No layout reflow during animation

Components

* Define inside `AuthPage.tsx`:
  * `SignInForm`
  * `SignUpForm`
  * `TogglePanel`
* Reuse **existing fields, handlers, and validation logic** from `LoginPage.tsx`.
* Do **not** modify Supabase logic.

Toggle Panel

* Width: **50% of container**
* Slides horizontally opposite to the forms
* Gradient:
  * `bg-gradient-to-r from-indigo-500 to-teal-500`

Context & Theme

* Preserve:
  * `LanguageContext`
  * `ThemeContext`
* Ensure light/dark mode does not break layout.

Step 2: Update `src/App.tsx`

* Import `AuthPage`.
* Route:
  * `/login` → `AuthPage`
  * `/signup` → `AuthPage`
* Ensure `AuthPage` is **not constrained by AuthLayout width**, while keeping auth guards.

Step 3: Verification (Must Pass)

* Sign In slides out smoothly when switching to Sign Up.
* Sign Up slides into view smoothly.
* Toggle panel slides in the opposite direction.
* No resizing, no scrolling, no layout jump.
* Supabase login & registration still work.
* Final UI matches original implementation **1-to-1**.

