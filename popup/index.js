/**
 * Enum for the keys for setting values stored in sync storage
 */
const SettingKeys = Object.freeze({
  SIDEBAR_COLLAPSE_LEVEL: 'sidebarCollapseLevel',
});

/**
 * @typedef {'contact' | 'both'} SIDEBAR_COLLAPSE_LEVELS_TYPE
 * Sidebar collapse level type
 */

/**
 * Enum for sidebar collapse level options
 */
const SIDEBAR_COLLAPSE_LEVELS = Object.freeze({
  CONTACT: 'contact',
  BOTH: 'both',
});

/**
 * Function to run when the popup is opened
 */
function runScript() {
  document.querySelector('form').addEventListener('submit', saveSettings);

  restoreSettings();
}

/**
 * Show an alert with a message and a type
 * @param {string} message
 * @param {'error' | 'success'} type
 */
function showAlert(message, type) {
  const alert = document.querySelector('#submit-feedback');
  alert.classList.add(type);
  alert.textContent = message;

  setTimeout(() => {
    alert.classList.remove(type);
    alert.textContent = '';
  }, 2000);
}

/**
 * Settings form submit handler
 * @param {SubmitEvent} e
 */
async function saveSettings(e) {
  e.preventDefault();

  /** @type {HTMLFormElement} */
  const form = e.target;

  try {
    /** @type {SIDEBAR_COLLAPSE_LEVELS_TYPE} */
    const sidebarCollapseLevel = form.elements['sidebar-collapse-level'].value;

    await browser.storage.sync.set({
      [SettingKeys.SIDEBAR_COLLAPSE_LEVEL]: sidebarCollapseLevel,
    });

    showAlert('Settings saved!', 'success');
  } catch {
    showAlert('Failed to save settings!', 'error');
  }
}

/**
 * Restore settings from sync storage when
 * the popup is opened
 */
async function restoreSettings() {
  try {
    /**
     * @type {{
     *   [SettingKeys.SIDEBAR_COLLAPSE_LEVEL]: SIDEBAR_COLLAPSE_LEVELS
     * }}
     */
    const settings = await browser.storage.sync.get({
      [SettingKeys.SIDEBAR_COLLAPSE_LEVEL]: SIDEBAR_COLLAPSE_LEVELS.BOTH,
    });

    const sidebarCollapseLevelElement = document.querySelector(
      '#sidebar-collapse-level'
    );
    if (sidebarCollapseLevelElement) {
      sidebarCollapseLevelElement.value =
        settings[SettingKeys.SIDEBAR_COLLAPSE_LEVEL];
    }
  } catch {
    // Ignore error for now, not sure what to do with it
  }
}

document.addEventListener('DOMContentLoaded', runScript);
