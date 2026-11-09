import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
    entry: ["src/index.ts"],
    sourceBase: "src",
    outDir: "dist",
    minify: true,
    plugins: [
        copy(["src/views/index.ejs"]).to("views/index.ejs"),
        // create empty logs folder in dist
        copy(["src/.gitkeep"]).to("logs/.gitkeep"),
    ],
});
