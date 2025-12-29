use anyhow::Result;
use serde_json::Value;
use tauri::{AppHandle, Manager};

/// 切换开发者工具
#[tauri::command]
pub async fn toggle_dev_tools(app_handle: AppHandle) -> Result<Value, String> {
    match app_handle.get_webview_window("main") {
        Some(window) => {
            #[cfg(debug_assertions)]
            {
                if window.is_devtools_open() {
                    window.close_devtools();
                    Ok(serde_json::json!({
                        "success": true,
                        "message": "开发者工具已关闭"
                    }))
                } else {
                    window.open_devtools();
                    Ok(serde_json::json!({
                        "success": true,
                        "message": "开发者工具已打开"
                    }))
                }
            }

            #[cfg(not(debug_assertions))]
            {
                Ok(serde_json::json!({
                    "success": false,
                    "message": "开发者工具仅在调试模式下可用"
                }))
            }
        }
        None => Ok(serde_json::json!({
            "success": false,
            "message": "未找到主窗口"
        })),
    }
}

/// 退出应用程序
#[tauri::command]
pub async fn quit_app(app_handle: AppHandle) -> Result<Value, String> {
    app_handle.exit(0);
    Ok(serde_json::json!({
        "success": true,
        "message": "应用程序即将退出"
    }))
}
