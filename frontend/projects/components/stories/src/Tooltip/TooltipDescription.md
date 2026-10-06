A short text label that appears on hover or keyboard focus. `[tarTooltip]` is an attribute directive — not a component — that applies Angular Material's `MatTooltip` as a host directive and re-exposes its inputs under `tarTooltip*` names:

| `tarTooltip` input    | `MatTooltip` input         |
| --------------------- | -------------------------- |
| `tarTooltip`          | `matTooltip` (the message) |
| `tarTooltipPosition`  | `matTooltipPosition`       |
| `tarTooltipDisabled`  | `matTooltipDisabled`       |
| `tarTooltipShowDelay` | `matTooltipShowDelay`      |
| `tarTooltipHideDelay` | `matTooltipHideDelay`      |

It adds no BEM classes or `data-testid` of its own. The host gets Material's `.mat-mdc-tooltip-trigger` class and `aria-describedby` pointing at the message; the tooltip itself renders in a CDK overlay as `.mat-mdc-tooltip`.
