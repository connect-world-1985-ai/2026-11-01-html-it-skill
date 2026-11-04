Write up my PR for reviewers: PR 437 "Paginate booking search", branch feature/KT-948-pagination into master.
Changed files:
- booking-api/src/main/java/com/example/booking/BookingSearchResource.java (+42 -11): page and size query parameters, default size 20, maximum 100
- booking-api/src/main/java/com/example/booking/BookingSearchService.java (+65 -20): keyset pagination on (start_time, id) instead of OFFSET
- booking-api/src/main/resources/db/migration/V57__search_index.sql (+3): index on slots(practice_id, start_time, id)
- booking-api/src/test/java/com/example/booking/BookingSearchServiceIT.java (+120): 6 new tests, including a stable order across pages
- docs/api/booking-search.md (+18 -2)
Diff excerpt from BookingSearchService.java:
-    return query.offset(page * size).limit(size).fetch();
+    return query.where(cursor.after(lastStartTime, lastId))
+                .orderBy(SLOT.START_TIME.asc(), SLOT.ID.asc())
+                .limit(size + 1).fetch();
Why: OFFSET pagination gets slow after page 50 (KT-948), and INC-2307 showed what a full table scan does to us.
Risk: the total count was dropped from the response; mobile app 3.2 uses it only for a label (checked with the app team).
How to test: run BookingSearchServiceIT; then GET /bookings/search?practice=17&size=5 and follow nextCursor.
Context: KT-948 is "Booking search slow on large practices". INC-2307 is the 2026-10-29 booking outage caused by a missing index.
