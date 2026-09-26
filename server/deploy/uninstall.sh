#!/bin/bash
# Removes the background services. The data in ~/swiss-passport-server is kept.
set -euo pipefail
for plist in ch.swisspassport.quiz ch.swisspassport.quiz.backup; do
  sudo launchctl bootout system "/Library/LaunchDaemons/$plist.plist" 2>/dev/null || true
  sudo rm -f "/Library/LaunchDaemons/$plist.plist"
done
sudo pmset -a disablesleep 0
echo "Services removed. Data kept in $HOME/swiss-passport-server"
