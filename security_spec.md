# ShetMitra (शेतमित्र) Security Specification & TDD Test Plan

## 1. Data Invariants
1. **User Identity Invariant**: A user can only create or update their own user profile document where `userId == request.auth.uid`. A user cannot alter their user ID, rating, or reviewCount directly.
2. **Post Ownership Invariant**: Only the original creator (`authorId == request.auth.uid`) can update or delete their agricultural post. Posts cannot have spoofed `authorId`.
3. **No Self-Booking Invariant**: A user cannot create a booking request for their own post (`requesterId != posterId`).
4. **Booking Participant Invariant**: Only the `requesterId` or `posterId` can read private booking details or change booking states.
5. **Booking State Machine Invariant**:
   - `pending` -> `accepted` | `rejected` | `cancelled` (only poster can accept/reject; requester can cancel).
   - `accepted` -> `in_progress` | `cancelled` (poster or requester).
   - `in_progress` -> `completed` (poster or requester).
   - Once `completed`, `rejected`, or `cancelled`, status is locked and cannot be changed.
6. **Review Invariant**: Only participants of a booking with status == `completed` can submit a review. `reviewerId` must match `request.auth.uid`, and `targetUserId` must be the opposing participant. Exactly one review per participant per booking.
7. **Notification Isolation**: A user can only read and update their own notifications (`userId == request.auth.uid`).

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: Identity Spoofing in User Profile**
   - Attempt: Attacker logs in as UID `user_attacker` and attempts to write to `/users/user_victim`.
   - Expected Result: `PERMISSION_DENIED`
2. **Payload 2: Self-Rating Manipulation**
   - Attempt: User attempts to update their own profile with `rating: 5.0, reviewCount: 100`.
   - Expected Result: `PERMISSION_DENIED` (rating fields are protected or updated via atomic review transactions).
3. **Payload 3: Post Author Spoofing on Create**
   - Attempt: User with UID `user_A` creates a post with `authorId: "user_B"`.
   - Expected Result: `PERMISSION_DENIED`
4. **Payload 4: Post Modification by Stranger**
   - Attempt: User `user_B` attempts to update title or rate on post created by `user_A`.
   - Expected Result: `PERMISSION_DENIED`
5. **Payload 5: Self-Booking Exploit**
   - Attempt: Farmer attempts to create a booking on their own post (`requesterId == posterId`).
   - Expected Result: `PERMISSION_DENIED`
6. **Payload 6: Unauthorized Booking Snooping (PII Leak)**
   - Attempt: Third-party villager `user_C` attempts to read `/bookings/booking_123` between `user_A` and `user_B`.
   - Expected Result: `PERMISSION_DENIED`
7. **Payload 7: Unauthorized Status Transition (Stranger Accept)**
   - Attempt: Stranger `user_C` sends an update to set booking status to `accepted`.
   - Expected Result: `PERMISSION_DENIED`
8. **Payload 8: State Shortcutting (Pending directly to Completed)**
   - Attempt: Requester attempts to immediately update status from `pending` directly to `completed`.
   - Expected Result: `PERMISSION_DENIED`
9. **Payload 9: Terminal State Tampering**
   - Attempt: After a booking is marked `completed` or `rejected`, a user attempts to reopen it back to `pending`.
   - Expected Result: `PERMISSION_DENIED`
10. **Payload 10: Fake Review without Completed Booking**
    - Attempt: User creates a review for an unaccepted booking or a non-existent booking ID.
    - Expected Result: `PERMISSION_DENIED`
11. **Payload 11: Notification Hijacking**
    - Attempt: User `user_A` queries or marks as read notifications belonging to `user_B`.
    - Expected Result: `PERMISSION_DENIED`
12. **Payload 12: Resource Exhaustion / Ghost Field Injection**
    - Attempt: Post payload containing 500KB junk text or injected shadow admin field `isAdmin: true`.
    - Expected Result: `PERMISSION_DENIED`
