import { promisify } from "util";
import glob from "glob";
import path from "path";
import packageJSON from "../package.json";

const asyncGlob = promisify(glob);

function isInDirectory(directory: string, file: string) {
  const relative = path.relative(directory, file);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

export default async function getAffectedPackages(affectedFiles: string[]) {
  const packageDirs = await asyncGlob(packageJSON.workspaces[0]);

  const getAffectedPackage = (file: string) =>
    packageDirs.find(packageDir => isInDirectory(packageDir, file));

  const affectedPackages = affectedFiles
    .map(getAffectedPackage)
    .filter(pkg => !!pkg);
    
  return [...new Set(affectedPackages)];
}
