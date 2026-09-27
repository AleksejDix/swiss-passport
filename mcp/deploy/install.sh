#!/bin/bash
# Installs the quiz server on this Mac as a background service that starts at boot.
# Run from the unpacked release folder:  ./install.sh
set -euo pipefail
cd "$(dirname "$0")"

APP_DIR="$HOME/swiss-passport-server"
PORT=8787
LABEL=ch.swisspassport.quiz

NODE=$(command -v node || true)
if [[ -z "$NODE" ]] || ! "$NODE" -e 'require("node:sqlite")' 2>/dev/null; then
  echo "Node.js 22.13 or newer is needed. Install the LTS version from https://nodejs.org and run this again."
  exit 1
fi

echo "Copying server to $APP_DIR"
mkdir -p "$APP_DIR/backups"
rm -rf "$APP_DIR/dist" "$APP_DIR/data"
cp -R dist data "$APP_DIR/"

echo "Registering background services (asks for your password)"
sudo tee "/Library/LaunchDaemons/$LABEL.plist" >/dev/null <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>UserName</key><string>$USER</string>
  <key>ProgramArguments</key><array><string>$NODE</string><string>$APP_DIR/dist/http.js</string></array>
  <key>EnvironmentVariables</key><dict>
    <key>PORT</key><string>$PORT</string>
    <key>DB_FILE</key><string>$APP_DIR/learners.db</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$APP_DIR/server.log</string>
  <key>StandardErrorPath</key><string>$APP_DIR/server.log</string>
</dict></plist>
EOF

# Nightly backup of the progress database, one file per weekday (kept for a week).
sudo tee "/Library/LaunchDaemons/$LABEL.backup.plist" >/dev/null <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL.backup</string>
  <key>UserName</key><string>$USER</string>
  <key>ProgramArguments</key><array><string>/bin/sh</string><string>-c</string>
    <string>/usr/bin/sqlite3 "$APP_DIR/learners.db" ".backup '$APP_DIR/backups/learners-\$(date +%a).db'"</string></array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>3</integer><key>Minute</key><integer>0</integer></dict>
</dict></plist>
EOF

for plist in "$LABEL" "$LABEL.backup"; do
  sudo launchctl bootout system "/Library/LaunchDaemons/$plist.plist" 2>/dev/null || true
  sudo launchctl bootstrap system "/Library/LaunchDaemons/$plist.plist"
done

echo "Keeping the Mac awake on power adapter (also with the lid closed)"
sudo pmset -c sleep 0 disksleep 0
sudo pmset -a disablesleep 1

sleep 2
if curl -fsS "http://localhost:$PORT/" >/dev/null; then
  echo "Server is running: http://localhost:$PORT/mcp"
else
  echo "Server did not start. See $APP_DIR/server.log"
  exit 1
fi

cat <<EOF

Next: make it reachable from the internet with Tailscale Funnel (free):
  1. Install Tailscale from https://tailscale.com/download/mac and log in.
  2. Run:  tailscale funnel --bg $PORT
  3. The command prints an address like https://<name>.ts.net
     Your Claude connector URL is that address + /mcp
EOF
