#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(serde::Serialize, Clone)]
struct FileEntry {
    name: String,
    path: String,
}

#[derive(serde::Serialize, Clone)]
struct Project {
    path: String,
    files: Vec<FileEntry>,
}

#[derive(serde::Deserialize)]
struct ProjectConfig {
    name: String,
    description: String,
    packages: Vec<String>,
}

#[tauri::command]
fn initialize_project(path: String, config: Option<ProjectConfig>) -> Result<(), String> {
    let project_path = Path::new(&path);
    if project_path.exists() {
        return Err(format!("Directory '{}' already exists.", path));
    }
    fs::create_dir_all(&project_path).map_err(|e| e.to_string())?;

    // Get configuration or use defaults
    let config = config.unwrap_or(ProjectConfig {
        name: "new-project".to_string(),
        description: "".to_string(),
        packages: vec!["express".to_string()],
    });

    // Generate package.json with selected packages
    let dependencies = generate_dependencies(&config.packages);
    let package_json_content = format!(r#"{{
  "name": "{}",
  "version": "1.0.0",
  "description": "{}",
  "main": "index.js",
  "scripts": {{
    "start": "node index.js",
    "dev": "nodemon index.js"
  }},
  "dependencies": {{
{}
  }}
}}"#, 
        config.name.replace(' ', "-").to_lowercase(),
        config.description,
        dependencies
    );
    
    fs::write(project_path.join("package.json"), package_json_content).map_err(|e| e.to_string())?;

    // Generate index.js with package-specific setup
    let index_js_content = generate_index_js(&config.packages);
    fs::write(project_path.join("index.js"), index_js_content).map_err(|e| e.to_string())?;

    // Create .env file if dotenv is selected
    if config.packages.contains(&"dotenv".to_string()) {
        let env_content = r#"# Environment variables
PORT=3000
NODE_ENV=development
"#;
        fs::write(project_path.join(".env"), env_content).map_err(|e| e.to_string())?;
    }

    // Run npm install
    let status = Command::new("npm")
        .arg("install")
        .current_dir(&project_path)
        .status()
        .map_err(|e| e.to_string())?;

    if !status.success() {
        return Err("`npm install` failed".to_string());
    }

    Ok(())
}

fn generate_dependencies(packages: &[String]) -> String {
    let mut deps = Vec::new();
    
    for package in packages {
        let version = match package.as_str() {
            "express" => "^4.18.2",
            "cors" => "^2.8.5",
            "helmet" => "^7.0.0",
            "morgan" => "^1.10.0",
            "dotenv" => "^16.3.1",
            "jsonwebtoken" => "^9.0.0",
            "bcrypt" => "^5.1.0",
            "mongoose" => "^7.4.0",
            "sequelize" => "^6.32.1",
            "joi" => "^17.9.2",
            "nodemailer" => "^6.9.4",
            _ => "^1.0.0",
        };
        deps.push(format!("    \"{}\": \"{}\"", package, version));
    }
    
    deps.join(",\n")
}

fn generate_index_js(packages: &[String]) -> String {
    let mut requires = Vec::new();
    let mut middleware = Vec::new();
    let mut config_lines = Vec::new();
    
    // Always include express
    requires.push("const express = require('express');".to_string());
    requires.push("const app = express();".to_string());
    
    // Add dotenv config if selected
    if packages.contains(&"dotenv".to_string()) {
        requires.insert(0, "require('dotenv').config();".to_string());
        config_lines.push("const port = process.env.PORT || 3000;".to_string());
    } else {
        config_lines.push("const port = 3000;".to_string());
    }
    
    // Add package-specific requires and middleware
    for package in packages {
        match package.as_str() {
            "cors" => {
                requires.push("const cors = require('cors');".to_string());
                middleware.push("app.use(cors());".to_string());
            },
            "helmet" => {
                requires.push("const helmet = require('helmet');".to_string());
                middleware.push("app.use(helmet());".to_string());
            },
            "morgan" => {
                requires.push("const morgan = require('morgan');".to_string());
                middleware.push("app.use(morgan('combined'));".to_string());
            },
            _ => {}
        }
    }
    
    // Add JSON parsing middleware
    middleware.push("app.use(express.json());".to_string());
    middleware.push("app.use(express.urlencoded({ extended: true }));".to_string());
    
    let mut content = Vec::new();
    content.extend(requires);
    content.push("".to_string());
    content.extend(config_lines);
    content.push("".to_string());
    content.extend(middleware);
    content.push("".to_string());
    content.push("app.get('/', (req, res) => {".to_string());
    content.push("  res.json({ message: 'Hello World!' });".to_string());
    content.push("});".to_string());
    content.push("".to_string());
    content.push("app.listen(port, () => {".to_string());
    content.push("  console.log(`Server running at http://localhost:${port}`);".to_string());
    content.push("});".to_string());
    
    content.join("\n")
}

#[tauri::command]
fn load_project(path: String) -> Result<Project, String> {
    let project_path = Path::new(&path);
    if !project_path.exists() || !project_path.is_dir() {
        return Err(format!("'{}' is not a valid directory.", path));
    }

    let mut files = Vec::new();
    for entry in fs::read_dir(project_path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            files.push(FileEntry {
                name: entry.file_name().to_string_lossy().to_string(),
                path: path.to_string_lossy().to_string(),
            });
        }
    }

    Ok(Project {
        path: path.clone(),
        files,
    })
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn generate_code(project_description: String, user_stories: Vec<String>) -> Result<String, String> {
    // MVP: Simple template generation.
    let routes = user_stories.iter().map(|story| {
        let route_name = story.to_lowercase().replace(" ", "-").replace("user-wants-to-", "");
        format!(r#"
// User Story: {}
app.get('/{}', (req, res) => {{
  res.send('Response for {}');
}});
"#, story, route_name, route_name)
    }).collect::<Vec<String>>().join("\n");

    let code = format!(r#"const express = require('express');
const app = express();

{}

module.exports = app;
"#, routes);

    Ok(code)
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            initialize_project,
            load_project,
            read_file,
            write_file,
            generate_code
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
