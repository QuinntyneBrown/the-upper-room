# The Upper Room — User Guide

A step-by-step walkthrough of every feature in the platform. Each section tells you exactly what to click, what to type, and what to expect.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Signing In, Signing Up, and Password Recovery](#2-signing-in-signing-up-and-password-recovery)
3. [Finding Your Way Around](#3-finding-your-way-around)
4. [The Dashboard](#4-the-dashboard)
5. [Managing Contacts](#5-managing-contacts)
6. [Managing Partners](#6-managing-partners)
7. [Kanban Boards](#7-kanban-boards)
8. [Ideas](#8-ideas)
9. [Events and Calendar](#9-events-and-calendar)
10. [Locations](#10-locations)
11. [Your Profile and Settings](#11-your-profile-and-settings)
12. [Notifications](#12-notifications)
13. [Global Search](#13-global-search)
14. [Admin Features](#14-admin-features)
15. [Keyboard Shortcuts](#15-keyboard-shortcuts)

---

## 1. Getting Started

The Upper Room is a multi-city platform for managing contacts, partners, ideas, events, locations, and Kanban boards. Before you can use it you need an account — either created from an invitation email or by signing up directly.

**Recommended browsers:** the latest version of Chrome, Edge, Firefox, or Safari.

---

## 2. Signing In, Signing Up, and Password Recovery

### 2.1 Signing in

1. Open the app. You will land on the public landing page.
2. Click **Sign in** (or go directly to `/sign-in`).
3. Type your email into the **Email** field.
4. Type your password into the **Password** field. Click the **eye icon** beside the password to reveal/hide what you've typed.
5. Click the **Sign in** button.
6. On success you are taken to the **Dashboard**.
7. If your credentials are wrong you'll see an error above the form. Re-enter and try again.

**Local development credentials.** When running the app locally against the mock auth provider, the only accepted login is:

- **Email:** `test@example.com`
- **Password:** `Password!23456`

Any other combination returns `auth.invalid_credentials`. These credentials are for local development only — never use them in a deployed environment.

### 2.2 Signing up (no invitation)

1. From the sign-in page click **Create account**, or go to `/sign-up`.
2. Enter your **Email**.
3. Enter a **Password**. The strength indicator beneath the field tells you how strong it is — aim for "Strong".
4. Choose your **City** from the dropdown.
5. Tick **I accept the terms and privacy policy**.
6. Click **Create account**.
7. Check your inbox for a verification email and click the link inside to verify your address.

### 2.3 Accepting an invitation

1. Open the invitation email and click the **Accept invitation** link.
2. You arrive at `/invitations/accept`. Your email and city are pre-filled and read-only.
3. Choose a password and accept the terms.
4. Click **Create account**.

If you see the **Invitation expired** screen, click **Request a new invite** and ask the person who invited you to resend.

### 2.4 Forgot password

1. From the sign-in page click **Forgot password?**.
2. Enter your **Email** and click **Send reset link**.
3. You'll see a confirmation message. Open the email and click the **Reset password** link.
4. On the reset page enter and confirm your new password, then click **Save**.
5. You'll be returned to sign-in — log in with the new password.

### 2.5 Signing out

1. Click your **avatar** (top-right of the app bar).
2. Click **Sign out** in the dropdown.

---

## 3. Finding Your Way Around

### 3.1 The top bar

From left to right:

- **Menu (☰) button** — opens the side drawer.
- **The Upper Room** title — click it to return to the dashboard.
- **City switcher** — dropdown showing your active city. Switching here changes which contacts, partners, events, etc. you see across the app.
- **Notification bell** — opens the notification panel.
- **Avatar** — opens the account menu (Profile, Sign out).

### 3.2 Breadcrumbs

Below the top bar you'll see a breadcrumb trail (e.g. **Home › Contacts › Jane Doe**). Click any earlier crumb to jump back.

### 3.3 The side drawer

Click the **menu button** to open or close it. Use it for quick navigation between sections of the app.

### 3.4 Switching cities

1. Click the **city name** in the top bar.
2. Pick a different city from the dropdown.
3. The page reloads its data scoped to that city.

---

## 4. The Dashboard

Route: `/dashboard`

Your home screen after signing in.

1. The header reads **Welcome, [Your Name]**.
2. **Stat cards** show counts of your contacts, partners, upcoming events, and open Kanban cards.
3. **Upcoming Events** lists the next events for your city. Click any event to view details, or click **View calendar** to jump to the events calendar.
4. **Tasks on My Boards** groups your assigned Kanban cards by board. Click a card to open its details.

---

## 5. Managing Contacts

Route: `/contacts`

### 5.1 Browsing and searching

1. From the side drawer click **Contacts** (or navigate to `/contacts`).
2. Type into the **Search contacts…** box at the top to filter by name, organisation, email, or phone.
3. Toggle the **Archived** chip to include archived contacts in the results.
4. On desktop use the paginator at the bottom to move between pages. On mobile tap **Load more** to extend the list.

### 5.2 Creating a contact

1. Click the **New contact** button in the toolbar (or the **+** floating action button on mobile).
2. You're taken to `/contacts/new`. Fill in:
   - **Name** (required)
   - **Title** (e.g. "Director of Operations")
   - **Organisation**
   - **Phone** and **Email**
   - **City** (defaults to your active city)
   - **Tags** — start typing to pick from existing tags
   - **Notes** — free-form text
3. Click **Save**. You'll land on the new contact's detail page.

### 5.3 Viewing and editing a contact

1. From `/contacts` click a contact card.
2. The detail page shows the contact card, linked partners, notes, and recent activity.
3. To edit click **Edit** (or go to `/contacts/:id/edit`). Update fields and click **Save**.

### 5.4 Archiving and deleting

- **Archive** removes the contact from the default list but keeps the record. Open the contact and click **Archive**. Use the **Archived** filter to find it again.
- **Delete** is permanent. Open the contact, click **Delete**, and confirm in the dialog.

---

## 6. Managing Partners

Route: `/partners`

A "partner" is an organisation you work with. Partners can have one or more contacts attached.

### 6.1 Browsing partners

1. From the drawer click **Partners**.
2. Use the **Search partners…** box to filter by name or website.
3. Toggle the **Archived** chip to include archived partners.

### 6.2 Creating a partner

1. Click the **New partner** button (or the **+** FAB).
2. On `/partners/new` fill in:
   - **Name** (required)
   - **Website**
   - **Logo** — upload an image if you have one
   - **Tags**
3. Click **Save**.

### 6.3 Linking contacts to a partner

1. Open the partner's detail page (`/partners/:id`).
2. Click the **Contacts** tab.
3. Click **Link contact**. A dialog appears.
4. Search for the contact you want to associate, click their name in the results, then click **Link**.
5. To remove a link click the **×** beside the contact's name on the partner page.

### 6.4 Editing, archiving, deleting

- **Edit** — click **Edit** on the partner page, change fields, click **Save**.
- **Archive** — click **Archive** to hide the partner from the default list.
- **Delete** — click **Delete** and confirm. The partner's contact links are removed; the contacts themselves stay.

---

## 7. Kanban Boards

Route: `/boards`

Boards are made up of columns; columns hold cards; cards can be dragged between columns.

### 7.1 Creating a board

1. From the drawer click **Boards**.
2. Click **New board**. The board wizard opens.
3. Step through the wizard:
   - Enter a **Name** and **Description**.
   - Choose a column template, or define your own columns and WIP limits.
   - Add any custom fields you want on cards.
4. Click **Create**. You're taken into the new board.

### 7.2 Configuring an existing board

1. Open the board.
2. Click **Configure** (top-right). You go to `/boards/:id/configure`.
3. From here you can:
   - **Rename** columns and reorder them (drag the handle on the left of each column row).
   - Set or remove a **WIP limit** per column.
   - Add, edit, or remove **custom fields** on the card schema.
4. Click **Save** to apply.

### 7.3 Filtering the board view

1. On the board page use the **tag chips** along the top to show only cards with the selected tags.
2. Toggle **Show archived** to include archived cards.

### 7.4 Adding a card

1. On the board click **+ Add card** at the bottom of any column.
2. Enter a **Title**, optional **Description**, **Tags**, **Assignee**, and **Due date**.
3. Click **Save**. The card appears in the column.

### 7.5 Moving a card

**Desktop (drag and drop):**

1. Click and hold a card.
2. Drag it to another column. A drop indicator shows where it will land.
3. Release to drop.

**Mobile (move sheet):**

1. Tap the card.
2. In the card detail dialog tap **Move**.
3. The move sheet opens with all available columns. Tap the destination.

If the destination column is at its WIP limit you'll see a warning before the move is accepted.

### 7.6 Editing or archiving a card

1. Click a card to open the **card detail** dialog.
2. Change any fields directly — they save as you edit.
3. Click **Archive** to hide the card from the board (toggle **Show archived** to find it again).
4. Click **Delete** to remove permanently.
5. Click **Close** (or press **Esc**) to dismiss.

### 7.7 Switching between Columns and Swimlanes

1. On the board page click the **view toggle** in the toolbar.
2. **Columns** view (default) shows one column per status.
3. **Swimlanes** view groups cards by assignee — useful for stand-ups.
4. Drag-and-drop and the move sheet work the same way in both views.

---

## 8. Ideas

Route: `/ideas`

Ideas are lightweight proposals that can be voted on by other users.

### 8.1 Browsing ideas

1. From the drawer click **Ideas**.
2. Toggle the **My ideas** chip to show only ideas you submitted.
3. Use the **Sort** dropdown to switch between **Newest**, **Most votes**, and **Recently updated**.

### 8.2 Submitting a new idea

1. Click **New idea**.
2. Enter a **Title**, **Description**, and (optional) **Cover image**.
3. Tag any **Partners** the idea relates to.
4. Click **Submit**. Your idea appears at the top of the list.

### 8.3 Voting

- On any idea card click the **vote button** (the count beside it increments). Click again to remove your vote.

### 8.4 Idea detail and discussion

1. Click an idea card to open `/ideas/:id`.
2. Read the full description and view the cover.
3. Use the comments area at the bottom to discuss.
4. The **Status** chip (e.g. *Proposed*, *In progress*, *Shipped*, *Rejected*) is updated by an organiser as the idea progresses.

---

## 9. Events and Calendar

Route: `/events`

### 9.1 Browsing events

1. From the drawer click **Events**.
2. Use the **Status** dropdown to filter by *Scheduled*, *Cancelled*, or *Completed*.
3. Click the **view toggle** to switch between **List** and **Calendar** views.
4. In Calendar view use the arrows beside the month name to navigate. Click any event on the calendar to open its details.

### 9.2 Creating an event

1. Click **New event** (top-right of the events list).
2. On `/events/new` fill in:
   - **Title** and **Description**
   - **Date** and **Start/End time**
   - **Location** — pick from existing locations, or toggle **Virtual** to enter a meeting link instead
   - **Capacity** and **RSVP tracking** options
   - **Cover image**
3. Click **Save**. You're redirected to the event page.

### 9.3 Editing or cancelling an event

1. Open the event detail page.
2. Click **Edit** to change any field.
3. Click **Cancel event** to mark it cancelled. A red **Cancelled** ribbon appears on the event card. Attendees with RSVPs are notified.

### 9.4 RSVPing and exporting

- On the event detail page click **RSVP** to add yourself. Click again to remove your RSVP.
- Click **Add to calendar** (`.ics` download) to import the event into your personal calendar app.

---

## 10. Locations

Route: `/locations`

A location is a venue where events can be hosted.

### 10.1 Browsing

1. From the drawer click **Locations**.
2. Each card shows the name, address, capacity, and an **Archived** badge if applicable.

### 10.2 Creating a location

1. Click **New location**.
2. Fill in:
   - **Name**
   - **Street** and **City**
   - **Capacity** (max attendees)
   - **Notes**
3. Click **Save**.

### 10.3 Viewing and deleting

- Click a location card to view its detail page, including the events scheduled there.
- Click the **trash icon** on any card to delete the location. You'll be asked to confirm.

---

## 11. Your Profile and Settings

### 11.1 Editing your profile

Route: `/profile`

1. Click your **avatar** in the top bar, then click **Profile**.
2. To change your photo click the avatar on the profile page and pick an image file. It uploads automatically.
3. Update any of:
   - **First name**, **Last name**, **Display name**, **Pronouns**, **Title**
   - **City**, **Timezone**, **Locale**
4. Click **Save changes**. Use **Cancel** to discard edits.

### 11.2 Active sessions

1. Scroll to the **Sessions** card on the profile page.
2. Each row shows a device, location, and last-active time.
3. Click **Sign out** beside any row to revoke that session.

### 11.3 Appearance

Route: `/settings/appearance`

1. Choose between **Light**, **Dark**, or **Auto** (follows your operating system).
2. The change applies immediately and is remembered across sessions.

### 11.4 Notification preferences

Route: `/settings/notifications`

1. Toggle **Email** and **Push** delivery for each event type (mentions, RSVPs, board activity, weekly digest, etc.).
2. Pick a digest frequency if available.
3. Changes save automatically.

---

## 12. Notifications

1. Click the **bell** in the top bar to open the notification panel.
2. Unread items are highlighted. Click an item to jump to the relevant page (e.g. the card you were mentioned on).
3. Click **Mark all read** to clear the unread badge.
4. Click **Notification settings** at the bottom to jump to your preferences.

---

## 13. Global Search

1. Press **Ctrl + K** (Windows/Linux) or **⌘ + K** (Mac) anywhere in the app.
2. Start typing — results appear instantly across **contacts**, **partners**, **events**, **ideas**, and **locations**.
3. Use **↑** / **↓** to move through results, **Enter** to open the highlighted result, **Esc** to close.
4. If there are no matches you'll see a "No matches" state — try a shorter query.

---

## 14. Admin Features

These pages require the **System Admin** role. If you don't see them in the menu, you don't have access.

### 14.1 Tags

Route: `/admin/tags`

1. To add a tag type a **Name**, pick a **Colour**, and click **Add tag**.
2. Tags are grouped on the page by colour.
3. Click the **edit icon** on a tag to change its colour, then click **Save**.
4. Click the **delete icon** to remove a tag. Tags in use are removed from every entity referencing them.

### 14.2 Cities

Route: `/admin/cities`

1. Click **New city**. A form appears.
2. Type the **Name** — the **Slug** preview updates as you type.
3. Type the **Country** and click **Save**.
4. To archive a city click **Archive** in its row. Archived cities no longer appear in city pickers.

### 14.3 Users

Route: `/admin/users`

1. The user table lists every user with email, name, role, and status.
2. Click a user to view or edit their details (role assignment, status, etc.).
3. To invite a new user click **Invite user**, enter their email, choose a role and city, and click **Send invitation**.

### 14.4 Audit log

Route: `/admin/audit`

1. Use the filter row at the top:
   - **Actor** — search by email or name.
   - **Entity type** — e.g. *Contact*, *Partner*, *Event*.
   - **Action** — *Create*, *Update*, *Archive*, *Delete*, etc.
2. Click **Apply** to run the filter.
3. The table shows timestamp, actor, entity type, entity id, and action for every match.
4. Use **Previous** / **Next** at the bottom to page through results.

---

## 15. Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| **Ctrl + K** / **⌘ + K** | Open global search |
| **Esc** | Close search, dialog, or drawer |
| **Tab** / **Shift + Tab** | Move keyboard focus through controls |
| **Enter** | Activate the focused button or open the highlighted search result |

A **Skip to main content** link appears when you tab into the page — handy for screen-reader users.

---

If something in the app doesn't behave the way this guide describes, tell an admin or open an issue — the guide is the source of truth for expected behaviour.
