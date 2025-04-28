import fs from "fs-extra";
import * as path from "node:path";

const filePath = path.join('../dist', "about", 'index.html');
// @ts-ignore
await fs.ensureDir(path.dirname(filePath));
// @ts-ignore
await fs.writeFile(filePath,`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h1>Generated about</h1>
</body>
</html>
` );
console.log("Successfully generated test page");

