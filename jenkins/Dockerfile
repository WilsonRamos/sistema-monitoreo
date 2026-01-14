# ==================================
# DOCKERFILE - Jenkins con Node.js + Docker
# ==================================
# Imagen personalizada de Jenkins que incluye:
# - Jenkins LTS
# - Node.js 20.x LTS
# - npm
# - Docker CLI
# ==================================

FROM jenkins/jenkins:lts

# Cambiar a usuario root para instalar paquetes
USER root

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    ca-certificates \
    apt-transport-https \
    software-properties-common

# Instalar Node.js 20.x LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Verificar instalación de Node.js y npm
RUN node --version && npm --version

# Instalar Docker CLI
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli

# Limpiar cache de apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Dar permisos al usuario jenkins para usar Docker socket
RUN usermod -aG docker jenkins

# Volver al usuario jenkins
USER jenkins

# Exponer puertos
EXPOSE 8080 50000
