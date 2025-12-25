use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

/// 统一的命令响应结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandResponse {
    pub success: bool,
    pub msg: String,
    pub data: Option<Value>,
}

impl CommandResponse {
    pub fn success(msg: String, data: Option<Value>) -> Self {
        Self {
            success: true,
            msg,
            data,
        }
    }

    pub fn error(msg: String) -> Self {
        Self {
            success: false,
            msg,
            data: None,
        }
    }
}
