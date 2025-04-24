import { NodePlopAPI } from "plop";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (plop: NodePlopAPI) {
  // ここで、ジェネレーターの定義を行います
  plop.setGenerator("storybook", {
    description: "Generate Storybook story file",
    prompts: [
      {
        type: "input",
        name: "path",
        message: "ディレクトリ名を入力してください（例：components/Atoms）",
      },
      {
        type: "list",
        name: "componentInfo",
        message: "コンポーネントを選択してください",
        choices: (answers) => {
          const dirPath = path.resolve(__dirname, "../../../src", answers.path);
          if (!fs.existsSync(dirPath))
            return ["(ディレクトリが見つかりません)"];

          const choices: {
            name: string;
            value: { componentName: string; combinedPath: string };
          }[] = [];

          const walk = (dir: string) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory()) {
                walk(fullPath);
              } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
                const relativePath = path.relative(dirPath, fullPath);
                const componentName = path.basename(relativePath, ".tsx");
                const componentPath = path
                  .dirname(relativePath)
                  .replace(/\\/g, "/"); // Windows対策

                const combinedPath = `${
                  answers.path && answers.path !== "." ? `${answers.path}/` : ""
                }${componentPath}`;

                choices.push({
                  name:
                    combinedPath !== "."
                      ? `${combinedPath}/${componentName}`
                      : componentName,
                  value: { componentName, combinedPath },
                });
              }
            }
          };

          walk(dirPath);
          return choices.length > 0
            ? choices
            : ["(対象の .tsx ファイルが見つかりません)"];
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "../../storybook/{{componentInfo.combinedPath}}/{{componentInfo.componentName}}.stories.ts",
        templateFile: "../templates/storybook.hbs",
      },
    ],
  });
}