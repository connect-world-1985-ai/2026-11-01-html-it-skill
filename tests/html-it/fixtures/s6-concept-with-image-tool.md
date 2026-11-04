Explainer for new joiners: what event sourcing is and why ADR-007 chose it for the order service.
- Instead of storing the current state of an order, we store every change as an event
  (OrderPlaced, PaymentCaptured, OrderShipped) in an append-only log.
- Current state = replay of events. Projections build read models (order list, invoice view).
- Why (ADR-007, 2025-03): full audit trail for medical billing, easy rebuild of read models,
  temporal queries ("what did this order look like on 1 March?").
- Costs: event schema versioning, eventual consistency between write side and projections,
  replay time grows (we snapshot every 500 events).
- Flow: command -> aggregate -> event store -> projector -> read model -> UI.
Audience: new backend engineers, many coming from CRUD-only backgrounds.
