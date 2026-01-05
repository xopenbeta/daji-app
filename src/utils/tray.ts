import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu } from '@tauri-apps/api/menu';
import { defaultWindowIcon } from '@tauri-apps/api/app';

/**
 * Setup system tray icon (frontend version)
 * Note: Usually handled by backend Rust code, this is a fallback
 */
export async function setupTray() {
  try {
    // Create tray menu
    const menu = await Menu.new({
      items: [
        {
          id: 'show',
          text: 'Show Main Window',
          action: () => {
            console.log('Show Main Window');
            // Can call Tauri API to show window
          }
        },
        {
          id: 'hide',
          text: 'Hide Window',
          action: () => {
            console.log('Hide Window');
          }
        },
        {
          id: 'separator',
          text: '',
        },
        {
          id: 'quit',
          text: 'Quit',
          action: () => {
            console.log('Quit Application');
            // Can call Tauri API to quit application
          }
        }
      ]
    });

    // Create tray icon
    const icon = await defaultWindowIcon();
    if (!icon) {
      throw new Error('Unable to get default window icon');
    }

    const tray = await TrayIcon.new({
      icon,
      menu,
      menuOnLeftClick: false,
      tooltip: 'Daji',
      action: (event) => {
        switch (event.type) {
          case 'Click':
            console.log(
              `Mouse ${event.button} button pressed, state: ${event.buttonState}`
            );
            break;
          case 'DoubleClick':
            console.log(`Mouse ${event.button} button double-clicked`);
            break;
          case 'Enter':
            console.log(
              `Mouse entered tray icon position: ${event.rect.position.x}, ${event.rect.position.y}`
            );
            break;
          case 'Move':
            console.log(
              `Mouse moving on tray icon position: ${event.rect.position.x}, ${event.rect.position.y}`
            );
            break;
          case 'Leave':
            console.log(
              `Mouse left tray icon position: ${event.rect.position.x}, ${event.rect.position.y}`
            );
            break;
        }
      }
    });

    console.log('System tray icon created', tray);
    return tray;
  } catch (error) {
    console.error('Failed to create system tray icon:', error);
    throw error;
  }
}

/**
 * Update tray icon title
 */
export async function updateTrayTitle(title: string) {
  try {
    // Need to save a reference to the tray instance here
    console.log('Update tray title:', title);
  } catch (error) {
    console.error('Failed to update tray title:', error);
  }
}
