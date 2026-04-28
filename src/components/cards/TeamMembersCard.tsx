import { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { StatusIndicator } from '@/components/common/StatusIndicator';

type MemberStatus = 'online' | 'offline' | 'idle' | 'sleep' | 'not_installed';

interface TeamMember {
  id: string;
  name?: string;
  full_name?: string;
  email?: string;
  role: string;
  status?: MemberStatus;
  productivityScore?: number;
  avatarUrl?: string;
}

interface TeamMembersCardProps {
  member: TeamMember;
  onClick?: (memberId: string) => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function downloadAgentForEmployee(member: TeamMember) {
  const displayName = member.name || member.full_name || 'Employee';
  const email = member.email || '';

  // Use actual LAN IP, not localhost — remote machines can't reach localhost
  // When dashboard runs on localhost, use the server's LAN IP so other machines can connect
  const SERVER_LAN_IP = '192.168.31.253';
  const apiHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? SERVER_LAN_IP
    : window.location.hostname;

  // Log file on the Desktop so the user can easily find and share it
  const logVar = '%USERPROFILE%\\\\Desktop\\\\TrackMe-Install.log';

  const batContent = [
    '@echo off',
    'setlocal enabledelayedexpansion',
    `title TrackMe Agent Setup - ${displayName}`,
    'color 0A',
    '',
    ':: ── Install log ──────────────────────────────────────────────',
    `set "LOG=${logVar}"`,
    'echo. > "%LOG%"',
    'call :LOG "=========================================="',
    `call :LOG "TrackMe Agent Installer - ${displayName}"`,
    'call :LOG "Date: %DATE% %TIME%"',
    'call :LOG "Computer: %COMPUTERNAME%"',
    'call :LOG "User: %USERNAME%"',
    'call :LOG "=========================================="',
    '',
    'echo.',
    'echo  ====================================================',
    `echo    TrackMe Agent Setup for: ${displayName}`,
    'echo  ====================================================',
    'echo.',
    `echo  Server : http://${apiHost}:8000`,
    `echo  Email  : ${email}`,
    'echo  Log    : %LOG%',
    'echo.',
    '',

    // ── Step 1: Kill existing agent & clean old files ──
    'echo [1/7] Cleaning previous installation...',
    'call :LOG "[1/7] Cleaning previous installation"',
    'taskkill /F /IM pythonw.exe >nul 2>&1',
    'taskkill /F /IM python.exe /FI "WINDOWTITLE eq TrackMeAgent" >nul 2>&1',
    'ping -n 2 127.0.0.1 >nul',
    'if exist "%PROGRAMDATA%\\TrackMe\\trackme_agent.py" del /f /q "%PROGRAMDATA%\\TrackMe\\trackme_agent.py"',
    'if exist "%PROGRAMDATA%\\TrackMe\\trackme_agent.db" del /f /q "%PROGRAMDATA%\\TrackMe\\trackme_agent.db"',
    'if exist "%PROGRAMDATA%\\TrackMe\\config.json" del /f /q "%PROGRAMDATA%\\TrackMe\\config.json"',
    'if exist "%PROGRAMDATA%\\TrackMe\\agent.log" del /f /q "%PROGRAMDATA%\\TrackMe\\agent.log"',
    'if exist "%PROGRAMDATA%\\TrackMe\\start_agent.bat" del /f /q "%PROGRAMDATA%\\TrackMe\\start_agent.bat"',
    'call :LOG "       Old files cleaned"',
    'echo        Old files cleaned.',
    '',

    // ── Step 2: Check / auto-install Python ──
    'echo [2/7] Checking Python...',
    'call :LOG "[2/7] Checking Python"',
    'python --version >nul 2>&1',
    'if %errorlevel% neq 0 (',
    '    call :LOG "       Python NOT found - downloading"',
    '    echo        Python not found. Downloading - please wait 2-3 mins...',
    '    if exist "%TEMP%\\python_setup.exe" del /f /q "%TEMP%\\python_setup.exe"',
    '    powershell -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri \'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe\' -OutFile \'%TEMP%\\python_setup.exe\'"',
    '    if not exist "%TEMP%\\python_setup.exe" (',
    '        call :LOG "ERROR: Python download failed"',
    '        echo  ERROR: Python download failed. Check internet.',
    '        goto :fail',
    '    )',
    '    echo        Installing Python silently...',
    '    "%TEMP%\\python_setup.exe" /quiet InstallAllUsers=0 PrependPath=1 Include_pip=1',
    '    del /f /q "%TEMP%\\python_setup.exe" >nul 2>&1',
    '    set "PATH=%LOCALAPPDATA%\\Programs\\Python\\Python311;%LOCALAPPDATA%\\Programs\\Python\\Python311\\Scripts;%PATH%"',
    '    call :LOG "       Python installed"',
    '    echo        Python installed!',
    ') else (',
    '    for /f "tokens=*" %%v in (\'python --version 2^>^&1\') do set "PYVER=%%v"',
    '    call :LOG "       Found: !PYVER!"',
    '    echo        Found: !PYVER!',
    ')',
    '',

    // ── Step 3: Find Python path ──
    'echo [3/7] Locating Python executable...',
    'call :LOG "[3/7] Locating Python executable"',
    'set "PYEXE="',
    'for /f "tokens=*" %%p in (\'where python 2^>nul\') do if not defined PYEXE set "PYEXE=%%p"',
    'if not defined PYEXE (',
    '    call :LOG "ERROR: python.exe not in PATH"',
    '    echo  ERROR: python.exe not found in PATH.',
    '    echo  Restart this CMD window or reboot, then try again.',
    '    goto :fail',
    ')',
    'call :LOG "       Python at: !PYEXE!"',
    'echo        Python at: !PYEXE!',
    '',
    ':: Derive pythonw.exe path from python.exe path',
    'set "PYWEXE=!PYEXE:python.exe=pythonw.exe!"',
    'if not exist "!PYWEXE!" set "PYWEXE=!PYEXE!"',
    'call :LOG "       Will run: !PYWEXE!"',
    '',

    // ── Step 4: Download agent ──
    'echo [4/7] Downloading agent from server...',
    'call :LOG "[4/7] Downloading agent"',
    'if not exist "%PROGRAMDATA%\\TrackMe" mkdir "%PROGRAMDATA%\\TrackMe"',
    `call :LOG "       Server: http://${apiHost}:8000"`,
    `curl -sf -o "%PROGRAMDATA%\\TrackMe\\trackme_agent.py" "http://${apiHost}:8000/api/v1/agents/download-script"`,
    'if %errorlevel% neq 0 (',
    `    call :LOG "ERROR: Cannot reach server at http://${apiHost}:8000"`,
    `    echo  ERROR: Cannot reach server at http://${apiHost}:8000`,
    '    echo  Make sure the server is running and this PC can ping it.',
    '    goto :fail',
    ')',
    'for %%F in ("%PROGRAMDATA%\\TrackMe\\trackme_agent.py") do set "AGENTSIZE=%%~zF"',
    'if "!AGENTSIZE!"=="0" (',
    '    call :LOG "ERROR: Downloaded file is empty"',
    '    echo  ERROR: Downloaded file is empty.',
    '    goto :fail',
    ')',
    'call :LOG "       Agent downloaded (!AGENTSIZE! bytes)"',
    'echo        Agent downloaded (!AGENTSIZE! bytes).',
    '',

    // ── Step 5: Install packages ──
    'echo [5/7] Installing Python packages...',
    'call :LOG "[5/7] Installing packages"',
    '"!PYEXE!" -m pip install requests psutil pillow pystray --quiet --disable-pip-version-check 2>>"%LOG%"',
    'if %errorlevel% neq 0 (',
    '    call :LOG "WARNING: pip install had errors - check log"',
    '    echo        WARNING: Some packages may have failed. Check log.',
    ') else (',
    '    call :LOG "       All packages installed"',
    '    echo        All packages installed.',
    ')',
    '',

    // ── Step 6: Write config ──
    'echo [6/7] Writing config...',
    'call :LOG "[6/7] Writing config"',
    '(',
    'echo {',
    `echo   "api_base_url": "http://${apiHost}:8000/api/v1",`,
    'echo   "idle_threshold_seconds": 60,',
    'echo   "sync_interval_seconds": 60,',
    'echo   "screenshot_interval_seconds": 120,',
    'echo   "log_level": "INFO",',
    `echo   "user_email": "${email}"`,
    'echo }',
    ') > "%PROGRAMDATA%\\TrackMe\\config.json"',
    'call :LOG "       Config written"',
    'echo        Config written.',
    '',

    // ── Step 7: Auto-start + launch ──
    'echo [7/7] Setting up auto-start and launching...',
    'call :LOG "[7/7] Auto-start + launch"',
    '',
    ':: Write start_agent.bat using the actual Python path',
    '(',
    'echo @echo off',
    'echo ping -n 16 127.0.0.1 ^> nul',
    'echo cd /d C:\\ProgramData\\TrackMe',
    `echo start /b "" "!PYWEXE!" trackme_agent.py`,
    ') > "%PROGRAMDATA%\\TrackMe\\start_agent.bat"',
    'call :LOG "       start_agent.bat written"',
    '',
    ':: Write VBS auto-start in Startup folder',
    'set "STARTUP=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup"',
    '(',
    'echo Set WshShell = CreateObject^("WScript.Shell"^)',
    'echo WshShell.Run """C:\\ProgramData\\TrackMe\\start_agent.bat""", 0, False',
    'echo Set WshShell = Nothing',
    ') > "%STARTUP%\\TrackMeAgent.vbs"',
    'call :LOG "       VBS auto-start written"',
    'echo        Auto-start configured.',
    '',
    ':: Launch the agent now',
    'call :LOG "       Launching agent with: !PYWEXE!"',
    'echo        Launching agent...',
    'cd /d "%PROGRAMDATA%\\TrackMe"',
    'start /b "" "!PYWEXE!" trackme_agent.py',
    'ping -n 4 127.0.0.1 >nul',
    '',
    ':: Verify it is running',
    'tasklist /FI "IMAGENAME eq pythonw.exe" 2>nul | findstr /i pythonw >nul',
    'if %errorlevel%==0 (',
    '    call :LOG "       Agent is RUNNING (pythonw.exe)"',
    '    echo        Agent is RUNNING.',
    ') else (',
    '    tasklist /FI "IMAGENAME eq python.exe" 2>nul | findstr /i python >nul',
    '    if !errorlevel!==0 (',
    '        call :LOG "       Agent is RUNNING (python.exe)"',
    '        echo        Agent is RUNNING.',
    '    ) else (',
    '        call :LOG "WARNING: Agent process not detected"',
    '        echo        WARNING: Agent may not have started. Check agent.log',
    '    )',
    ')',
    '',

    // ── Done ──
    'call :LOG "=========================================="',
    'call :LOG "INSTALL COMPLETE"',
    'call :LOG "=========================================="',
    'echo.',
    'echo  ====================================================',
    'echo    DONE! TrackMe is now running in the background.',
    'echo  ====================================================',
    'echo.',
    `echo   Server : http://${apiHost}:8000`,
    `echo   User   : ${email}`,
    'echo   Logs   : C:\\ProgramData\\TrackMe\\agent.log',
    'echo   Install: %LOG%',
    'echo.',
    'echo   Starts automatically every time you log in.',
    'echo.',
    'echo  Press any key to close this window...',
    'pause >nul',
    'goto :eof',
    '',

    // ── Fail handler — never closes without user seeing the error ──
    ':fail',
    'echo.',
    'echo  ====================================================',
    'echo    INSTALLATION FAILED - see details above',
    'echo  ====================================================',
    'echo  Install log saved to: %LOG%',
    'echo.',
    'echo  Send the log file to your admin for help.',
    'echo.',
    'echo  Press any key to close this window...',
    'pause >nul',
    'goto :eof',
    '',

    // ── Log helper function ──
    ':LOG',
    'echo %~1',
    'echo %~1 >> "%LOG%"',
    'goto :eof',
  ].join('\r\n');

  const safeName = displayName.replace(/[^a-zA-Z0-9]/g, '-');
  const blob = new Blob([batContent], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TrackMe-Agent-${safeName}.bat`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadMacAgentForEmployee(member: TeamMember) {
  const displayName = member.name || member.full_name || 'Employee';
  const email = member.email || '';

  const SERVER_LAN_IP = '192.168.31.253';
  const apiHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? SERVER_LAN_IP
    : window.location.hostname;

  const shContent = `#!/bin/bash
# ── TrackMe Agent Installer for macOS ──
# User: ${displayName} (${email})
# Server: http://${apiHost}:8000

set -e
LOG="$HOME/Desktop/TrackMe-Install.log"
echo "" > "$LOG"
log() { echo "$1"; echo "$1" >> "$LOG"; }

log "=========================================="
log "TrackMe Mac Agent Installer — ${displayName}"
log "Date: $(date)"
log "Computer: $(hostname)"
log "User: $(whoami)"
log "=========================================="

echo ""
echo "  ===================================================="
echo "    TrackMe Agent Setup for: ${displayName}"
echo "  ===================================================="
echo "  Server: http://${apiHost}:8000"
echo "  Email:  ${email}"
echo ""

# Step 1: Check Python
log "[1/6] Checking Python..."
if ! command -v python3 &>/dev/null; then
    log "ERROR: Python 3 not found. Install from python.org or run: brew install python3"
    echo "Press Enter to exit..."
    read
    exit 1
fi
PYVER=$(python3 --version 2>&1)
log "       Found: $PYVER"

# Step 2: Clean old installation
log "[2/6] Cleaning old installation..."
pkill -f trackme_agent_mac.py 2>/dev/null || true
sleep 1
DATA_DIR="$HOME/Library/Application Support/TrackMe"
rm -f "$DATA_DIR/trackme_agent_mac.py" "$DATA_DIR/trackme_agent.db" "$DATA_DIR/config.json" "$DATA_DIR/agent.log" 2>/dev/null
log "       Old files cleaned"

# Step 3: Download agent from server
log "[3/6] Downloading agent..."
mkdir -p "$DATA_DIR"
curl -sf -o "$DATA_DIR/trackme_agent_mac.py" "http://${apiHost}:8000/api/v1/agents/download-script-mac"
if [ ! -s "$DATA_DIR/trackme_agent_mac.py" ]; then
    log "ERROR: Cannot download agent from http://${apiHost}:8000"
    log "Make sure the server is running and this Mac can reach it."
    echo "Press Enter to exit..."
    read
    exit 1
fi
AGENTSIZE=$(wc -c < "$DATA_DIR/trackme_agent_mac.py" | tr -d ' ')
log "       Agent downloaded ($AGENTSIZE bytes)"

# Step 4: Install packages
log "[4/6] Installing Python packages..."
python3 -m pip install requests psutil pillow pystray --quiet 2>>"$LOG" || true
log "       Packages installed"

# Step 5: Write config
log "[5/6] Writing config..."
cat > "$DATA_DIR/config.json" << 'CONFIGEOF'
{
  "api_base_url": "http://${apiHost}:8000/api/v1",
  "idle_threshold_seconds": 60,
  "sync_interval_seconds": 60,
  "screenshot_interval_seconds": 120,
  "log_level": "INFO",
  "user_email": "${email}"
}
CONFIGEOF
log "       Config written"

# Step 6: Setup LaunchAgent and start
log "[6/6] Setting up auto-start..."
python3 "$DATA_DIR/trackme_agent_mac.py" --install-only 2>>"$LOG" || true
log "       LaunchAgent installed"

# Launch agent
log "       Starting agent..."
nohup python3 "$DATA_DIR/trackme_agent_mac.py" > /dev/null 2>&1 &
sleep 3

if pgrep -f trackme_agent_mac.py > /dev/null; then
    log "       Agent is RUNNING"
else
    log "WARNING: Agent may not have started. Check: $DATA_DIR/agent.log"
fi

log "=========================================="
log "INSTALL COMPLETE"
log "=========================================="
echo ""
echo "  ===================================================="
echo "    DONE! TrackMe is now running in the background."
echo "  ===================================================="
echo ""
echo "  Server : http://${apiHost}:8000"
echo "  User   : ${email}"
echo "  Logs   : $DATA_DIR/agent.log"
echo "  Install: $LOG"
echo ""
echo "  Starts automatically on login."
echo ""
echo "  Press Enter to close..."
read
`;

  // Fix the heredoc — config values need to be literal, not shell variables
  const fixedContent = shContent
    .replace(/\$\{apiHost\}/g, apiHost)
    .replace(/\$\{email\}/g, email)
    .replace(/\$\{displayName\}/g, displayName);

  const safeName = displayName.replace(/[^a-zA-Z0-9]/g, '-');
  const blob = new Blob([fixedContent], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TrackMe-Agent-${safeName}-Mac.command`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function TeamMembersCard({ member, onClick }: TeamMembersCardProps) {
  const displayName = member.name || member.full_name || 'Unknown';
  const score = member.productivityScore ?? 0;
  const status = member.status ?? 'offline';
  const scoreColor = getScoreColor(score);
  const [showOsMenu, setShowOsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showOsMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowOsMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showOsMenu]);

  return (
    <article
      className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${
        onClick
          ? 'cursor-pointer hover:border-blue-300 hover:shadow-md dark:hover:border-blue-600'
          : ''
      } transition-all`}
      onClick={() => onClick?.(member.id)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick(member.id);
        }
      }}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${displayName}, ${member.role}, productivity score ${score}`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {getInitials(displayName)}
            </div>
          )}
          {status !== 'not_installed' && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <StatusIndicator status={status} size="sm" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {displayName}
          </p>
          {status === 'not_installed' ? (
            <p className="truncate text-xs font-medium text-orange-500">
              Agent not installed
            </p>
          ) : (
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {member.role}
            </p>
          )}
        </div>

        {/* Score */}
        <div className="text-right">
          <p className={`text-lg font-bold ${scoreColor}`}>
            {score}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Score</p>
        </div>
      </div>

      {/* Progress bar + Download Agent */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1">
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${score}%` }}
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Productivity: ${score}%`}
            />
          </div>
        </div>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOsMenu(!showOsMenu);
            }}
            className="rounded-md p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
            title={`Download agent for ${displayName}`}
            aria-label={`Download agent for ${displayName}`}
          >
            <Download className="h-4 w-4" />
          </button>
          {showOsMenu && (
            <div className="absolute right-0 bottom-full mb-1 z-50 w-40 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadAgentForEmployee(member);
                  setShowOsMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-t-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <span>🪟</span> Windows
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadMacAgentForEmployee(member);
                  setShowOsMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <span>🍎</span> macOS
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
