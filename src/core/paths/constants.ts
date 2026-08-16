// Registry locations used to find Content Manager and Assetto Corsa. All
// discovered rather than hardcoded - CM's acmanager:// protocol registration is
// both the launch mechanism and the way to find where it lives.

/**
 * Protocol registration whose default value is the CM launch command.
 */
export const REG_ACMANAGER_COMMAND = 'HKEY_CLASSES_ROOT\\acmanager\\shell\\open\\command';

/**
 * Steam's own key, whose SteamPath value points at the Steam install.
 */
export const REG_STEAM = 'HKEY_CURRENT_USER\\Software\\Valve\\Steam';

/**
 * Value name under REG_STEAM holding the Steam install path.
 */
export const REG_STEAM_PATH_VALUE = 'SteamPath';

/**
 * Where Windows records the real location of the Documents folder, which
 * OneDrive relocates routinely.
 */
export const REG_USER_SHELL_FOLDERS = 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows'
  + '\\CurrentVersion\\Explorer\\User Shell Folders';

/**
 * Value name under REG_USER_SHELL_FOLDERS holding the Documents path.
 */
export const REG_PERSONAL_VALUE = 'Personal';

/**
 * Folder name Assetto Corsa creates inside Documents.
 */
export const AC_DOCUMENTS_FOLDER = 'Assetto Corsa';
