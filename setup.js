const fs = require("fs");
const path = require("path");

const structure = {
  src: {
    config: ["db.js", "passport.js"],
    models: ["User.js", "Todo.js"],
    controllers: ["authController.js", "todoController.js"],
    routes: ["authRoutes.js", "todoRoutes.js"],
    middlewares: ["authMiddleware.js"],
    files: ["server.js"]
  },
  rootFiles: [".env", ".gitignore", "package.json", "README.md"]
};

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created: ${dirPath}`);
  }
}

function createFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    console.log(`📄 Created: ${filePath}`);
  }
}

function setupProject(basePath) {
  // src folder
  const srcPath = path.join(basePath, "src");
  createDir(srcPath);

  // src subfolders
  for (const [folder, content] of Object.entries(structure.src)) {
    if (folder === "files") {
      content.forEach(file =>
        createFile(path.join(srcPath, file))
      );
    } else {
      const folderPath = path.join(srcPath, folder);
      createDir(folderPath);
      content.forEach(file =>
        createFile(path.join(folderPath, file))
      );
    }
  }

  // root files
  structure.rootFiles.forEach(file =>
    createFile(path.join(basePath, file))
  );
}

setupProject(process.cwd());

console.log("✅ Project structure created successfully!");
