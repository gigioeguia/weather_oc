import { runMenu } from "./presentation/menu.ts";

runMenu().catch((error) => {
  console.error(`Error inesperado: ${String(error)}`);
  process.exit(1);
});
