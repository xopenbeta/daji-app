mod manager;
mod tauri_command;
mod tray;
mod types;
mod utils;
mod window;

use tauri_command::file_commands::*;
use tauri_command::system_info_commands::*;
use tauri_plugin_log::{Target, TargetKind};
use tauri::Manager;

// 在移动端构建时：相当于给 run 函数加上 #[tauri::mobile_entry_point]，让它成为移动端入口。
// 在桌面端构建时：不会添加这个属性，run 只是普通函数，你通常会在 main() 里调用它。
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            log::info!("检测到尝试启动新实例");
            log::info!("启动参数: {:?}", args);
            log::info!("工作目录: {}", cwd);
            
            // 获取主窗口并聚焦
            if let Some(window) = app.get_webview_window("main") {
                // 显示窗口（如果被最小化）
                if let Err(e) = window.show() {
                    log::error!("显示窗口失败: {}", e);
                }
                
                // 取消最小化
                if let Err(e) = window.unminimize() {
                    log::error!("取消最小化失败: {}", e);
                }
                
                // 聚焦窗口
                if let Err(e) = window.set_focus() {
                    log::error!("聚焦窗口失败: {}", e);
                } else {
                    log::info!("成功聚焦现有实例的主窗口");
                }
            } else {
                log::warn!("未找到主窗口");
            }
        }))
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            log::info!("应用启动成功");

            // 设置系统托盘
            if let Err(e) = tray::setup_tray(app.handle()) {
                log::error!("设置系统托盘失败: {}", e);
            }

            // 设置窗口事件处理器
            if let Err(e) = window::setup_window_events(app.handle()) {
                log::error!("设置窗口事件失败: {}", e);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 文件相关命令
            open_file_dialog,
            open_files_dialog,
            open_folder_dialog,
            open_in_file_manager,
            toggle_dev_tools,
            quit_app,
        ])
        .on_window_event(|_window, event| {
            match event {
                tauri::WindowEvent::CloseRequested { .. } => {
                    // // 在窗口关闭时清理 Shell 管理器
                    // let _ = cleanup_shell_manager();
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
