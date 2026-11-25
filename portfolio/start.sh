#!/bin/sh
set -eu
# Aiven supplies a public CA certificate for verifying its MySQL endpoint.
if [ "${SPRING_PROFILES_ACTIVE:-}" = "portfolio,postgres" ]; then
  exec java -Xms48m -Xmx200m -Xss512k -XX:ActiveProcessorCount=1 -XX:+UseSerialGC -jar /app/mostrador.jar
fi
truststore=$(mktemp -d)/aiven.p12
printf '%s\n' "${AIVEN_CA_PEM:?Missing Aiven CA certificate}" > "${truststore}.pem"
keytool -importcert -noprompt -alias aiven -file "${truststore}.pem" -keystore "$truststore" -storetype PKCS12 -storepass changeit >/dev/null
exec java -Xms48m -Xmx200m -Xss512k -XX:ActiveProcessorCount=1 -XX:+UseSerialGC \
  "-Djavax.net.ssl.trustStore=$truststore" -Djavax.net.ssl.trustStorePassword=changeit \
  -jar /app/mostrador.jar
