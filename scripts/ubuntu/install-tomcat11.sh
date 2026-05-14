#!/usr/bin/env bash

set -euo pipefail

TOMCAT_VERSION="${TOMCAT_VERSION:-11.0.18}"
TOMCAT_USER="${TOMCAT_USER:-tomcat}"
INSTALL_DIR="${INSTALL_DIR:-/opt/tomcat}"
JAVA_HOME_DEFAULT="${JAVA_HOME_DEFAULT:-/usr/lib/jvm/java-17-openjdk-amd64}"
TOMCAT_ARCHIVE="apache-tomcat-${TOMCAT_VERSION}.tar.gz"
TOMCAT_URL="https://downloads.apache.org/tomcat/tomcat-11/v${TOMCAT_VERSION}/bin/${TOMCAT_ARCHIVE}"

apt-get update
apt-get install -y openjdk-17-jdk curl tar

if ! id -u "${TOMCAT_USER}" >/dev/null 2>&1; then
    useradd --system --shell /usr/sbin/nologin --home-dir "${INSTALL_DIR}" "${TOMCAT_USER}"
fi

mkdir -p "${INSTALL_DIR}"
curl -fsSL "${TOMCAT_URL}" -o "/tmp/${TOMCAT_ARCHIVE}"
tar -xzf "/tmp/${TOMCAT_ARCHIVE}" --strip-components=1 -C "${INSTALL_DIR}"

chown -R "${TOMCAT_USER}:${TOMCAT_USER}" "${INSTALL_DIR}"
chmod +x "${INSTALL_DIR}/bin/"*.sh

cat > /etc/systemd/system/tomcat.service <<EOF
[Unit]
Description=Apache Tomcat 11
After=network.target

[Service]
Type=simple
User=${TOMCAT_USER}
Group=${TOMCAT_USER}
Environment=JAVA_HOME=${JAVA_HOME_DEFAULT}
Environment=CATALINA_HOME=${INSTALL_DIR}
Environment=CATALINA_BASE=${INSTALL_DIR}
Environment=CATALINA_PID=${INSTALL_DIR}/temp/tomcat.pid
ExecStart=${INSTALL_DIR}/bin/catalina.sh run
ExecStop=${INSTALL_DIR}/bin/catalina.sh stop -force
SuccessExitStatus=143
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable tomcat
systemctl restart tomcat

echo "Tomcat instalado en ${INSTALL_DIR}"
echo "Servicio registrado como: tomcat.service"
