# Contributing

This repository is an original SPI-owned runtime with no upstream source
repository. Apache Airflow is a pinned image dependency, not a Git upstream.

> [!IMPORTANT]
> Code contributions are limited to Microsoft employees at this time. Anyone
> can report a bug or request a feature through GitHub Issues.

## Ownership

| Area | Owner | Where to make the change |
|---|---|---|
| `.spi/`, `README.md`, `CONTRIBUTING.md` | This repository | A pull request here |
| `.github/`, `build/`, `.release-please-config.json` | `KiranBedre/osdu-spi` | The template; template sync overwrites these files |
| DAG artifacts and task images | The service repository | VDS, ZGY, or the repository that owns the workflow |
| Airflow chart and Azure resources | `Azure/osdu-spi-stack` | The Stack repository |

## Making a change

1. Branch from `main` with a type prefix such as `feat/`, `fix/`, or `chore/`.
2. Keep runtime dependencies exact and compatible with the pinned Airflow and
   Python versions.
3. Run `node --test .spi/tests/*.test.mjs` and build the Dockerfile.
4. Use Conventional Commits for commits and pull request titles.
5. Open a pull request against `main`.

Merging requires passing validation and CodeQL checks, every review thread
resolved, and the repository's required approval.

## License

By contributing, you agree that your contributions will be licensed under the
[Apache License 2.0](LICENSE).
