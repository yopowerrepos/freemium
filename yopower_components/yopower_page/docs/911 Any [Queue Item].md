# Any (Queue Item)

- ✅ Any column type (represents the row)
- ⚠️ Requires the **Queues** feature enabled on the table and the row to support queue items
- Displays the active queue item for the row: queue name, worker, queue size/member count, entered-on and assigned-on elapsed time, and a badge for private vs. public queues.
- **Pick** — assign to yourself, assign to another queue member, or auto-distribute using a strategy (assign to least busy / most busy / random member) — the member picker and distribute actions are only available on private queues.
- **Release** — send the item back to the queue and clear the current worker.
- **Add / Move** — add the record to a queue, or move it from its current queue to another.
- **Remove** — remove the record from the queue.
- Each action (`add`/`remove`/`pick`/`release`) and the distribute strategies are independently configurable per instance, using the `distributeOptions` array.

## Parameters

```json
{
  "add": true,
  "remove": true,
  "pick": true,
  "release": true,
  "distributeOptions": ["lessItems", "moreItems", "random"]
}
```
