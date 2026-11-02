# UML diagrams

## When to load

Class, ER, component, deployment, or activity: match that diagram to one pack-index row and stamp from it. Sequence and state have no library pack: use mermaid, or built-in lifelines and states. Do not invent a pack id.

## Shared drawing rules

Run the library pre-flight once for this diagram. Draw built-in frames first; those rectangles are the holes. Stamp with contain, match-height, or match-width. For a stamp that bakes a title, use `--replace-text` when that title must change. Keep the stamp's own label. After `add`, the canvas verify cycle and Present gate still apply.

Draw relationships as bound arrows (`startElementId` / `endElementId`) with built-in arrowheads. Bind to the box frame (the rectangle), not to free-standing title text. Set `startArrowhead: null` unless the start end carries notation. When a relationship needs a name (`books`, `hosts`), put it as `text` on that arrow; inheritance and composition usually need none. Stamp a relationship only when no built-in arrowhead carries its meaning: a stamp cannot bind, so it opens joins and forces box sizes. Size peer boxes from their content; a joined peer stays within 1.5×.

## Class recipe

Pack `uml-class-er` for compartment boxes. These boxes have no baked title. Put the type name in free-standing text. Relationships, from the first element to the second:

- Inheritance: child → parent, `endArrowhead: "triangle_outline"`.
- Realization: the same with `strokeStyle: "dashed"`.
- Composition: part → whole, `endArrowhead: "diamond"`.
- Aggregation: part → whole, `endArrowhead: "diamond_outline"`.
- Association: plain arrow, or `endArrowhead: null` for no direction.
- Dependency: dashed arrow.

This is not C4 notation. Do not tell the ER cardinality story when the user asked for a UML class diagram.

## ER recipe

Same pack `uml-class-er` for entity boxes. Entity boxes have no baked title. Put the entity name in free-standing text. Draw relationships as bound lines with crow's-foot heads at each end: `crowfoot_one`, `crowfoot_many`, or `crowfoot_one_or_many`. Use the cardinality stamps (`0 .. 1`, `1 .. n`, `n .. m`) only when the user wants text cardinalities; place each beside its end without touching the line. Do not put operations compartments on an ER entity.

## Component recipe

Pack `uml-component`. Lollipops and ports come from this pack.

## Deployment recipe

Pack `uml-deployment`. Use the deployment pane, artifact, execution environment, and exposed interface. Do not substitute 3D network hardware.

## Activity recipe

Pack `uml-activity`. Use initial, final, action, decision, fork/join, swimlane, and expansion stamps. This is not a state machine. `Expansion Description_Iterative` bakes `<<iterartive>>`; `--replace-text` if you fill that chip, or leave the typo.

## Sequence / state

No pack. Mermaid is the path when the syntax is a normal sequence or state diagram. Do not stamp activity Initial or Final as lifelines. Do not stamp `Lifeline` or `Lifeline round` from `uml-class-er`. Mermaid output goes through the same verify cycle: a lifeline with at least two message ends is a target line (one with a single message is measured as a normal line), actors are figures, and what the checker still reports is a real layout fix for `apply` (an actor a few pixels off the participant boxes, a filled chip over a lifeline). A state diagram lands as one flat image: the checker only gives an `image-unmeasured` note, so read the picture at full size and fix faults in the Mermaid source.
