# Canonical model
| Field | Constraint |
| --- | --- |
| Tunnel.topologyId | Existing five-router authored level id |
| Tunnel.ingress | Fixed routerR1 |
| Tunnel.egress | Fixed routerR5, distinct from ingress |
| Tunnel.targetRtt | Integer134; independently maximal successful request tunnel plus static reply |
| Tunnel.baselineRtt | Integer44; same topology with initial static routes |
| Tunnel.solution | Unique simple strict-hop router path R1,R2,R3,R4,R5 |
| Tunnel.hint | Nonempty method guidance string |
| Lab.draftPath | Array of unique router IDs with fixed ingress/egress; intermediate adjacency may be temporarily invalid while editing |
| Lab.appliedPath | Valid simple router path with fixed endpoints and adjacent consecutive routers |
| Lab.enabled | Boolean; defaultfalse |
| Lab.result | null or shared ping result; applied/mode changes clear it |
| Lab.bestRtt | null or highest successful enabled RTT; invalid/disabled runs do not improve it |
| Lab.completed | Boolean; only successful enabled target ping sets true |
| Lab.assistance | Integer0(no help),1(hint),2(solution) |
| Lab.error | Empty or readable validation error; no score mutation on invalid Apply |
| Lab.attempts | Nonnegative integer incremented by explicit Run ping |
