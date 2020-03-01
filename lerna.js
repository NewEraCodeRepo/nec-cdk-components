const { loadPackages, iter, exec } = require("lerna-script");
const { join, basename, dirname } = require("path");
const {
  extraneous,
  unmanaged,
  sync,
  latest
} = require("lerna-script-tasks-dependencies");

module.exports["deps:sync"] = sync();
module.exports["deps:extraneous"] = extraneous();
module.exports["deps:unmanaged"] = unmanaged();

/**
 * Lerna script that iterates packages
 * looking for lambdas to archive.
 */
module.exports.packageLambda = async log => {
  try {
    log.info("packaging lambdas in all modules that have them");
    const packages = await loadPackages();

    const zipScript = join(process.cwd(), "scripts", "lerna", "zip");

    const lambdaProperties = lambdaLocation => {
      const packageName = basename(dirname(lambdaLocation));
      const packageLocation = join(process.cwd(), "packages", packageName);
      return {
        packageName,
        packageLocation
      };
    };

    return await iter.parallel(packages)(lernaPackage => {
      if (basename(lernaPackage.location) === "lambda_packages") {
        const { packageName, packageLocation } = lambdaProperties(
          lernaPackage.location
        );
        exec.command(lernaPackage)(
          `${zipScript} ${packageName} ${packageLocation}`
        );
      }
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Lerna script that writes an .npmrc files to each
 * package
 */
module.exports.writeNpmrc = async log => {
  try {
    log.info("writing .npmrc files in npm packages");
    const packages = await loadPackages();

    const writeNpmrcScript = join(
      process.cwd(),
      "scripts",
      "lerna",
      "writeNpmrc"
    );
    exec.command(process.cwd())(`${writeNpmrcScript} .`);

    return await iter.parallel(packages)(lernaPackage => {
      const typeOfPackage = basename(dirname(lernaPackage.location));
      if (typeOfPackage === "packages") {
        exec.command(lernaPackage)(`${writeNpmrcScript} .`);
      }
    });
  } catch (error) {
    log.info(error);
    throw error;
  }
};

/**
 * Lerna script that updates npm mods in root
 * and all packages
 * @todo get rid of lerna-script error:
 * (node:7700) MaxListenersExceededWarning:
 * Possible EventEmitter memory leak detected.
 * 11 close listeners added. Use emitter.setMaxListeners() to increase limit
 */
module.exports.updateNpmMods = async log => {
  try {
    log.info("updating npm mods");
    const packages = await loadPackages();

    const updateNpmModScript = join(
      process.cwd(),
      "scripts",
      "lerna",
      "updateMods"
    );
    exec.command(process.cwd(), { silent: false })(
      `${updateNpmModScript} ${process.cwd()}`
    );

    return await iter.forEach(packages)(lernaPackage => {
      exec.command(lernaPackage, { silent: false })(
        `${updateNpmModScript} ${lernaPackage.location}`
      );
    });
  } catch (error) {
    log.info(error);
    throw error;
  }
};
