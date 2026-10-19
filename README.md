# OSDU Airflow Runtime for Azure

[![Release](https://img.shields.io/github/v/release/KiranBedre/osdu-spi-airflow)](https://github.com/KiranBedre/osdu-spi-airflow/releases)
[![Validate](https://github.com/KiranBedre/osdu-spi-airflow/actions/workflows/validate.yml/badge.svg?branch=main)](https://github.com/KiranBedre/osdu-spi-airflow/actions/workflows/validate.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

This repository builds the shared Apache Airflow runtime used by the
Azure-native OSDU SPI Stack. It contains the OSDU Python libraries required by
workflow DAGs, but no DAGs.

## Contract

| | |
|---|---|
| Apache Airflow | `3.2.2`, Python 3.12 |
| Base image | Digest-pinned official `apache/airflow` image |
| OSDU libraries | `osdu-api`, `osdu-airflow[af3]`, `osdu-ingestion` |
| Kubernetes provider | `apache-airflow-providers-cncf-kubernetes` |
| DAG ownership | Each service publishes and deploys its own DAG artifact |
| Deployed by | [OSDU SPI Stack](https://github.com/Azure/osdu-spi-stack) |

The image build runs `pip check`, verifies every declared package version, and
fails if the image contains any DAG file. The Stack pins the published image
by digest.

## Repository layout

| Path | Contents |
|---|---|
| `.spi/runtime/requirements.txt` | Exact shared runtime dependency pins |
| `.spi/image/Dockerfile` | Digest-pinned Airflow runtime build |
| `.spi/acceptance/` | Deployed Airflow health probe and JUnit evidence |
| `.spi/tests/` | Acceptance probe unit tests |
| `.spi/service.yaml` | SPI build, image, and acceptance contract |

## Build

```bash
docker build --file .spi/image/Dockerfile --tag osdu-spi-airflow .
```

The Dockerfile installs dependencies under the official Airflow 3.2.2 Python
3.12 constraints.

## Test

Run the health-probe tests with Node.js 22 or newer:

```bash
node --test .spi/tests/*.test.mjs
```

The acceptance image calls Airflow's `/api/v2/monitor/health` endpoint through
the Stack gateway and requires healthy metadatabase and scheduler states.

## Release and deployment

Pull requests publish immutable `sha-<commit>` images. Release Please promotes
the merge commit's existing image to a semantic-version tag without rebuilding
it. The Stack consumes only an immutable digest.

This repository owns only the common runtime. VDS, ZGY, and other workflows
publish their DAG zips and task images independently.

## License

Copyright © Microsoft Corporation

Licensed under the [Apache License 2.0](LICENSE).
