# File (Management)

- ✅ File
- Visualize, download, upload and delete files directly on the grid.

## Parameters

| **Property**   | **Required** | **Description**                                                                          |
| -------------- | ------------ | ---------------------------------------------------------------------------------------- |
| `readOnly`     | Yes          | `true` hides upload and delete, only visualize / download remain                         |
| `allowedTypes` | Yes          | Extensions allowed on upload, **lowercase and without dot** (i.e. `"pdf"`, not `".PDF"`) |

```json
{
  "readOnly": false,
  "allowedTypes": ["jpg", "jpeg", "png", "gif"]
}
```
