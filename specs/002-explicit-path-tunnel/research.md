# Research
Decision: model a pre-established unidirectional strict-hop LSP. Rationale: teach explicit steering without claiming signaling/labels. Source: RFC3209§4.3.2 and§4.3.4 strict/loose routes; official RFC text checked2026-11-17. Here each abstract node represents one router. Alternatives: full RSVP-TE/reservations or label-plane simulation deferred.
Decision: adapter closure overrides request forwarding only; egress uses static delivery; reply stays independently static. Reuse engine/network.js unchanged. Alternative overwriting route tables would conflate static forwarding and tunnel state.
Decision: native drag/drop plus keyboard add/left/right/remove controls; no library. Three intermediate routers constrain both maximum and interactions.
Independent arithmetic: R1→R5 direct16; endpoints3each; static RTT44. Full chain18+24+28+36=106; request112 plus return22=134. The R2–R4 shortcut6 is shorter than24+28. Enumerate all simple paths independently in tests.
Draft path validity is visible before Apply; invalid Apply reports exact link and preserves active configuration. New draft errors clear on change. Apply/mode changes invalidate old result. Best/completion persist until session restart; solution use remains separately visible.
No unresolved design questions. Planning helper reviews protocol fidelity and limits.
