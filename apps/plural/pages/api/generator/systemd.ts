import { NextApiRequest, NextApiResponse } from "next";

export default function sidekiqGenerator(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== "development") {
    res.status(404).send("");
  }

  const template = `
[Unit]
Description=Plural server
After=network.target

[Service]
Type=simple
User=plural
WorkingDirectory=/home/plural/${process.env.SITE_DIRECTORY}
ExecStart=/home/plural/${process.env.SITE_DIRECTORY}/node_modules/.bin/nx run plural:serve:production
TimeoutSec=15
Restart=always

# Proc filesystem
ProcSubset=pid
ProtectProc=invisible

# Capabilities
CapabilityBoundingSet=
# Security
NoNewPrivileges=true
# Sandboxing
ProtectSystem=strict
PrivateTmp=true
PrivateDevices=true
PrivateUsers=true
ProtectHostname=true
ProtectKernelLogs=true
ProtectKernelModules=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictAddressFamilies=AF_INET
RestrictAddressFamilies=AF_INET6
RestrictAddressFamilies=AF_NETLINK
RestrictAddressFamilies=AF_UNIX
RestrictNamespaces=true
LockPersonality=true
RestrictRealtime=true
RestrictSUIDSGID=true
RemoveIPC=true
PrivateMounts=true
ProtectClock=true
# System Call Filtering
SystemCallArchitectures=native
SystemCallFilter=~@cpu-emulation @debug @keyring @ipc @mount @obsolete @privileged @setuid
SystemCallFilter=@chown
SystemCallFilter=pipe
SystemCallFilter=pipe2
ReadWritePaths=/home/plural/${process.env.SITE_DIRECTORY}

[Install]
WantedBy=multi-user.target
`;

  res.send(template);
}
