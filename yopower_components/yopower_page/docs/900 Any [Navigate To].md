# Any (Navigate To)

- ✅ Any column type
- Adds buttons to open the row on a modal (`modal`) or on a side pane (`sidePane`).
- `modal` and `sidePane` are both required, use `[]` to skip one of them.

## modal

| **Property** | **Required** | **Description**                                                   |
| ------------ | ------------ | ----------------------------------------------------------------- |
| `position`   | Yes          | `1` = center, `2` = right                                         |
| `label`      | Yes          | Button label                                                      |
| `formId`     | Yes          | Form to open (`00000000-0000-0000-0000-000000000000` = default)   |
| `height`     | Yes          | `{ "value": 80, "unit": "%" }` (`%` or `px`)                      |
| `width`      | Yes          | `{ "value": 70, "unit": "%" }` (`%` or `px`)                      |
| `tabName`    | No           | Tab opened on the form                                            |

## sidePane

| **Property** | **Required** | **Description**                                                   |
| ------------ | ------------ | ----------------------------------------------------------------- |
| `label`      | Yes          | Button label                                                      |
| `paneId`     | Yes          | Side pane id, an open pane with the same id is closed and replaced |
| `formId`     | Yes          | Form to open (`00000000-0000-0000-0000-000000000000` = default)   |
| `width`      | Yes          | Width in pixels                                                   |
| `canClose`   | Yes          | Shows the close button                                            |
| `hideHeader` | Yes          | Hides the pane header                                             |
| `imageSrc`   | Yes          | Icon of the pane (web resource url)                               |

## Parameters

```json
{
  "modal": [
    {
      "position": 1,
      "label": "⬆️Center Modal",
      "formId": "00000000-0000-0000-0000-000000000000",
      "tabName": "tab_name",
      "height": {
        "value": 80,
        "unit": "%"
      },
      "width": {
        "value": 70,
        "unit": "%"
      }
    },
    {
      "position": 2,
      "label": "↗️Right Modal",
      "formId": "00000000-0000-0000-0000-000000000000",
      "tabName": "tab_name",
      "height": {
        "value": 80,
        "unit": "%"
      },
      "width": {
        "value": 70,
        "unit": "%"
      }
    }
  ],
  "sidePane": [
    {
      "label": "➡️Side Pane",
      "width": 300,
      "canClose": true,
      "paneId": "subgrid_try",
      "formId": "00000000-0000-0000-0000-000000000000",
      "imageSrc": "/webresources/yp_page_try_svg.svg",
      "hideHeader": true
    }
  ]
}
```