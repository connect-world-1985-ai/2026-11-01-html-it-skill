# Portal Apache stack (era-aware)

One home for how apache-dist, medavis.apache, medavis-apache.portable, and
medavis.solution relate. Maps stay tables; `release-quality-gate` procedure
for a named 2.x/Chocolatey ship is `production/skills/release-quality-gate/apache-stack.md`.
Do not restate these lists in the identity/overview/dependency maps.

Over-claiming that apache-dist still ships httpd binaries on a 2.0+ train is a visible
failure after WEBPROXY-15: 2.0+ ships a config zip only.

## Eras

| Era | How to recognize | What apache-dist is |
|---|---|---|
| **1.x** (e.g. `1.45.0.1`, last 1.x `1.47.0.1`) | named apache-dist `a==1` | Maven zip that also packaged httpd binaries and Chocolatey install in this repo |
| **2.0+** (e.g. `2.0.0.3`) | named apache-dist `a>=2` or named `medavis-apache.portable` | Config store only: `medavis-conf/conf/`, `error/`, `htdocs/`. Not binaries, not the Windows service, not certificates. WEBPROXY-15 stripped in-repo Chocolatey/httpd packaging. |

Discriminator is the **named apache-dist / Chocolatey version**, not whether the quality gate is a master-cut or a patch.

## Four layers (2.0+)

| Piece | Inventory | Layer | Owns |
|---|---|---|---|
| apache-dist | #25 `d:\git\apache-dist\` NEXT-DE | config | Maven zip `de.medavis.infrastructure:medavis-apache-dist` |
| medavis.apache | #32 `d:\git\medavis.apache\` PSH | runtime | Applies/mutates the installed tree. Does not depend on medavis.solution. |
| medavis-apache.portable | #33 package dir in `d:\git\chocolatey\packages\portable\medavis-apache.portable` (repo PDD/chocolatey) | packaging + install | Lounge Win64 + dist overlay + bundled medavis.apache (+ common, certificateManagement) |
| medavis.solution | #22 `d:\git\medavis.solution\` PSH | orchestration | RequiredModules includes medavis.apache. Not an input to the Chocolatey recipe. |

Dependency direction: solution → medavis.apache → files that originated in apache-dist. Chocolatey bundles medavis.apache; it does not depend on solution.

## Version schemes (do not align as one a.b.c.d)

| Piece | Example | Scheme |
|---|---|---|
| apache-dist | `2.0.0.3` | Maven 4-digit. Parent remains `installer-infrastructure`. |
| medavis-apache.portable | `2.4.68.26082810` | Apache Lounge httpd + pack clock `yyMMddHH`. `createAndBuild.ps1` pulls *latest* Nexus dist zip and *latest* PSGallery-Group modules. Those versions are written into the **nupkg description**, not into the Chocolatey version. No git tag equals the package version. |
| medavis.solution | `2.6.1101` | psd1 `ModuleVersion` is `2.6`; `.rev` is CI. |
| medavis.apache | `1.0.58` | CI. Git has no tags; psd1 still `1.0.0`. |

Worked mail trio (2026-08-28): apache-dist `2.0.0.3` tagged 09:59 +0200; Chocolatey `2.4.68.26082810` is the same morning’s pack clock (~10:xx). Correlation is temporal/build-time, not a Maven property.

## Pins for medavis.apache (2.0+)

Two pins can diverge:

1. **solution RequiredVersion** — `medavis.solution/medavis.solution.psd1` `RequiredModules` entry `medavis.apache` (pin: see the solution's `RequiredVersion`). Readable from git at the gated solution ref.
2. **nupkg-bundled** — `Find-Module` latest at `createAndBuild.ps1` pack time; recorded in the expanded nuspec description. Not stored as a committed version in the chocolatey git tree.

Release mail typically omits medavis.apache. Quality-gate discovers (1) always; (2) if Chocolatey/Nexus metadata is reachable.

## Who changes what

| Change | Work in |
|---|---|
| httpd.conf templates, error pages, robots.txt, maintenance HTML | apache-dist |
| How those files are copied, parameterized, rewritten, backed up | medavis.apache |
| What is downloaded, merged, versioned, shipped as installer | medavis-apache.portable (`createAndBuild.ps1`, nuspec, chocolateyInstall.ps1) |
| Solution-wide ops that also touch Apache | medavis.solution (call medavis.apache; do not duplicate) |

## 1.x leftover

On a 1.x apache-dist tag, Chocolatey/httpd packaging still lives in that repo. Do not describe 1.x with the 2.0 four-layer table as if it were current. Do not put medavis.apache / medavis-apache.portable on a 1.x gate unless the user named them anyway.
