function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

const addVisibilityIcon = async () => {
  let isClosed = false;
  const showSVG = `<svg xmlns="http://www.w3.org/2000/svg" aria-label="Show Side Panel" width="1.8em" height="1.8em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="var(--text-primary)" d="M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684l.106-.316l-.105-.316C21.927 11.617 19.633 5 12 5zm0 11c-2.206 0-4-1.794-4-4s1.794-4 4-4s4 1.794 4 4s-1.794 4-4 4z"/><path fill="var(--panel-header-icon)" d="M12 10c-1.084 0-2 .916-2 2s.916 2 2 2s2-.916 2-2s-.916-2-2-2z"/></svg>`;
  const hideSVG = `<svg xmlns="http://www.w3.org/2000/svg" aria-label="Hide Side Panel" width="1.8em" height="1.8em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="var(--text-secondary)" d="M8.073 12.194L4.212 8.333c-1.52 1.657-2.096 3.317-2.106 3.351L2 12l.105.316C2.127 12.383 4.421 19 12.054 19c.929 0 1.775-.102 2.552-.273l-2.746-2.746a3.987 3.987 0 0 1-3.787-3.787zM12.054 5c-1.855 0-3.375.404-4.642.998L3.707 2.293L2.293 3.707l18 18l1.414-1.414l-3.298-3.298c2.638-1.953 3.579-4.637 3.593-4.679l.105-.316l-.105-.316C21.98 11.617 19.687 5 12.054 5zm1.906 7.546c.187-.677.028-1.439-.492-1.96s-1.283-.679-1.96-.492L10 8.586A3.955 3.955 0 0 1 12.054 8c2.206 0 4 1.794 4 4a3.94 3.94 0 0 1-.587 2.053l-1.507-1.507z"/></svg>`;

  const lastIconInSideHeader = await waitForElm(
    `header div:has(>span>button[aria-label="Meta AI"])`
  );

  const iconButton = document.createElement('button');
  iconButton.type = 'button';
  iconButton.style.marginBlockStart = '18px';
  iconButton.style.marginInlineStart = '8px';
  iconButton.innerHTML = hideSVG;
  lastIconInSideHeader.insertAdjacentElement('afterend', iconButton);

  const sidePanel = await waitForElm(`#side`);

  iconButton.addEventListener('click', () => {
    if (!isClosed) {
      sidePanel.style.display = 'none';
      iconButton.innerHTML = showSVG;
      isClosed = true;
    } else {
      sidePanel.removeAttribute('style');
      iconButton.innerHTML = hideSVG;
      isClosed = false;
    }
  });
};

const addPanelIcon = async () => {
  let isClosed = false;
  const showPanelSVG = `<svg xmlns="http://www.w3.org/2000/svg" aria-label="Show left panel" fill="var(--text-primary)" height="30" width="30" viewBox="0 -960 960 960"><path d="m375-240-43-43 198-198-198-198 43-43 241 241-241 241Z"/></svg>`;
  const hidePanelSVG = `<svg xmlns="http://www.w3.org/2000/svg" aria-label="Hide left panel" fill="var(--text-primary)" height="30" width="30" viewBox="0 -960 960 960"><path d="M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z"/></svg>`;

  const iconContainer = document.createElement('div');
  iconContainer.style.position = 'absolute';
  iconContainer.style.top = 'calc(50% - 50px)';
  iconContainer.style.right = '-30px';
  iconContainer.style.height = '100px';
  iconContainer.style.borderRadius = '0px 5px 5px 0px';
  iconContainer.style.backgroundColor = 'var(--background-default)';
  iconContainer.style.border = '1px solid var(--conversation-header-border)';
  iconContainer.style.opacity = '0';
  iconContainer.style.display = 'grid';

  iconContainer.addEventListener('mouseenter', () => {
    iconContainer.style.opacity = '1';
    iconContainer.style.removeProperty('transition');
  });

  iconContainer.addEventListener('mouseleave', () => {
    iconContainer.style.opacity = '0';
    iconContainer.style.transition = 'opacity 1s ease-in';
  });

  const iconButton = document.createElement('button');
  iconButton.innerHTML = hidePanelSVG;
  iconContainer.appendChild(iconButton);

  const sidePanel = await waitForElm('#side');
  const panel = sidePanel.parentElement;
  const sideHeadPanel = await waitForElm('header');
  const topHeadPanel = await waitForElm('header:has(h1)');
  // For whatever reason this element has a border which is used a border for
  // `sideHeadPanel` here, so hiding just the `sideHeadPanel` is not enough
  // we need to disable the border on this to remove it completely.
  const borderDiv = await waitForElm('header ~ div > div:first-of-type');
  panel.style.transition = 'max-width 150ms ease-in';

  panel.prepend(iconContainer);

  iconButton.addEventListener('click', async () => {
    /** @type {'contact' | 'both'} */
    let sidebarCollapseLevel = 'both';

    // Try Read from sync storage
    try {
      const settings = await browser.storage.sync.get({
        sidebarCollapseLevel: 'both',
      });

      sidebarCollapseLevel = settings.sidebarCollapseLevel;
    } catch {
      // We can just default to 'both' if reading from
      // sync storage fails, for any reason
    }

    if (!isClosed) {
      panel.style.maxWidth = '0';
      if (sidebarCollapseLevel === 'both') {
        sideHeadPanel.style.display = 'none';
      }
      topHeadPanel.style.display = 'none';
      borderDiv.style.borderLeftWidth = '0px';
      iconButton.innerHTML = showPanelSVG;
      isClosed = true;
    } else {
      panel.style.removeProperty('max-width');
      sideHeadPanel.style.removeProperty('display');
      topHeadPanel.style.removeProperty('display');
      borderDiv.style.removeProperty('border-left-width');
      iconButton.innerHTML = hidePanelSVG;
      isClosed = false;
    }
  });
};

addVisibilityIcon();
addPanelIcon();
