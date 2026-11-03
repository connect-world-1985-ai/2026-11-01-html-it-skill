Explain for new team members how our release train works:
master -> release branch cut every 4 weeks (R26.11 cut on 2026-11-02), hotfix branches from the release branch, merge-back to master after each hotfix, version numbers like 8.4.0.1 (major.minor.patch.hotfix). QA sign-off gate before the cut. Owners: release manager rotates monthly.
