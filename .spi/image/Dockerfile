FROM apache/airflow:3.2.2-python3.12@sha256:bbe58e3204d550ab98dbf738a42c0e6663c455357ecd0e2d1440ef9cb6a75f00 AS runtime

ARG AIRFLOW_VERSION=3.2.2
ARG PYTHON_VERSION=3.12

COPY --chown=airflow:root .spi/runtime/requirements.txt /tmp/spi/requirements.txt

RUN python -m pip install --no-cache-dir \
      --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt" \
      --requirement /tmp/spi/requirements.txt \
    && python -m pip check \
    && python -c "from importlib.metadata import version; expected={'apache-airflow':'3.2.2','apache-airflow-providers-cncf-kubernetes':'10.17.1','osdu-api':'1.2.4','osdu-airflow':'0.30.7','osdu-ingestion':'0.30.2'}; actual={name:version(name) for name in expected}; assert actual == expected, (actual, expected)" \
    && test -z "$(find /opt/airflow/dags -mindepth 1 -print -quit)" \
    && rm -rf /tmp/spi

FROM runtime AS spi-test-build

RUN mkdir -p /tmp/spi-test \
    && printf '%s\n' \
      '<?xml version="1.0" encoding="UTF-8"?>' \
      '<testsuite name="airflow-runtime-image" tests="1" failures="0">' \
      '  <testcase classname="spi.airflow" name="dependencies_are_compatible_and_no_dags_are_baked"/>' \
      '</testsuite>' \
      > /tmp/spi-test/ctest.xml

FROM scratch AS spi-test

COPY --from=spi-test-build /tmp/spi-test/ctest.xml /ctest.xml

FROM runtime AS final
