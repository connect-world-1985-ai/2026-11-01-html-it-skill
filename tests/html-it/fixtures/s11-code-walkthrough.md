Walkthrough for Priya, who joins the booking team next week: how a booking request flows through the code.
Flow: BookingResource.java (POST /bookings) -> BookingService.book() -> SlotLock.acquire(slotId) (Redis lock, 30 s TTL) -> BookingRepository.save() -> BookingEventPublisher.publish(BookingCreated) -> sms-service schedules the reminder.
Key code (BookingService.java at commit 7c41e9a on master):
```java
public Booking book(BookingRequest req) {
    try (SlotLock lock = slotLock.acquire(req.slotId())) {
        Slot slot = slots.findAvailable(req.slotId())
            .orElseThrow(() -> new SlotTakenException(req.slotId()));
        Booking booking = repository.save(Booking.from(req, slot));
        events.publish(new BookingCreated(booking.id()));
        return booking;
    }
}
```
Gotchas:
- The lock TTL must be longer than the DB timeout (ADR-011 "Redis slot locks").
- SlotTakenException becomes HTTP 409 in ExceptionMappers.java.
- Never call book() inside another transaction: that caused the double bookings in BUG-3120 (2026-06).
