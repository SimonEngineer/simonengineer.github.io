import fs from "fs-extra";
import * as path from "node:path";

type FilePathType = {
    filePath: string;
    children?: string[];
}

type JsonRoutes = {
    routes: {
        '__root__': FilePathType,
        '/': FilePathType,
        [key: string]: FilePathType,
    }
}




const routesDescriptionFilePath = path.join("../src", 'routeTree.gen.ts');


// @ts-ignore
const routesFile = await fs.readFile(routesDescriptionFilePath)
const routeTree = JSON.parse(routesFile.toString().split("/* ROUTE_MANIFEST_START")[1].replace("ROUTE_MANIFEST_END */", "")) as JsonRoutes
const nonRootRoutes = Object.keys(routeTree.routes).filter((route) => route !== "__root__" && route !== "/")

for (const route of nonRootRoutes) {
    const filePath = path.join('../dist', route, 'index.html');
    // @ts-ignore
    await fs.ensureDir(path.dirname(filePath));
    // @ts-ignore
    await fs.writeFile(filePath, `
<!DOCTYPE html>
<html lang="en">
<head>
<title>Redirection ${route}</title>
 <script>
        window.onload = function() {
            window.location.href = '${route}' + window.location.search; // Redirect on page load
        };
    </script>
</head>
<body>
<h1>Redirecting to ${route}</h1>
</body>
</html>
`);

}
console.log("Generated dummy pages to redirect back to Tanstack Router");
